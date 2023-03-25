/**Import section for react, styles 
 * 
 * taking data necessary for the bombFarm Dashboard from the hooks folder
 * using staked balance
 * useModal 
 * useHarvest
 * useEarnings
 * useBombStats
 * usebShareStats
 * useBanks
 * DepositModal
 * formatBalance
 * useStatsForPool
 * useStakedTokenPriceInDollars
 * useStake
 * withdrawModal from components
*/

import React from 'react';
import useBank from '../../../hooks/useBank';
import useBombStats from '../../../hooks/useBombStats';
import useShareStats from '../../../hooks/usebShareStats';
import useEarnings from '../../../hooks/useEarnings';
import useHarvest from '../../../hooks/useHarvest';
import useModal from '../../../hooks/useModal';
import useRedeem from '../../../hooks/useRedeem';
import useStake from '../../../hooks/useStake';
import useStakedBalance from '../../../hooks/useStakedBalance';
import useStakedTokenPriceInDollars from '../../../hooks/useStakedTokenPriceInDollars';
import useStatsForPool from '../../../hooks/useStatsForPool';
import useTokenBalance from '../../../hooks/useTokenBalance';
import useWithdraw from '../../../hooks/useWithdraw';
import { getDisplayBalance } from '../../../utils/formatBalance';
import DepositModal from '../../Bank/components/DepositModal';
import WithdrawModal from '../../Bank/components/WithdrawModal';
import './style-Farm.css';



/** accessing data
 * BombfarmDashboard
 * 
 */
const Show = ({ id, img }) => {
  const bank = useBank(id);
  const statsOnPool = useStatsForPool(bank);
  const earnings = useEarnings(bank.contract, bank.earnTokenName, bank.poolId);

  const bombStats = useBombStats();
  const tShareStats = useShareStats();

  const tokenName = bank.earnTokenName === 'BSHARE' ? 'BSHARE' : 'BOMB';
  const tokenStats = bank.earnTokenName === 'BSHARE' ? tShareStats : bombStats;
  const tokenPriceInDollars = React.useMemo(
    () => (tokenStats ? Number(tokenStats.priceInDollars).toFixed(2) : null),
    [tokenStats],
  );
  const earnedInDollars = (Number(tokenPriceInDollars) * Number(getDisplayBalance(earnings))).toFixed(2);
 
  const stakedBalance = useStakedBalance(bank.contract, bank.poolId);

  const stakedTokenPriceInDollars = useStakedTokenPriceInDollars(bank.depositTokenName, bank.depositToken);

  const tokenPriceInDollarsStack = React.useMemo(
    () => (stakedTokenPriceInDollars ? stakedTokenPriceInDollars : null),
    [stakedTokenPriceInDollars],
  );

  const stackedInDollars = (
    Number(tokenPriceInDollarsStack) * Number(getDisplayBalance(stakedBalance, bank.depositToken.decimal))
  ).toFixed(2);

  /**using bank data */
 
  const { onReward } = useHarvest(bank);
  const tokenBalance = useTokenBalance(bank.depositToken);
  const { onStake } = useStake(bank);
  const { onWithdraw } = useWithdraw(bank);

  const [onPresentDeposit, onDismissDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      decimals={bank.depositToken.decimal}
      onConfirm={(amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        onStake(amount);
        onDismissDeposit();
      }}
      tokenName={bank.depositTokenName}
    />,
  );
  const [onPresentWithdraw, onDismissWithdraw] = useModal(
    <WithdrawModal
      max={stakedBalance}
      decimals={bank.depositToken.decimal}
      onConfirm={(amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        onWithdraw(amount);
        onDismissWithdraw();
      }}
      tokenName={bank.depositTokenName}
    />,
  );
  console.log(statsOnPool, 'statsOnPool');
  return (
    <div className="show_container">
      <div className="head-show">
        <div className="head-img-show">
          <img src={img} alt='img'/>
        </div>

        <div className="info-show">
          <div className="content-show">
            <div className="head_content-show">
              <h2>BOMB-BTCB</h2>
              <div className="recommend">Recommended</div>
            </div>
          </div>
           
          <div className="TVL">TVL: ${bank.closedForStaking ? '0' : statsOnPool?.TVL}</div>
        </div>
      
      </div>


      <div className="content-contaienr">
        <table>
          <tr>
            <th>Daily Returns:</th>
            <th>Your Stake:</th>
            <th>Earned: </th>
          </tr>
          <tr>
            <td>2%</td>
            <td>{getDisplayBalance(stakedBalance)}</td>
            <td>{getDisplayBalance(earnings)}</td>
          </tr>
          <tr>
            <td></td>
            <td>≈ ${stackedInDollars}</td>
            <td>≈ ${stackedInDollars}</td>
          </tr>
        </table>

        <div className="buttons-container">
          <button onClick={onPresentDeposit}>Deposit</button>
          <button onClick={onPresentWithdraw}>Withdraw</button>
          <button onClick={onReward}>Claim Rewards</button>
        </div>
      </div>
    </div>
  );
};

export default Show;