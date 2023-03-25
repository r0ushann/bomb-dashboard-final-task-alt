// import { Fetcher, Route, Token } from '@uniswap/sdk';
//import { Fetcher as FetcherSpirit, Token as TokenSpirit } from '@spiritswap/sdk';
import { Fetcher, Route, Token } from '@pancakeswap/sdk';
import { Configuration } from './config';
import { MaxiInfo, ContractName, TokenStat, AllocationTime, LPStat, Bank, PoolStats, BShareSwapperStat } from './types';
import { BigNumber, Contract, ethers, EventFilter } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import ERC20 from './ERC20';
import { getFullDisplayBalance, getDisplayBalance } from '../utils/formatBalance';
import { getDefaultProvider } from '../utils/provider';
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import IBombBorrowableABI from './IBombBorrowable.abi.json';

import config, { bankDefinitions } from '../config';
import moment from 'moment';
import { parseUnits } from 'ethers/lib/utils';
import { BNB_TICKER, SPOOKY_ROUTER_ADDR, BOMB_TICKER } from '../utils/constants';
import { bombMaxi } from '../services/graph';

/**
 * An API module of Bomb Money contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class BombFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  externalTokens: { [name: string]: ERC20 };
  boardroomVersionOfUser?: string;

  BOMBBTCB_LP: Contract;
  BOMB: ERC20;
  BUSD: ERC20;
  BSHARE: ERC20;
  BBOND: ERC20;
  XBOMB: ERC20;
  BNB: ERC20;
  BTC: ERC20;
  BOMB_BORROWABLE: Contract;
  BTCB_BORROWABLE: Contract;
  BBOMB_BOMB: ERC20;
  BBOMB_BTCB: ERC20;
  BBOMBBOMB: ERC20;
  BBOMBBTCB: ERC20;
  BUSMBUSD_LP: Contract;
  BUSM: ERC20;
  BOMB_MAXI: ERC20;
  BSHARE_MAXI: ERC20;

  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }
    this.externalTokens = {};
    for (const [symbol, [address, decimal]] of Object.entries(externalTokens)) {
      this.externalTokens[symbol] = new ERC20(address, provider, symbol, decimal);
    }
    this.BOMB = new ERC20(deployments.Bomb.address, provider, 'BOMB');
    this.BSHARE = new ERC20(deployments.BShare.address, provider, 'BSHARE');
    this.BBOND = new ERC20(deployments.BBond.address, provider, 'BBOND');
    this.BNB = this.externalTokens['WBNB'];
    this.BTC = this.externalTokens['BTCB'];
    this.XBOMB = new ERC20(deployments.xBOMB.address, provider, 'XBOMB');
    this.BUSM = this.externalTokens['BUSM'];
    this.BUSD = this.externalTokens['BUSD'];

    // this.BBOMB_BOMB = new ERC20(deployments.BombBorrowable.address, provider, 'bBOMB');
    // this.BBOMB_BTCB = new ERC20(deployments.BtcbBorrowable.address, provider, 'bBOMB');

    // this.BBOMB_BOMB = new Contract(externalTokens['BBOMB-BOMB'][0], IBombBorrowableABI, provider);
    // this.BBOMB_BTCB = new Contract(externalTokens['BBOMB-BTCB'][0], IBombBorrowableABI, provider);
    this.BBOMB_BOMB = new ERC20(deployments.BombBorrowable.address, provider, 'bBOMB');
    this.BBOMBBOMB = this.externalTokens['BBOMB-BOMB'];
    this.BBOMBBTCB = this.externalTokens['BBOMB-BTCB'];

    this.BBOMB_BTCB = new ERC20(deployments.BtcbBorrowable.address, provider, 'bBOMB');
    this.BOMB_BORROWABLE = new Contract(externalTokens['BBOMB-BOMB'][0], IBombBorrowableABI, provider);
    this.BTCB_BORROWABLE = new Contract(externalTokens['BBOMB-BTCB'][0], IBombBorrowableABI, provider);

    this.BOMB_MAXI = new ERC20(deployments.BombMaxiLPBShareRewardPool.address, provider, '80BOMB-20BTCB-LP');
    this.BSHARE_MAXI = new ERC20(deployments.BshareMaxiLPBShareRewardPool.address, provider, '80BSHARE-20WBNB-LP');

    // Uniswap V2 Pair

    this.BOMBBTCB_LP = new Contract(externalTokens['BOMB-BTCB-LP'][0], IUniswapV2PairABI, provider);
    this.BUSMBUSD_LP = new Contract(externalTokens['BUSM-BUSD-LP'][0], IUniswapV2PairABI, provider);

    this.config = cfg;
    this.provider = provider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.config.chainId);
    this.signer = newProvider.getSigner(0);
    this.myAccount = account;
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
    const tokens = [this.BOMB, this.BSHARE, this.BBOND, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.BOMBBTCB_LP = this.BOMBBTCB_LP.connect(this.signer);
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchBoardroomVersionOfUser()
      .then((version) => (this.boardroomVersionOfUser = version))
      .catch((err) => {
        console.error(`Failed to fetch boardroom version: ${err}`);
        this.boardroomVersionOfUser = 'latest';
      });
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //===================FROM APE TO DISPLAY =========================
  //=========================IN HOME PAGE==============================
  //===================================================================

  async getBombStat(): Promise<TokenStat> {
    const { BombRewardPool, BombGenesisRewardPool } = this.contracts;
    const supply = await this.BOMB.totalSupply();
    const bombRewardPoolSupply = await this.BOMB.balanceOf(BombGenesisRewardPool.address);
    const bombRewardPoolSupply2 = await this.BOMB.balanceOf(BombRewardPool.address);
    const bombCirculatingSupply = supply.sub(bombRewardPoolSupply).sub(bombRewardPoolSupply2);
    //  const priceInBNB = await this.getTokenPriceFromPancakeswap(this.BOMB);
    //const priceInBNBstring = priceInBNB.toString();
    const priceInBTC = await this.getTokenPriceFromPancakeswapBTC(this.BOMB);
    // const priceOfOneBNB = await this.getWBNBPriceFromPancakeswap();
    const priceOfOneBTC = await this.getBTCBPriceFromPancakeswap();
    //const priceInDollars = await this.getTokenPriceFromPancakeswapBOMBUSD();
    const priceOfBombInDollars = ((Number(priceInBTC) * Number(priceOfOneBTC)) / 10000).toFixed(2);
    //console.log('priceOfBombInDollars', priceOfBombInDollars);

    return {
      //  tokenInFtm: (Number(priceInBNB) * 100).toString(),
      tokenInFtm: priceInBTC.toString(),
      priceInDollars: priceOfBombInDollars,
      totalSupply: getDisplayBalance(supply, this.BOMB.decimal, 0),
      circulatingSupply: getDisplayBalance(bombCirculatingSupply, this.BOMB.decimal, 0),
    };
  }

  async getBTCPriceUSD(): Promise<Number> {
    const priceOfOneBTC = await this.getBTCBPriceFromPancakeswap();
    return Number(priceOfOneBTC);
  }

  /**
   * Calculates various stats for the requested LP
   * @param name of the LP token to load stats for
   * @returns
   */
  async getLPStat(name: string): Promise<LPStat> {
    // console.log('NAME', name);

    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = name.startsWith('BOMB') ? this.BOMB : this.BSHARE;
    // console.log('NAME', name);

    const isBomb = name.startsWith('BOMB');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const ftmAmountBN = await this.BNB.balanceOf(lpToken.address);
    const ftmAmount = getDisplayBalance(ftmAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const ftmAmountInOneLP = Number(ftmAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isBomb);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(2).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(2).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(2).toString(),
      ftmAmount: ftmAmountInOneLP.toFixed(2).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(2).toString(),
    };
  }

  async getLPStatBTC(name: string): Promise<LPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = name.startsWith('BOMB') ? this.BOMB : this.BSHARE;
    const isBomb = name.startsWith('BOMB');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const btcAmountBN = await this.BTC.balanceOf(lpToken.address);
    const btcAmount = getDisplayBalance(btcAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const ftmAmountInOneLP = Number(btcAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isBomb);

    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(2).toString();

    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(2).toString();

    return {
      tokenAmount: tokenAmountInOneLP.toFixed(2).toString(),
      ftmAmount: ftmAmountInOneLP.toFixed(5).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(2).toString(),
    };
  }
  /**
   * Use this method to get price for Bomb
   * @returns TokenStat for BBOND
   * priceInBNB
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async getBondStat(): Promise<TokenStat> {
    const { Treasury } = this.contracts;
    const bombStat = await this.getBombStat();
    const bondBombRatioBN = await Treasury.getBondPremiumRate();
    const modifier = bondBombRatioBN / 1e14 > 1 ? bondBombRatioBN / 1e14 : 1;
    const bondPriceInBNB = (Number(bombStat.tokenInFtm) * modifier).toFixed(4);
    const priceOfBBondInDollars = (Number(bombStat.priceInDollars) * modifier).toFixed(4);
    const supply = await this.BBOND.displayedTotalSupply();
    return {
      tokenInFtm: bondPriceInBNB,
      priceInDollars: priceOfBBondInDollars,
      totalSupply: supply,
      circulatingSupply: supply,
    };
  }

  /**
   * @returns TokenStat for BSHARE
   * priceInBNB
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async getShareStat(): Promise<TokenStat> {
    const { BShareRewardPool } = this.contracts;

    const supply = await this.BSHARE.totalSupply();

    const priceInBNB = await this.getTokenPriceFromPancakeswap(this.BSHARE);
    const bombRewardPoolSupply = await this.BSHARE.balanceOf(BShareRewardPool.address);
    const tShareCirculatingSupply = supply.sub(bombRewardPoolSupply);
    const priceOfOneBNB = await this.getWBNBPriceFromPancakeswap();
    const priceOfSharesInDollars = (Number(priceInBNB) * Number(priceOfOneBNB)).toFixed(2);

    return {
      tokenInFtm: priceInBNB,
      priceInDollars: priceOfSharesInDollars,
      totalSupply: getDisplayBalance(supply, this.BSHARE.decimal, 0),
      circulatingSupply: getDisplayBalance(tShareCirculatingSupply, this.BSHARE.decimal, 0),
    };
  }

  async getBombStatInEstimatedTWAP(): Promise<TokenStat> {
    const { Oracle, BombRewardPool } = this.contracts;
    const expectedPrice = await Oracle.twap(this.BOMB.address, ethers.utils.parseEther('10000'));

    const supply = await this.BOMB.totalSupply();
    const bombRewardPoolSupply = await this.BOMB.balanceOf(BombRewardPool.address);
    const bombCirculatingSupply = supply.sub(bombRewardPoolSupply);
    return {
      tokenInFtm: getDisplayBalance(expectedPrice),
      priceInDollars: getDisplayBalance(expectedPrice),
      totalSupply: getDisplayBalance(supply, this.BOMB.decimal, 0),
      circulatingSupply: getDisplayBalance(bombCirculatingSupply, this.BOMB.decimal, 0),
    };
  }

  async getBombPriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBombUpdatedPrice();
  }

  // async getBombPegTWAP(): Promise<any> {
  //   const { Treasury } = this.contracts;
  //   const updatedPrice = Treasury.getBombUpdatedPrice();
  //   const updatedPrice2 = updatedPrice * 10000;
  //   return updatedPrice2;
  // }

  async getBondsPurchasable(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    // const burnableBomb = (Number(Treasury.getBurnableBombLeft()) * 1000).toFixed(2).toString();
    return Treasury.getBurnableBombLeft();
  }

  async getBombMaxiStats(poolId: string): Promise<MaxiInfo> {
    const BombMaxi = await bombMaxi(poolId);
    return {
      totalShares: BombMaxi.data.pool.totalShares.toString(),
      totalLiquidity: BombMaxi.data.pool.totalLiquidity.toString(),

      // tokenAmount: tokenAmountInOneLP.toFixed(2).toString(),
      // ftmAmount: ftmAmountInOneLP.toFixed(2).toString(),
      // priceOfOne: lpTokenPriceFixed,
      // totalLiquidity: liquidity,
      // totalSupply: Number(lpTokenSupply).toFixed(2).toString(),
    };
  }

  /**
   * Calculates the TVL, APR and daily APR of a provided pool/bank
   * @param bank
   * @returns
   */
  async getPoolAPRs(bank: Bank): Promise<PoolStats> {
    if (this.myAccount === undefined) return;
    let depositToken = bank.depositToken;
    // if (depositToken.symbol === '80BOMB-20BTCB-LP' || depositToken.symbol === '80BSHARE-20WBNB-LP') {
    //   const temp = 'TBD';
    //   return {
    //     dailyAPR: temp,
    //     yearlyAPR: temp,
    //     TVL: temp,
    //   };
    // }
    const poolContract = this.contracts[bank.contract];
    let depositTokenValue: ERC20
    if (bank.depositTokenName === "BBOND") {
      depositTokenValue = this.BOMB
    } else {
      depositTokenValue = depositToken
    }
    const depositTokenPrice = await this.getDepositTokenPriceInDollars(bank.depositTokenName, depositTokenValue);
    const stakeInPool = await depositToken.balanceOf(bank.address);
    const TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const stat = bank.earnTokenName === 'BOMB' ? await this.getBombStat() : await this.getShareStat();
    const tokenPerSecond = await this.getTokenPerSecond(
      bank.earnTokenName,
      bank.contract,
      poolContract,
      bank.depositTokenName,
    );

    const tokenPerHour = tokenPerSecond.mul(60).mul(60);
    const totalRewardPricePerYear =
      Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
    const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));
    const totalStakingTokenInPool =
      Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
    const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;
    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
  }

  async getXbombAPR(): Promise<PoolStats> {
    if (this.myAccount === undefined) return;
    const bombToken = this.BOMB;
    const xbombToken = this.XBOMB;

    const xbombExchange = await this.getXbombExchange();
    const xbombPercent = await xbombExchange;
    const xbombPercentTotal = (Number(xbombPercent) / 1000000000000000000) * 100 - 100;

    const depositTokenPrice = await this.getDepositTokenPriceInDollars(bombToken.symbol, bombToken);

    const stakeInPool = await bombToken.balanceOf(xbombToken.address);

    const TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, bombToken.decimal));

    const startDate = new Date('January 24, 2022');
    const nowDate = new Date(Date.now());
    const difference = nowDate.getTime() - startDate.getTime();
    const days = difference / 60 / 60 / 24 / 1000;
    const aprPerDay = xbombPercentTotal / days;

    // Determine days between now and a date

    // const tokenPerHour = tokenPerSecond.mul(60).mul(60);
    // const totalRewardPricePerYear =
    //   Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
    // const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));
    // const totalStakingTokenInPool =
    //   Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    // const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
    // const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;

    const dailyAPR = aprPerDay;
    const yearlyAPR = aprPerDay * 365;
    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
  }

  /**
   * Method to return the amount of tokens the pool yields per second
   * @param earnTokenName the name of the token that the pool is earning
   * @param contractName the contract of the pool/bank
   * @param poolContract the actual contract of the pool
   * @returns
   */
  async getTokenPerSecond(
    earnTokenName: string,
    contractName: string,
    poolContract: Contract,
    depositTokenName: string,
  ) {
    if (earnTokenName === 'BOMB') {
      if (!contractName.endsWith('BombRewardPool')) {
        const rewardPerSecond = await poolContract.tSharePerSecond();
        if (depositTokenName === 'WBNB') {
          return rewardPerSecond.mul(6000).div(11000).div(24);
        } else if (depositTokenName === 'CAKE') {
          return rewardPerSecond.mul(2500).div(11000).div(24);
        } else if (depositTokenName === 'SUSD') {
          return rewardPerSecond.mul(1000).div(11000).div(24);
        } else if (depositTokenName === 'SVL') {
          return rewardPerSecond.mul(1500).div(11000).div(24);
        }
        return rewardPerSecond.div(24);
      }
      const poolStartTime = await poolContract.poolStartTime();
      const startDateTime = new Date(poolStartTime.toNumber() * 1000);
      const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
      if (Date.now() - startDateTime.getTime() > FOUR_DAYS) {
        return await poolContract.epochBombPerSecond(1);
      }
      return await poolContract.epochBombPerSecond(0);
    }
    const rewardPerSecond = await poolContract.tSharePerSecond();
    if (depositTokenName.startsWith('BOMB-BTCB')) {
      return rewardPerSecond.mul(400).div(1000);
    } else if (depositTokenName.startsWith('BOMB-BSHARE')) {
      return rewardPerSecond.mul(0).div(1000);
    } else if (depositTokenName.startsWith('BOMB')) {
      return rewardPerSecond.mul(0).div(1000);
    } else if (depositTokenName.startsWith('BBOND')) {
      return rewardPerSecond.mul(150).div(1000);
    } else if (depositTokenName.startsWith('BUSM-BUSD')) {
      return rewardPerSecond.mul(50).div(1000);
    } else if (depositTokenName.startsWith('80BOMB')) {
      return rewardPerSecond.mul(200).div(1000);
    } else if (depositTokenName.startsWith('80BSHARE')) {
      return rewardPerSecond.mul(50).div(1000);
    } else {
      return rewardPerSecond.mul(150).div(1000);
    }
    // if (depositTokenName.startsWith('BOMB-BTCB')) {
    //   return rewardPerSecond.mul(41650).div(10000);
    // } else if (depositTokenName.startsWith('BOMB-BSHARE')) {
    //   return rewardPerSecond.mul(0).div(119000);
    // } else if (depositTokenName.startsWith('BOMB')) {
    //   return rewardPerSecond.mul(59500).div(10000);
    // } else {
    //   return rewardPerSecond.mul(17850).div(10000);
    // }
  }

  /**
   * Method to calculate the tokenPrice of the deposited asset in a pool/bank
   * If the deposited token is an LP it will find the price of its pieces
   * @param tokenName
   * @param pool
   * @param token
   * @returns
   */
  async getDepositTokenPriceInDollars(tokenName: string, token: ERC20) {
    let tokenPrice;
    const priceOfOneFtmInDollars = await this.getWBNBPriceFromPancakeswap();
    if (tokenName === 'WBNB') {
      tokenPrice = priceOfOneFtmInDollars;
    } else {
      if (tokenName === 'BOMB-BTCB-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.BOMB, true);
      } else if (tokenName === 'BSHARE-BNB-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.BSHARE, false);
      } else if (tokenName === 'BOMB-BSHARE-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.BOMB, true);
        // } else if (tokenName === 'BSHARE-BNB-APELP') {
        //   tokenPrice = await this.getLPTokenPrice(token, this.BSHARE, false);
      } else if (tokenName === 'BUSM-BUSD-LP') {
        tokenPrice = await this.getBusdLPTokenPrice(token, this.BUSM, true);
      } else if (tokenName === '80BOMB-20BTCB-LP') {
        tokenPrice = await this.getMaxiLPTokenPrice(
          '0xd6f52e8ab206e59a1e13b3d6c5b7f31e90ef46ef000200000000000000000028',
        );
      } else if (tokenName === '80BSHARE-20WBNB-LP') {
        tokenPrice = await this.getMaxiLPTokenPrice(
          '0x2c374ed1575e5c2c02c569f627299e902a1972cb000200000000000000000027',
        );
      }
      else if (tokenName === 'BBOND') {
        tokenPrice = await this.getTokenPriceFromPancakeswap(this.BOMB);
        tokenPrice = (Number(tokenPrice) * Number(priceOfOneFtmInDollars)).toString();


      } else {
        tokenPrice = await this.getTokenPriceFromPancakeswap(token);
        tokenPrice = (Number(tokenPrice) * Number(priceOfOneFtmInDollars)).toString();
      }
    }
    //console.log({ tokenPrice });
    return tokenPrice;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //=========================== END ===================================
  //===================================================================

  async getCurrentEpoch(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.epoch();
  }

  async getBondOraclePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBondPremiumRate();
  }

  /**
   * Buy bonds with cash.
   * @param amount amount of cash to purchase bonds with.
   */
  async buyBonds(amount: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const treasuryBombPrice = await Treasury.getBombPrice();
    return await Treasury.buyBonds(decimalToBalance(amount), treasuryBombPrice);
  }

  /**
   * Redeem bonds for cash.
   * @param amount amount of bonds to redeem.
   */
  async redeemBonds(amount: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const priceForBomb = await Treasury.getBombPrice();

    return await Treasury.redeemBonds(decimalToBalance(amount), priceForBomb);
  }

  async getTotalValueLocked(): Promise<Number> {
    let totalValue = 0;
    for (const bankInfo of Object.values(bankDefinitions)) {
      const pool = this.contracts[bankInfo.contract];
      const token = this.externalTokens[bankInfo.depositTokenName];
      const tokenPrice = await this.getDepositTokenPriceInDollars(bankInfo.depositTokenName, token);
      const tokenAmountInPool = await token.balanceOf(pool.address);
      const value = Number(getDisplayBalance(tokenAmountInPool, token.decimal)) * Number(tokenPrice);
      const poolValue = Number.isNaN(value) ? 0 : value;
      totalValue += poolValue;
    }

    const BSHAREPrice = (await this.getShareStat()).priceInDollars;
    const BOMBPrice = (await this.getBombStat()).priceInDollars;

    const boardroomtShareBalanceOf = await this.BSHARE.balanceOf(this.currentBoardroom().address);
    const bombStakeBalanceOf = await this.BOMB.balanceOf(this.XBOMB.address);

    const boardroomTVL = Number(getDisplayBalance(boardroomtShareBalanceOf, this.BSHARE.decimal)) * Number(BSHAREPrice);
    const bombTVL = Number(getDisplayBalance(bombStakeBalanceOf, this.BOMB.decimal)) * Number(BOMBPrice);

    return totalValue + boardroomTVL + bombTVL;
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be BNB in most cases)
   * @param isBomb sanity check for usage of bomb token or tShare
   * @returns price of the LP token
   */
  async getLPTokenPrice(lpToken: ERC20, token: ERC20, isBomb: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isBomb === true ? await this.getBombStat() : await this.getShareStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);
    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be BNB in most cases)
   * @param isBomb sanity check for usage of bomb token or tShare
   * @returns price of the LP token
   */
  async getBusdLPTokenPrice(lpToken: ERC20, token: ERC20, isBomb: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    // const stat = isBomb === true ? await this.getBombStat() : await this.getShareStat();
    const priceToken = await this.getTokenPriceFromPancakeswapBUSD(this.BUSM);
    const priceOfToken = Number(priceToken);
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);
    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  async getMaxiLPTokenPrice(maxiPool: string): Promise<string> {
    const bombmaxi = await this.getBombMaxiStats(maxiPool);
    const totalShares = await bombmaxi.totalShares;
    //Get amount of tokenA
    const totalLiquidity = await bombmaxi.totalLiquidity;
    // const stat = isBomb === true ? await this.getBombStat() : await this.getShareStat();

    const tokenInLP = Number(totalLiquidity) / Number(totalShares);
    const tokenPrice = tokenInLP //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  async earnedFromBank(
    poolName: ContractName,
    earnTokenName: String,
    poolId: Number,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      if (earnTokenName === 'BOMB') {
        return await pool.pendingBOMB(poolId, account);
      } else {
        return await pool.pendingShare(poolId, account);
      }
    } catch (err) {
      console.error(`Failed to call pendingShare() on pool ${pool.address}: ${err}`);
      return BigNumber.from(0);
    }
  }

  async stakedBalanceOnBank(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      let userInfo = await pool.userInfo(poolId, account);
      return await userInfo.amount;
    } catch (err) {
      console.error(`Failed to call userInfo() on pool ${pool.address}: ${err}`);
      return BigNumber.from(0);
    }
  }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async stake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.deposit(poolId, amount);
  }

  /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async unstake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.withdraw(poolId, amount);
  }

  /**
   * Transfers earned token reward from given pool to my account.
   */
  async harvest(poolName: ContractName, poolId: Number): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    //By passing 0 as the amount, we are asking the contract to only redeem the reward and not the currently staked token
    return await pool.withdraw(poolId, 0);
  }

  /**
   * Harvests and withdraws deposited tokens from the pool.
   */
  async exit(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    let userInfo = await pool.userInfo(poolId, account);
    return await pool.withdraw(poolId, userInfo.amount);
  }

  async fetchBoardroomVersionOfUser(): Promise<string> {
    return 'latest';
  }

  currentBoardroom(): Contract {
    if (!this.boardroomVersionOfUser) {
      //throw new Error('you must unlock the wallet to continue.');
    }
    return this.contracts.Boardroom;
  }

  isOldBoardroomMember(): boolean {
    return this.boardroomVersionOfUser !== 'latest';
  }

  async getTokenPriceFromPancakeswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    //const { chainId } = this.config;
    const { WBNB } = this.config.externalTokens;

    const wftm = new Token(56, WBNB[0], WBNB[1], 'WBNB');
    const token = new Token(56, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wftmToToken = await Fetcher.fetchPairData(wftm, token, this.provider);
      const priceInBUSD = new Route([wftmToToken], token);
      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceFromPancakeswapBUSD(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    //const { chainId } = this.config;
    const { BUSD } = this.config.externalTokens;

    const wftm = new Token(56, BUSD[0], BUSD[1], 'BUSD');
    const token = new Token(56, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wftmToToken = await Fetcher.fetchPairData(wftm, token, this.provider);
      const priceInBUSD = new Route([wftmToToken], token);
      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceFromPancakeswapBTC(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    //const { chainId } = this.config;
    // const {WBNB} = this.config.externalTokens;

    // const wbnb = new Token(56, WBNB[0], WBNB[1]);
    const btcb = new Token(56, this.BTC.address, this.BTC.decimal, 'BTCB', 'BTCB');
    const token = new Token(56, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wftmToToken = await Fetcher.fetchPairData(btcb, token, this.provider);
      const priceInBUSD = new Route([wftmToToken], token);
      //   console.log('priceInBUSDBTC', priceInBUSD.midPrice.toFixed(12));

      const priceForPeg = Number(priceInBUSD.midPrice.toFixed(12)) * 10000;
      return priceForPeg.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceFromPancakeswapBOMBUSD(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    //const { chainId } = this.config;
    //const {WBNB} = this.config.externalTokens;

    //  const wbnb = new Token(56, WBNB[0], WBNB[1]);
    const btcb = new Token(56, this.BTC.address, this.BTC.decimal, 'BTCB', 'BTCB');
    const token = new Token(56, this.BOMB.address, this.BOMB.decimal, this.BOMB.symbol);
    try {
      const wftmToToken = await Fetcher.fetchPairData(btcb, token, this.provider);
      const priceInBUSD = new Route([wftmToToken], token);
      // console.log('test', priceInBUSD.midPrice.toFixed(12));

      const priceForPeg = Number(priceInBUSD.midPrice.toFixed(12)) * 10000;
      return priceForPeg.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${this.BOMB.symbol}: ${err}`);
    }
  }

  // async getTokenPriceFromSpiritswap(tokenContract: ERC20): Promise<string> {
  //   const ready = await this.provider.ready;
  //   if (!ready) return;
  //   const { chainId } = this.config;

  //   const { WBNB } = this.externalTokens;

  //   const wftm = new TokenSpirit(chainId, WBNB.address, WBNB.decimal);
  //   const token = new TokenSpirit(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
  //   try {
  //     const wftmToToken = await FetcherSpirit.fetchPairData(wftm, token, this.provider);
  //     const liquidityToken = wftmToToken.liquidityToken;
  //     let ftmBalanceInLP = await WBNB.balanceOf(liquidityToken.address);
  //     let ftmAmount = Number(getFullDisplayBalance(ftmBalanceInLP, WBNB.decimal));
  //     let shibaBalanceInLP = await tokenContract.balanceOf(liquidityToken.address);
  //     let shibaAmount = Number(getFullDisplayBalance(shibaBalanceInLP, tokenContract.decimal));
  //     const priceOfOneFtmInDollars = await this.getWBNBPriceFromPancakeswap();
  //     let priceOfShiba = (ftmAmount / shibaAmount) * Number(priceOfOneFtmInDollars);
  //     return priceOfShiba.toString();
  //   } catch (err) {
  //     console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
  //   }
  // }

  async getWBNBPriceFromPancakeswap(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { WBNB, FUSDT } = this.externalTokens;
    try {
      const fusdt_wftm_lp_pair = this.externalTokens['USDT-BNB-LP'];
      let ftm_amount_BN = await WBNB.balanceOf(fusdt_wftm_lp_pair.address);
      let ftm_amount = Number(getFullDisplayBalance(ftm_amount_BN, WBNB.decimal));
      let fusdt_amount_BN = await FUSDT.balanceOf(fusdt_wftm_lp_pair.address);
      let fusdt_amount = Number(getFullDisplayBalance(fusdt_amount_BN, FUSDT.decimal));
      return (fusdt_amount / ftm_amount).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of WBNB: ${err}`);
    }
  }

  async getBTCBPriceFromPancakeswap(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { BTCB } = this.externalTokens;
    try {
      const btcPriceInBNB = await this.getTokenPriceFromPancakeswap(BTCB);

      const wbnbPrice = await this.getWBNBPriceFromPancakeswap();

      const btcprice = (Number(btcPriceInBNB) * Number(wbnbPrice)).toFixed(2).toString();
      //console.log('btcprice', btcprice);
      return btcprice;
    } catch (err) {
      console.error(`Failed to fetch token price of BTCB: ${err}`);
    }
  }

  // async getBTCBPriceFromPancakeswap(): Promise<string> {
  //   const ready = await this.provider.ready;
  //   if (!ready) return;
  //   const { BTCB, FUSDT } = this.externalTokens;
  //   try {
  //     const fusdt_btcb_lp_pair = this.externalTokens['USDT-BTCB-LP'];
  //     let ftm_amount_BN = await BTCB.balanceOf(fusdt_btcb_lp_pair.address);
  //     let ftm_amount = Number(getFullDisplayBalance(ftm_amount_BN, BTCB.decimal));
  //     let fusdt_amount_BN = await FUSDT.balanceOf(fusdt_btcb_lp_pair.address);
  //     let fusdt_amount = Number(getFullDisplayBalance(fusdt_amount_BN, FUSDT.decimal));
  //     console.log('BTCB price', (fusdt_amount / ftm_amount).toString());
  //     return (fusdt_amount / ftm_amount).toString();
  //     console.log('BTCB price');
  //   } catch (err) {
  //     console.error(`Failed to fetch token price of BTCB: ${err}`);
  //   }
  // }

  //===================================================================
  //===================================================================
  //===================== MASONRY METHODS =============================
  //===================================================================
  //===================================================================

  async getBoardroomAPR() {
    const Boardroom = this.currentBoardroom();
    const latestSnapshotIndex = await Boardroom.latestSnapshotIndex();
    const lastHistory = await Boardroom.boardroomHistory(latestSnapshotIndex);

    const lastRewardsReceived = lastHistory[1];

    const BSHAREPrice = (await this.getShareStat()).priceInDollars;
    const BOMBPrice = (await this.getBombStat()).priceInDollars;
    const epochRewardsPerShare = lastRewardsReceived / 1e18;

    //Mgod formula
    const amountOfRewardsPerDay = epochRewardsPerShare * Number(BOMBPrice) * 4;
    const boardroomtShareBalanceOf = await this.BSHARE.balanceOf(Boardroom.address);
    const boardroomTVL = Number(getDisplayBalance(boardroomtShareBalanceOf, this.BSHARE.decimal)) * Number(BSHAREPrice);
    const realAPR = ((amountOfRewardsPerDay * 100) / boardroomTVL) * 365;
    return realAPR;
  }

  async getBombStakeAPR() {
    const Boardroom = this.currentBoardroom();
    const latestSnapshotIndex = await Boardroom.latestSnapshotIndex();
    const lastHistory = await Boardroom.boardroomHistory(latestSnapshotIndex);

    const lastRewardsReceived = lastHistory[1];

    const BOMBPrice = (await this.getBombStat()).priceInDollars;
    const epochRewardsPerShare = lastRewardsReceived / 1e18;

    //Mgod formula
    const amountOfRewardsPerDay = epochRewardsPerShare * Number(BOMBPrice) * 4;
    const xBombBombBalanceOf = await this.BOMB.balanceOf(this.XBOMB.address);
    const bombTVL = Number(getDisplayBalance(xBombBombBalanceOf, this.XBOMB.decimal)) * Number(BOMBPrice);
    const realAPR = ((amountOfRewardsPerDay * 100 * 0.2) / bombTVL) * 365;
    return realAPR;
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Boardroom
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserClaimRewardFromBoardroom(): Promise<boolean> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.canClaimReward(this.myAccount);
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Boardroom
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserUnstakeFromBoardroom(): Promise<boolean> {
    const Boardroom = this.currentBoardroom();
    const canWithdraw = await Boardroom.canWithdraw(this.myAccount);
    const stakedAmount = await this.getStakedSharesOnBoardroom();
    const notStaked = Number(getDisplayBalance(stakedAmount, this.BSHARE.decimal)) === 0;
    const result = notStaked ? true : canWithdraw;
    return result;
  }

  async timeUntilClaimRewardFromBoardroom(): Promise<BigNumber> {
    // const Boardroom = this.currentBoardroom();
    // const mason = await Boardroom.masons(this.myAccount);
    return BigNumber.from(0);
  }

  async getTotalStakedInBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.totalSupply();
  }

  async stakeShareToBoardroom(amount: string): Promise<TransactionResponse> {
    if (this.isOldBoardroomMember()) {
      throw new Error("you're using old boardroom. please withdraw and deposit the BSHARE again.");
    }
    const Boardroom = this.currentBoardroom();
    return await Boardroom.stake(decimalToBalance(amount));
  }

  async stakeToBomb(amount: string): Promise<TransactionResponse> {
    const Xbomb = this.contracts.xBOMB;
    return await Xbomb.enter(decimalToBalance(amount));
  }

  async redeemFromBomb(amount: string): Promise<TransactionResponse> {
    const BombRouter = this.contracts.BombRouter;
    const expiry = new Date(Date.now() + 2880);
    return await BombRouter.redeem(
      this.BBOMB_BOMB.address,
      decimalToBalance(amount),
      this.myAccount,
      expiry.getTime(),
      '0x',
    );
  }

  async redeemFromBtcb(amount: string): Promise<TransactionResponse> {
    const BombRouter = this.contracts.BombRouter;
    const expiry = new Date(Date.now() + 2880);
    return await BombRouter.redeem(
      this.BBOMB_BTCB.address,
      decimalToBalance(amount),
      this.myAccount,
      expiry.getTime(),
      '0x',
    );
  }
  async supplyToBtcb(amount: string): Promise<TransactionResponse> {
    const BombRouter = this.contracts.BombRouter;
    const expiry = new Date(Date.now() + 2880);
    return await BombRouter.mint(this.BBOMB_BTCB.address, decimalToBalance(amount), this.myAccount, expiry.getTime());
  }

  async supplyToBomb(amount: string): Promise<TransactionResponse> {
    const BombRouter = this.contracts.BombRouter;
    const expiry = new Date(Date.now() + 2880);
    return await BombRouter.mint(this.BBOMB_BOMB.address, decimalToBalance(amount), this.myAccount, expiry.getTime());
  }

  async getStakedSharesOnBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    if (this.boardroomVersionOfUser === 'v1') {
      return await Boardroom.getShareOf(this.myAccount);
    }
    return await Boardroom.balanceOf(this.myAccount);
  }

  async getStakedBomb(): Promise<BigNumber> {
    const Xbomb = this.contracts.xBOMB;
    return await Xbomb.balanceOf(this.myAccount);
  }

  async getTotalStakedBomb(): Promise<BigNumber> {
    const Xbomb = this.contracts.xBOMB;
    const bomb = this.BOMB;
    return await bomb.balanceOf(Xbomb.address);
  }

  async getTotalSuppliedBomb(): Promise<BigNumber> {
    const bbombBomb = this.BOMB_BORROWABLE;
    // const bomb = this.BOMB;
    const totalBomb = await bbombBomb.totalBalance();
    //  const borrowBomb = await bbombBomb.totalBorrows();
    // const totalSupplied = totalBomb + borrowBomb;
    return totalBomb;
  }

  async getTotalSuppliedBtcb(): Promise<BigNumber> {
    const bbombBomb = this.BTCB_BORROWABLE;
    // const bomb = this.BOMB;
    const totalBtcb = await bbombBomb.totalBalance();
    //const borrowBtcb = await bbombBomb.totalBorrows();
    //  const totalSupplied = totalBtcb + borrowBtcb;
    return totalBtcb;
  }

  async getXbombExchange(): Promise<BigNumber> {
    const Xbomb = this.contracts.xBOMB;
    const XbombExchange = await Xbomb.getExchangeRate();

    const xBombPerBomb = parseFloat(XbombExchange) / 1000000000000000000;
    const xBombRate = xBombPerBomb.toString();
    return parseUnits(xBombRate, 18);
  }

  async withdrawFromBomb(amount: string): Promise<TransactionResponse> {
    const Xbomb = this.contracts.xBOMB;
    return await Xbomb.leave(decimalToBalance(amount));
  }

  async getEarningsOnBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    if (this.boardroomVersionOfUser === 'v1') {
      return await Boardroom.getCashEarningsOf(this.myAccount);
    }
    return await Boardroom.earned(this.myAccount);
  }

  async withdrawShareFromBoardroom(amount: string): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.withdraw(decimalToBalance(amount));
  }

  async harvestCashFromBoardroom(): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    if (this.boardroomVersionOfUser === 'v1') {
      return await Boardroom.claimDividends();
    }
    return await Boardroom.claimReward();
  }

  async exitFromBoardroom(): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.exit();
  }

  async getTreasuryNextAllocationTime(): Promise<AllocationTime> {
    const { Treasury } = this.contracts;
    const nextEpochTimestamp: BigNumber = await Treasury.nextEpochPoint();
    const nextAllocation = new Date(nextEpochTimestamp.mul(1000).toNumber());
    const prevAllocation = new Date(Date.now());

    return { from: prevAllocation, to: nextAllocation };
  }
  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to claim
   * their reward from the boardroom
   * @returns Promise<AllocationTime>
   */
  async getUserClaimRewardTime(): Promise<AllocationTime> {
    const { Boardroom, Treasury } = this.contracts;
    const nextEpochTimestamp = await Boardroom.nextEpochPoint(); //in unix timestamp
    const currentEpoch = await Boardroom.epoch();
    const mason = await Boardroom.members(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const periodInHours = period / 60 / 60; // 6 hours, period is displayed in seconds which is 21600
    const rewardLockupEpochs = await Boardroom.rewardLockupEpochs();
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(rewardLockupEpochs);

    const fromDate = new Date(Date.now());
    if (targetEpochForClaimUnlock - currentEpoch <= 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - currentEpoch - 1;
      const endDate = moment(toDate)
        .add(delta * periodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to unstake
   * from the boardroom
   * @returns Promise<AllocationTime>
   */
  async getUserUnstakeTime(): Promise<AllocationTime> {
    const { Boardroom, Treasury } = this.contracts;
    const nextEpochTimestamp = await Boardroom.nextEpochPoint();
    const currentEpoch = await Boardroom.epoch();
    const mason = await Boardroom.members(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const PeriodInHours = period / 60 / 60;
    const withdrawLockupEpochs = await Boardroom.withdrawLockupEpochs();
    const fromDate = new Date(Date.now());
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(withdrawLockupEpochs);
    const stakedAmount = await this.getStakedSharesOnBoardroom();
    if (currentEpoch <= targetEpochForClaimUnlock && Number(stakedAmount) === 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - Number(currentEpoch) - 1;
      const endDate = moment(toDate)
        .add(delta * PeriodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  async watchAssetInMetamask(assetName: string): Promise<boolean> {
    const { ethereum } = window as any;
    if (ethereum && ethereum.networkVersion === config.chainId.toString()) {
      let asset;
      let assetUrl;
      if (assetName === 'BOMB') {
        asset = this.BOMB;
        assetUrl = 'https://raw.githubusercontent.com/bombmoney/bomb-assets/master/bomb-512.png';
      } else if (assetName === 'BSHARE') {
        asset = this.BSHARE;
        assetUrl = 'https://raw.githubusercontent.com/bombmoney/bomb-assets/master/bshare-512.png';
      } else if (assetName === 'BBOND') {
        asset = this.BBOND;
        assetUrl = 'https://raw.githubusercontent.com/bombmoney/bomb-assets/master/bbond-512.png';
      } else if (assetName === 'XBOMB') {
        asset = this.XBOMB;
        assetUrl = 'https://raw.githubusercontent.com/bombmoney/bomb-assets/master/xbomb-512.png';
      } else if (assetName === 'BTCB') {
        asset = this.BTC;
        assetUrl = 'https://bscscan.com/token/images/btcb_32.png';
      }
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: asset.address,
            symbol: asset.symbol,
            decimals: 18,
            image: assetUrl,
          },
        },
      });
    }
    return true;
  }

  async provideBombFtmLP(ftmAmount: string, bombAmount: BigNumber): Promise<TransactionResponse> {
    const { TaxOffice } = this.contracts;
    let overrides = {
      value: parseUnits(ftmAmount, 18),
    };
    return await TaxOffice.addLiquidityETHTaxFree(
      bombAmount,
      bombAmount.mul(992).div(1000),
      parseUnits(ftmAmount, 18).mul(992).div(1000),
      overrides,
    );
  }

  async quoteFromSpooky(tokenAmount: string, tokenName: string): Promise<string> {
    const { SpookyRouter } = this.contracts;
    const { _reserve0, _reserve1 } = await this.BOMBBTCB_LP.getReserves();
    let quote;
    if (tokenName === 'BOMB') {
      quote = await SpookyRouter.quote(parseUnits(tokenAmount), _reserve0, _reserve1);
    } else {
      quote = await SpookyRouter.quote(parseUnits(tokenAmount), _reserve1, _reserve0);
    }
    return (quote / 1e18).toString();
  }

  /**
   * @returns an array of the regulation events till the most up to date epoch
   */
  async listenForRegulationsEvents(): Promise<any> {
    const { Treasury } = this.contracts;

    const treasuryDaoFundedFilter = Treasury.filters.DaoFundFunded();
    const treasuryDevFundedFilter = Treasury.filters.DevFundFunded();
    const treasuryBoardroomFundedFilter = Treasury.filters.BoardroomFunded();
    const boughtBondsFilter = Treasury.filters.BoughtBonds();
    const redeemBondsFilter = Treasury.filters.RedeemedBonds();

    let epochBlocksRanges: any[] = [];
    let boardroomFundEvents = await Treasury.queryFilter(treasuryBoardroomFundedFilter);
    var events: any[] = [];
    boardroomFundEvents.forEach(function callback(value, index) {
      events.push({ epoch: index + 1 });
      events[index].boardroomFund = getDisplayBalance(value.args[1]);
      if (index === 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
      }
      if (index > 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
        epochBlocksRanges[index - 1].endBlock = value.blockNumber;
      }
    });

    epochBlocksRanges.forEach(async (value, index) => {
      events[index].bondsBought = await this.getBondsWithFilterForPeriod(
        boughtBondsFilter,
        value.startBlock,
        value.endBlock,
      );
      events[index].bondsRedeemed = await this.getBondsWithFilterForPeriod(
        redeemBondsFilter,
        value.startBlock,
        value.endBlock,
      );
    });
    let DEVFundEvents = await Treasury.queryFilter(treasuryDevFundedFilter);
    DEVFundEvents.forEach(function callback(value, index) {
      events[index].devFund = getDisplayBalance(value.args[1]);
    });
    let DAOFundEvents = await Treasury.queryFilter(treasuryDaoFundedFilter);
    DAOFundEvents.forEach(function callback(value, index) {
      events[index].daoFund = getDisplayBalance(value.args[1]);
    });
    return events;
  }

  /**
   * Helper method
   * @param filter applied on the query to the treasury events
   * @param from block number
   * @param to block number
   * @returns the amount of bonds events emitted based on the filter provided during a specific period
   */
  async getBondsWithFilterForPeriod(filter: EventFilter, from: number, to: number): Promise<number> {
    const { Treasury } = this.contracts;
    const bondsAmount = await Treasury.queryFilter(filter, from, to);
    return bondsAmount.length;
  }

  async estimateZapIn(tokenName: string, lpName: string, amount: string): Promise<number[]> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    let estimate;
    if (tokenName === BNB_TICKER) {
      estimate = await zapper.estimateZapIn(lpToken.address, SPOOKY_ROUTER_ADDR, parseUnits(amount, 18));
    } else {
      const token = tokenName === BOMB_TICKER ? this.BOMB : this.BSHARE;
      estimate = await zapper.estimateZapInToken(
        token.address,
        lpToken.address,
        SPOOKY_ROUTER_ADDR,
        parseUnits(amount, 18),
      );
    }
    return [estimate[0] / 1e18, estimate[1] / 1e18];
  }
  async zapIn(tokenName: string, lpName: string, amount: string): Promise<TransactionResponse> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    if (tokenName === BNB_TICKER) {
      let overrides = {
        value: parseUnits(amount, 18),
      };
      return await zapper.zapIn(lpToken.address, SPOOKY_ROUTER_ADDR, this.myAccount, overrides);
    } else {
      const token = tokenName === BOMB_TICKER ? this.BOMB : this.BSHARE;
      return await zapper.zapInToken(
        token.address,
        parseUnits(amount, 18),
        lpToken.address,
        SPOOKY_ROUTER_ADDR,
        this.myAccount,
      );
    }
  }
  async swapBBondToBShare(bbondAmount: BigNumber): Promise<TransactionResponse> {
    const { BShareSwapper } = this.contracts;
    return await BShareSwapper.swapBBondToBShare(bbondAmount);
  }
  async estimateAmountOfBShare(bbondAmount: string): Promise<string> {
    const { BShareSwapper } = this.contracts;
    try {
      const estimateBN = await BShareSwapper.estimateAmountOfBShare(parseUnits(bbondAmount, 18));
      return getDisplayBalance(estimateBN, 18, 6);
    } catch (err) {
      console.error(`Failed to fetch estimate bshare amount: ${err}`);
    }
  }

  async getBShareSwapperStat(address: string): Promise<BShareSwapperStat> {
    const { BShareSwapper } = this.contracts;
    const bshareBalanceBN = await BShareSwapper.getBShareBalance();
    const bbondBalanceBN = await BShareSwapper.getBBondBalance(address);
    // const bombPriceBN = await BShareSwapper.getBombPrice();
    // const bsharePriceBN = await BShareSwapper.getBSharePrice();
    const rateBSharePerBombBN = await BShareSwapper.getBShareAmountPerBomb();
    const bshareBalance = getDisplayBalance(bshareBalanceBN, 18, 5);
    const bbondBalance = getDisplayBalance(bbondBalanceBN, 18, 5);
    return {
      bshareBalance: bshareBalance.toString(),
      bbondBalance: bbondBalance.toString(),
      // bombPrice: bombPriceBN.toString(),
      // bsharePrice: bsharePriceBN.toString(),
      rateBSharePerBomb: rateBSharePerBombBN.toString(),
    };
  }
}
