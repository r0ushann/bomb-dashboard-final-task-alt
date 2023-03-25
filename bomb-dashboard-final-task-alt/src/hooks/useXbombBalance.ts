import {useEffect, useState} from 'react';
import {BigNumber} from 'ethers';
import useBombFinance from './useBombFinance';
import useRefresh from './useRefresh';

const useXbombBalance = () => {
  const {slowRefresh} = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const bombFinance = useBombFinance();
  useEffect(() => {
    async function fetchBalance() {
      try {
        const rate = await bombFinance.getXbombExchange();
        setBalance(rate);
      } catch (e) {
        console.error(e);
      }
    }

    fetchBalance();
  }, [setBalance, slowRefresh, bombFinance]);
  return balance;
};

export default useXbombBalance;
