import { useEffect, useState } from 'react';
import useBombFinance from './useBombFinance';

//import { bombMaxi } from '../services/graph/fetchers';
import { MaxiInfo } from '../bomb-finance/types';
import useRefresh from './useRefresh';
//import { ApolloQueryResult } from '@apollo/client';

const useBombMaxiStats = (poolId: string | null | undefined) => {
  const [stat, setStat] = useState<MaxiInfo | null>();
  const { slowRefresh } = useRefresh();
  const bombFinance = useBombFinance();

  useEffect(() => {
    async function fetchBombMaxiPrice() {
      if (poolId) {
        const BombMaxi = await bombFinance.getBombMaxiStats(poolId);
        try {
          setStat(BombMaxi);
        } catch (err) {
          console.log('Error fetching bomb maxi stat');
        }
      }
    }
    fetchBombMaxiPrice();
  }, [setStat, poolId, slowRefresh, bombFinance]);

  return stat;
};

export default useBombMaxiStats;
