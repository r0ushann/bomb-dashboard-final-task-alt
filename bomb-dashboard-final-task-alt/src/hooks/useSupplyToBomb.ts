import { useCallback } from 'react';
import useBombFinance from './useBombFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useSupplyToBomb = () => {
  const bombFinance = useBombFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      handleTransactionReceipt(bombFinance.supplyToBomb(amount), `Supply  ${amount} BOMB`);
    },
    [bombFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useSupplyToBomb;
