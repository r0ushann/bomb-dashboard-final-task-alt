import React from 'react';
import {Box} from '@material-ui/core';
import AccountButton from '../Nav/AccountButton';

const UnlockWallet = () => {
  return (
    <Box style={{'textAlign': 'center', 'marginTop': '25px'}}>
      <AccountButton />
      {/* <Button color="primary" variant="contained" onClick={() => connect('injected')}>Unlock Wallet</Button> */}
    </Box>
  );
};

export default UnlockWallet;
