import {useEffect, useState} from 'react';
import useBombFinance from './useBombFinance';
import {PoolStats} from '../bomb-finance/types';

import useRefresh from './useRefresh';

const useXbombAPR = () => {
  const {slowRefresh} = useRefresh();
  const [bombAPR, setBombAPR] = useState<PoolStats>();

  const bombFinance = useBombFinance();
  const isUnlocked = bombFinance?.isUnlocked;
  useEffect(() => {
    async function fetchBalance() {
      try {
        setBombAPR(await bombFinance.getXbombAPR());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [slowRefresh, isUnlocked, bombFinance]);
  return bombAPR;
};

export default useXbombAPR;
