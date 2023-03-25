/**
 * import section for Dashboard utilities
 * 
 * accessing and importing from 
 * hooks folder
 * components
 * 0x for roundandFormat
 */

import React, { useMemo } from 'react';
//style for Dashboard
import './Dashboard.css';
import useCurrentEpoch from '../../hooks/useCurrentEpoch';
import ProgressCountdown from '../Boardroom/components/ProgressCountdown';
import useTreasuryAllocationTimes from '../../hooks/useTreasuryAllocationTimes';
import { getDisplayBalance } from '../../utils/formatBalance';

import useEarningsOnBoardroom from '../../hooks/useEarningsOnBoardroom';
import useBombStats from '../../hooks/useBombStats';
import useStakedBalanceOnBoardroom from '../../hooks/useStakedBalanceOnBoardroom';
import useStakedTokenPriceInDollars from '../../hooks/useStakedTokenPriceInDollars';
import useBombFinance from '../../hooks/useBombFinance';
import moment from 'moment';
//
import { Link } from 'react-router-dom';
import HomeImage from '../../assets/img/background.jpg';
import { createGlobalStyle } from 'styled-components';
import dis from '../../assets/img/discord.svg';
//
import useFetchBoardroomAPR from '../../hooks/useFetchBoardroomAPR';
import useBank from '../../hooks/useBank';
import { useWallet } from 'use-wallet';
import useEarnings from '../../hooks/useEarnings';
//
import Show from './components/BombFarmDashboard';
import BondDash from './components/BondDash';
//
import { roundAndFormatNumber } from '../../0x';
import usebShareStats from '../../hooks/usebShareStats';
import useBondStats from '../../hooks/useBondStats';
import useRedeemOnBoardroom from '../../hooks/useRedeemOnBoardroom';
import useModal from '../../hooks/useModal';
import DepositModal from '../Boardroom/components/DepositModal';
import useTokenBalance from '../../hooks/useTokenBalance';
import useStakeToBoardroom from '../../hooks/useStakeToBoardroom';
import WithdrawModal from '../Boardroom/components/WithdrawModal';
//
import useTotalStakedOnBoardroom from '../../hooks/useTotalStakedOnBoardroom';
import f_im from '../../assets/img/bomb-bitcoin-LP.png';
//import bom-bitcoin from '../../assets/img/bomb-bitcoin-LP.png';
import s_im from '../../assets/img/bshare-bnb-LP.png';
//import b-share from '../../assets/img/bshare-bnb-LP.png';
import t_im from '../../assets/img/bbond.png';
//import bbond from '../../assets/img/bbond.png';
import fo_im from '../../assets/img/bshares.png';
//import foxx from '../../assets/img/bshares.png';
import meta from '../../assets/img/metamask-fox.svg';
//import doc from '../../assets/img/doc.png';
//data for Boardroom
import useWithdrawFromBoardroom from '../../hooks/useWithdrawFromBoardroom';
import useHarvestFromBoardroom from '../../hooks/useHarvestFromBoardroom';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';


const Dashboard = () => {
  const bombFinance = useBombFinance();
  const stakedBalance = useStakedBalanceOnBoardroom();
  const { to } = useTreasuryAllocationTimes();
  const currentEpoch = useCurrentEpoch();
  const earnings = useEarningsOnBoardroom();
  const bombStats = useBombStats();

  const stakedTokenPriceInDollars = useStakedTokenPriceInDollars('BSHARE', bombFinance.BSHARE);
  const tokenPriceInDollars = React.useMemo(
    () =>
      stakedTokenPriceInDollars
        ? (Number(stakedTokenPriceInDollars) * Number(getDisplayBalance(stakedBalance))).toFixed(2).toString()
        : null,
    [stakedTokenPriceInDollars, stakedBalance],
  );
  const earnedInDollars = (Number(tokenPriceInDollars) * Number(getDisplayBalance(earnings))).toFixed(2);

  /*
  dashboard_bombFarm
  */

  const bank = useBank('BombBtcbLPBShareRewardPool');
  const bombCirculatingSupply = useMemo(() => (bombStats ? String(bombStats.circulatingSupply) : null), [bombStats]);
  const bombTotalSupply = useMemo(() => (bombStats ? String(bombStats.totalSupply) : null), [bombStats]);
  const bombPriceInDollars = useMemo(
    () => (bombStats ? Number(bombStats.priceInDollars).toFixed(2) : null),
    [bombStats],
  );
  const bombPriceInBNB = useMemo(() => (bombStats ? Number(bombStats.tokenInFtm).toFixed(4) : null), [bombStats]);
 
  const bShareStats = usebShareStats();
  const tBondStats = useBondStats();
 
  const boardroomAPR = useFetchBoardroomAPR();
  const bShareTotalSupply = useMemo(() => (bShareStats ? String(bShareStats.totalSupply) : null), [bShareStats]);
  const bShareCirculatingSupply = useMemo(
    () => (bShareStats ? String(bShareStats.circulatingSupply) : null),
    [bShareStats],
  );

  const bSharePriceInDollars = useMemo(
    () => (bShareStats ? Number(bShareStats.priceInDollars).toFixed(2) : null),
    [bShareStats],
  );
  const bSharePriceInBNB = useMemo(
    () => (bShareStats ? Number(bShareStats.tokenInFtm).toFixed(4) : null),
    [bShareStats],
  );
  const tBondTotalSupply = useMemo(() => (tBondStats ? String(tBondStats.totalSupply) : null), [tBondStats]);
  const tBondCirculatingSupply = useMemo(
    () => (tBondStats ? String(tBondStats.circulatingSupply) : null),
    [tBondStats],
  );

  const TVL_BOBM = useTotalValueLocked();
  const { onStake } = useStakeToBoardroom();
  const { onRedeem } = useRedeemOnBoardroom();
  const tokenBalance = useTokenBalance(bombFinance.BSHARE);

  /**
   * Boardroom for dashboard
   */
  const totalStaked = useTotalStakedOnBoardroom();
  const [onPresentDeposit, onDismissDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      onConfirm={(value) => {
        onStake(value);
        onDismissDeposit();
      }}
      tokenName={'BShare'}
    />,
  );
  const { onWithdraw } = useWithdrawFromBoardroom();
  const { onReward } = useHarvestFromBoardroom();
  const [onPresentWithdraw, onDismissWithdraw] = useModal(
    <WithdrawModal
      max={stakedBalance}
      onConfirm={(value) => {
        onWithdraw(value);
        onDismissWithdraw();
      }}
      tokenName={'BShare'}
    />,
  );

  return (

    <>
       
      <div className={'dashboard_jt'}>
        <div className="bombsum">
          <div className="top-h">
            <h3>Bomb Finance Summary</h3>
          </div>
          <div className="header-div"></div>
          <div className="summary">
            <div className="summary-table">
              <table>
                <tr>
                  <th></th>
                  <th>Current Supply</th>
                  <th>Total Supply</th>
                  <th>Price </th>
                  <th></th>
                </tr>
                <tr>
                  <td className="po1">
                    <img src={f_im} />
                    <span>$BOMB</span>
                  </td>
                  <td>{roundAndFormatNumber(bombCirculatingSupply, 2)}</td>
                  <td> {roundAndFormatNumber(bombTotalSupply, 2)}</td>
                  <td>
                    <div>${bombPriceInDollars ? roundAndFormatNumber(bombPriceInDollars, 2) : '-.--'}</div>{' '}
                    <div>{bombPriceInBNB ? bombPriceInBNB : '----'} BTC</div>
                  </td>
                  <td>
                    <img src={meta} />
                  </td>
                </tr>
                <tr>
                  <td className="po1">
                    <img src={fo_im} />
                    <span>$BSHARE</span>
                  </td>
                  <td>{roundAndFormatNumber(bShareCirculatingSupply, 2)} </td>
                  <td>{roundAndFormatNumber(bShareTotalSupply, 2)}</td>
                  <td>
                    <div>${bSharePriceInDollars ? bSharePriceInDollars : '-.--'}</div>{' '}
                    <div>{bSharePriceInBNB ? bSharePriceInBNB : '-.--'} BNB</div>
                  </td>
                  <td>
                    <img src={meta} />
                  </td>
                </tr>
                <tr>
                  <td className="po1">
                    <img src={t_im} />
                    <span>$BBOND</span>
                  </td>
                  <td>{roundAndFormatNumber(tBondCirculatingSupply, 2)}</td>
                  <td>{roundAndFormatNumber(tBondTotalSupply, 2)}</td>
                  <td>
                    <div>${bSharePriceInDollars ? bSharePriceInDollars : '-.--'}</div>{' '}
                    <div>{bSharePriceInBNB ? bSharePriceInBNB : '-.--'} BNB</div>
                  </td>
                  <td>
                    <img src={meta} />
                  </td>
                  </tr>
              </table>
            </div>

            <div className="left-summary">
              <div className="left-head">Current Epoch</div>
              <div className="bold-summary">{Number(currentEpoch)}</div>
              <div className="summary-clock">
                <ProgressCountdown base={moment().toDate()} hideBar={true} deadline={to} description="Next Epoch" />
              </div>

              <div className="left-head-next">Next Epoch in</div>
              <div className="left-status">
                <div>
                  Live TWAP: <span>1.10</span>
                </div>
                <div>
                  TVL: <span>${TVL_BOBM.toFixed(2)}</span>
                </div>
                <div>
                  Live TWAP: <span>1.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="invest-strategy">
          <div className="strategy-col">
            <div className="read_link">
              <Link to={''}>Read for the Investement Strategy</Link>
            </div>
            <div className="btn-invest">
              <p>Invest Now</p>
            </div>
            <div className="links-to">
              <div>
                <img src={dis} />
                Discord
              </div>
              <div>
                <img  />
                <a href={'https://docs.bomb.money/welcome-start-here/readme'} target="_blank">
                  Read Docs
                </a>
              </div>
            </div>
            <div className="board-room">
              <div className="head">
                <div className="head-img">
                  <img src={fo_im} />
                </div>
                <div className="info">
                  <div className="content">
                    <div className="head_content">
                      <h2>Boardroom</h2>
                      <div className="recommend">Recommended</div>
                    </div>
                    <div className="para">Stake BSHARE and earn BOMB every epoch</div>
                  </div>
                  <div className="TVL">TVL: $1,008,430</div>
                </div>
              </div>
              <div className="tot-stack">
                <div className="content">Total Staked:{getDisplayBalance(totalStaked)}</div>
              </div>
              <div className="info-content">
                <div className="table">
                  <table>
                    <tr>
                      <th>Daily Returns:</th>
                      <th>Your Stake:</th>
                      <th>Earned: </th>
                    </tr>
                    <tr>
                      <td>{boardroomAPR.toFixed(2)}%</td>
                      <td>{`${getDisplayBalance(stakedBalance)}`}</td>
                      <td>{getDisplayBalance(earnings)}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>{`≈$${tokenPriceInDollars}`}</td>
                      <td>{`≈$${earnedInDollars}`}</td>
                    </tr>
                  </table>
                </div>
                <div className="tags">
                  <div className="tag-top">
                    <button onClick={onPresentDeposit}>Deposit</button>
                    <button onClick={onPresentWithdraw}>Withdraw</button>
                  </div>
                  <button onClick={onReward}>Clain Rewards</button>
                </div>
              </div>
            </div>
          </div>
          <div className="news">
            <h2>Latest News</h2>
          </div>
        </div>
        {bank ? (
          /**BombFarm */
          <div className="bomb-farm">
            <div className="head">
              <div className="content">
                <h2>Bomb Farms</h2>
                <p>Stake your LP tokens in our farms to start earning $BSHARE</p>
              </div>
              <div className="claim">Claim All</div>
            </div>
            <Show img={f_im} id={'BombBtcbLPBShareRewardPool'} />
            <Show img={s_im} id={'BshareBnbLPBShareRewardPool'} />
          </div>
        ) : (
          <></>
        )}
       
        <div className="bonds-container-jt">
          <div className="head-show">
            <div className="head-img-show">
              <img src={t_im} />
            </div>
            <div className="info-show">
              <div className="content-show">
                <div className="head_content-show">
                  <h2>Bonds</h2>
                </div>
                <p>BBOND can only be purchased on contraction periods, when TWAP of BOMB is below 1</p>
              </div>
            </div>
          </div>
          <BondDash />
        </div>
      </div>
    </>
  );
};

export default Dashboard;