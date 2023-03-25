/**
 * Import section for 
 * BonDash
 * 
 * accessing the files required for bondDash from
 * hooks/
 * components from the bond folder
 */

import React, { useMemo } from 'react';
import useBombFinance from '../../../hooks/useBombFinance';
import useBondsPurchasable from '../../../hooks/useBondsPurchasable';
import useBondStats from '../../../hooks/useBondStats';
import useModal from '../../../hooks/useModal';
import useTokenBalance from '../../../hooks/useTokenBalance';
import { useTransactionAdder } from '../../../state/transactions/hooks';
import { getDisplayBalance } from '../../../utils/formatBalance';
import ExchangeModal from '../../Bond/components/ExchangeModal';
//style page for bondDashboard
import './style-BondDashboard.css';

const BondDash = () => {
  
  const bondStat = useBondStats();
  const bombFinance = useBombFinance();
  const bondBalance = useTokenBalance(bombFinance?.BBOND);
  const balance = useTokenBalance(bombFinance.BBOND);
  const isBondPurchasable = useMemo(() => Number(bondStat?.tokenInFtm) < 1.01, [bondStat]);
  const bondsPurchasable = useBondsPurchasable();
  const addTransaction = useTransactionAdder();

  const onExchange = React.useCallback(
    async (amount) => {
      const tx = await bombFinance.buyBonds(amount);
      addTransaction(tx, {
        summary: `Buy ${Number(amount).toFixed(2)} BBOND with ${amount} BOMB`,
      });
    },
    [bombFinance, addTransaction],
  );


  //modal for purchase
  const [onPresent1, onDismiss1] = useModal(
    <ExchangeModal
      title={'Purchase'}
      description={
        !isBondPurchasable
          ? 'BOMB is over peg'
          : getDisplayBalance(bondsPurchasable, 18, 4) + ' BBOND available for purchase'
      }
      max={balance}
      onConfirm={(value) => {
        onExchange(value);
        onDismiss1();
      }}
      action={'Purchase'}
      tokenName={bombFinance.BBOND}
    />,
  );
 
  return (
    <div className="bond-content-jt">
      <div className="bond-box-jt">
        <p>Current Price: (Bomb)^2</p>
        <div>BBOND = {Number(bondStat?.tokenInFtm).toFixed(4) || '-'}</div>
      </div>
      <div className="bond-box-jt">
        <p>Available to redeem: </p>
        <div>BOND = {getDisplayBalance(bondBalance)}</div>
      </div>
      <div className="bond-box-btn-jt">
        <div className="btn-container-jt">
          <div className="btn-content">
            <p>Purchase BBond</p>
            <p>Bomb is over peg</p>
          </div>
          <button onClick={onPresent1}>Purchase</button>
        </div>
        <div></div>
        <div className="btn-container-jt">
          <div className="btn-content">
            <p>Purchase BBond</p>
          </div>
          <button onClick={onPresent1}>Reedeem</button>
        </div>
      </div>
    </div>
  );
};

export default BondDash;