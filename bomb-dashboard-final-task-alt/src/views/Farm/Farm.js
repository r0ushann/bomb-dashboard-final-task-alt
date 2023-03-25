import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Bank from '../Bank';

import { Box, Container, Typography, Grid } from '@material-ui/core';

import { Alert } from '@material-ui/lab';

import Page from '../../components/Page';
import FarmCard from './FarmCard';
//import FarmImage from '../../assets/img/farm.png';
import { createGlobalStyle } from 'styled-components';

import useBanks from '../../hooks/useBanks';
import { Helmet } from 'react-helmet';

import HomeImage from '../../assets/img/background.jpg';
const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;

const TITLE = 'bomb.money | Farms';

const Farm = () => {
  const [banks] = useBanks();
  const { path } = useRouteMatch();
  const activeBanks = banks.filter((bank) => !bank.finished);
  return (
    <Switch>
      <Page>
        <Route exact path={path}>
          <BackgroundImage />
          <Helmet>
            <title>{TITLE}</title>
          </Helmet>
          <Container maxWidth="lg">
            <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
              Reward Farms
            </Typography>

            <Box mt={5}>
              <div hidden={activeBanks.filter((bank) => bank.sectionInUI === 3).length === 0}>
                <Typography color="textYellow" align="center" variant="h4" gutterBottom>
                  Earn BSHARE by staking Pancake LPs & BBOND
                </Typography>
                {/* <Alert variant="filled" severity="info">
                    <h4>
                      Farms started November 25th 2021 and will continue running for 1 full year.</h4>
                  </Alert> */}
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                  {activeBanks
                    .filter((bank) => bank.sectionInUI === 3)
                    .map((bank) => (
                      <React.Fragment key={bank.name}>
                        <FarmCard bank={bank} />
                      </React.Fragment>
                    ))}
                </Grid>
              </div>

              <div hidden={activeBanks.filter((bank) => bank.sectionInUI === 2).length === 0}>
                {/* <Typography color="textPrimary" variant="h4" gutterBottom style={{ marginTop: '20px' }}>
                    Inactive ApeSwap Farms
                  </Typography> */}
                <Typography color="textYellow" align="center" variant="h4" gutterBottom style={{ marginTop: '40px' }}>
                  Earn BSHARE by ACSI Maxi LPs
                </Typography>
                {/* <Alert variant="filled" severity="info">
                    These farms are functioning properly, but need an update to show the accurate TVL and APR.
                    <br />
                    Reward allocations are 20% of all BSHARE rewards to the 80BOMB-20BTCB-LP and 10% of all rewards to
                    the 80BSHARE-20BSHARE.
                  </Alert> */}
                <Grid container spacing={3} style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
                  {activeBanks
                    .filter((bank) => bank.sectionInUI === 2)
                    .map((bank) => (
                      <React.Fragment key={bank.name}>
                        <FarmCard bank={bank} />
                      </React.Fragment>
                    ))}
                </Grid>
              </div>

              <div hidden={activeBanks.filter((bank) => bank.sectionInUI === 1).length === 0}>
                <Typography color="textYellow" align="center" variant="h4" gutterBottom style={{ marginTop: '40px' }}>
                  Earn BSHARE by staking BUSM Liquidity
                </Typography>
                {/* <Alert variant="filled" severity="warning">
                    Genesis pools have ended. Please claim all rewards and remove funds from Genesis pools.
                  </Alert> */}
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                  {activeBanks
                    .filter((bank) => bank.sectionInUI === 1)
                    .map((bank) => (
                      <React.Fragment key={bank.name}>
                        <FarmCard bank={bank} />
                      </React.Fragment>
                    ))}
                </Grid>
              </div>

              <div hidden={activeBanks.filter((bank) => bank.sectionInUI === 0).length === 0}>
                <Typography color="textYellow" align="center" variant="h4" gutterBottom style={{ marginTop: '40px' }}>
                  Deprecated Farms
                </Typography>
                <Alert variant="filled" severity="warning">
                  All farms here have ended or are ending soon. Deposits have been paused, please remove funds.
                </Alert>
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                  {activeBanks
                    .filter((bank) => bank.sectionInUI === 0)
                    .map((bank) => (
                      <React.Fragment key={bank.name}>
                        <FarmCard bank={bank} />
                      </React.Fragment>
                    ))}
                </Grid>
              </div>
            </Box>
          </Container>
        </Route>
        <Route path={`${path}/:bankId`}>
          <BackgroundImage />
          <Bank />
        </Route>
      </Page>
    </Switch>
  );
};

export default Farm;
