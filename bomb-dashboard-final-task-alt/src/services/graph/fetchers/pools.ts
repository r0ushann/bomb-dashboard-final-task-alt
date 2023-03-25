import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { GRAPH_HOST } from '../constants';

import { poolQuery } from '../queries/pools';

const appClient = new ApolloClient({
  uri: GRAPH_HOST,
  cache: new InMemoryCache(),
});

export const bombMaxi = (poolId: string) =>
  appClient.query({
    query: gql(poolQuery),
    variables: {
      id: poolId,
    },
  });
//     .then((data) => return data.data.pool
//        // console.log('Subgraph data: ', data.data.pool))
// .catch((err) => {
//     console.log('Error fetching data: ', err);

// });
