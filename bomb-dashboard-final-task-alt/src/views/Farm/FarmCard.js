import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, Typography, Grid } from '@material-ui/core';

import TokenSymbol from '../../components/TokenSymbol';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';

const FarmCard = ({ bank }) => {
  const { account } = useWallet();

  let depositToken = bank.depositTokenName.toUpperCase();
  if (depositToken === '80BOMB-20BTCB-LP') {
    depositToken = 'BOMB-MAXI';
  }
  if (depositToken === '80BSHARE-20WBNB-LP') {
    depositToken = 'BSHARE-MAXI';
  }
  return (
    <Grid item xs={12} md={4} lg={4}>
      <Card variant="outlined">
        <CardContent>
          <Box style={{ position: 'relative' }}>
            <Box
              style={{
                position: 'absolute',
                right: '0px',
                top: '-5px',
                height: '48px',
                width: '48px',
                borderRadius: '40px',
                backgroundColor: '#363746',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <TokenSymbol size={32} symbol={bank.depositTokenName} />
            </Box>
            <Typography variant="h5" component="h2">
              {bank.depositTokenName}
            </Typography>
            <Typography color="textSecondary">
              {/* {bank.name} */}
              Deposit {depositToken.toUpperCase()} Earn {` ${bank.earnTokenName}`}
            </Typography>
          </Box>
        </CardContent>
        <CardActions style={{ justifyContent: 'flex-end' }}>
          {!!account ? (
              <Button className="shinyButtonSecondary" component={Link} to={`/farm/${bank.contract}`}>
                  View
              </Button>
          ) : (
              <UnlockWallet />
          )}
        </CardActions>
      </Card>
    </Grid>
  );
};

export default FarmCard;
