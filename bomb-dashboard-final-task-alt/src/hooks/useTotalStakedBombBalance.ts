import {useEffect, useState} from 'react';
import {BigNumber} from 'ethers';
import useBombFinance from './useBombFinance';
import useRefresh from './useRefresh';

const useStakedBombBalance = () => {
  const {slowRefresh} = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const bombFinance = useBombFinance();
  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await bombFinance.getTotalStakedBomb());
      } catch (e) {
        console.error(e);
      }
    }
    fetchBalance();
  }, [slowRefresh, bombFinance]);
  return balance;
};

export default useStakedBombBalance;
