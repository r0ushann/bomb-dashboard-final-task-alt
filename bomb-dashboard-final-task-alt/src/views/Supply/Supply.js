import React from 'react';
import { useWallet } from 'use-wallet';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';

import { Box, Typography, Grid, Card, CardContent } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Spacer from '../../components/Spacer';
import UnlockWallet from '../../components/UnlockWallet';
import Page from '../../components/Page';
// import bombFinance, { BOMB, BTCB } from '../../bomb-finance';
// import useXbombBalance from '../../hooks/useXbombBalance';
// import useXbombAPR from '../../hooks/useXbombAPR';
import useSuppliedBtcbBalance from '../../hooks/useTotalSuppliedBtcbBalance';
import useSuppliedBombBalance from '../../hooks/useTotalSuppliedBombBalance';

import { createGlobalStyle } from 'styled-components';
import { Helmet } from 'react-helmet'
import SupplyBomb from './components/SupplyBomb';

import HomeImage from '../../assets/img/background.jpg';
import SupplyBtcb from './components/SupplyBtcb';
const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;
const TITLE = 'bomb.money | Supply Assets'

const useStyles = makeStyles((theme) => ({
  gridItem: {
    height: '100%',
    [theme.breakpoints.up('md')]: {
      height: '90px',
    },
  },
}));

const Supply = () => {
  const classes = useStyles();
  const { account } = useWallet();
  // const { onRedeem } = useRedeemOnBoardroom();
  const stakedBombBalance = Number(useSuppliedBombBalance() / 1000000000000000000).toFixed(2);
  const stakedBtcbBalance = Number(useSuppliedBtcbBalance() / 1000000000000000000).toFixed(5);
  // const xbombBalance = useXbombBalance();
  // const xbombRate = Number(xbombBalance / 1000000000000000000).toFixed(4);
  // const xbombAPR = useXbombAPR();

  //const xbombTVL = xbombAPR.TVL;




  // const stakedTotalBombBalance = useSuppliedTotalBombBalance();
  // console.log("stakedTotalBombBalance", Number(stakedTotalBombBalance / 1000000000000000000).toFixed(2));
  // const bombTotalStaked = Number(stakedTotalBombBalance / 1000000000000000000).toFixed(0);
  // const xbombTVL = useMemo(() => (xbombAPR ? Number(xbombAPR.TVL).toFixed(0) : null), [xbombAPR]);
  // const xbombDailyAPR = useMemo(() => (xbombAPR ? Number(xbombAPR.dailyAPR).toFixed(2) : null), [xbombAPR]);
  // const xbombYearlyAPR = useMemo(() => (xbombAPR ? Number(xbombAPR.yearlyAPR).toFixed(2) : null), [xbombAPR]);

  // console.log('xbombAPR', xbombYearlyAPR);

  // const cashStat = useCashPriceInEstimatedTWAP();

  return (
    <Page>
      <BackgroundImage />
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      {!!account ? (
        <>
          <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
            Supply Assets
          </Typography>
          <Grid container justify="center">
            <Box mt={3} style={{ width: '600px' }}>
              <Alert variant="filled" severity="error">
                <h2>All features are not available yet!</h2>
                <p>
                  <b>Test our single asset staking features while we finish building our new web UI!</b>
                </p>

              </Alert>

            </Box>
          </Grid>



          <Box mt={5}>
            <Grid container justify="center" spacing={3}>

              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>BTCB AVAILABLE</Typography>
                    <Typography>{Number(stakedBtcbBalance)} BTCB</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>BOMB AVAILABLE</Typography>
                    <Typography>{Number(stakedBombBalance)} BOMB</Typography>
                  </CardContent>
                </Card>
              </Grid>
              {/* <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>
                      BOMB PEG <small>(TWAP)</small>
                    </Typography>
                    <Typography> BTC</Typography>
                    <Typography>
                      <small>per 10,000 BOMB</small>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid> */}
              {/* <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>APR</Typography>
                    <Typography>{xbombYearlyAPR}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>Daily APR</Typography>
                    <Typography>{xbombDailyAPR}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>BOMB Staked</Typography>
                    <Typography>{roundAndFormatNumber(bombTotalStaked)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>BOMB Staked USD</Typography>
                    <Typography>${roundAndFormatNumber(xbombTVL, 2)}</Typography>
                  </CardContent>
                </Card>
              </Grid> */}
            </Grid>


            <Box mt={4}>
              <StyledBoardroom>
                <StyledCardsWrapper>
                  {/* <StyledCardWrapper>
                    <Harvest />
                  </StyledCardWrapper> */}
                  {/* <Spacer /> */}
                  <StyledCardWrapper>

                    <SupplyBtcb />
                  </StyledCardWrapper>
                  <Spacer />
                  <StyledCardWrapper>

                    <SupplyBomb />
                  </StyledCardWrapper>
                </StyledCardsWrapper>
              </StyledBoardroom>
            </Box>
            <Box mt={4}>
              <StyledBoardroom>
                <StyledCardsWrapper>
                  {/* <StyledCardWrapper>
                    <Harvest />
                  </StyledCardWrapper> */}
                  {/* <Spacer /> */}
                  <StyledCardWrapper>
                    {/* <Box>
                      <Card>
                        <CardContent>
                          <h2>About xBOMB & Rewards</h2>
                          <p><strong>We are currently depositing 10,000 BOMB per week into the staking pool until our BTC Single Staking service is launched.</strong></p>
                          <p>xBOMB will be the governance token required to cast votes on protocol decisions.</p>
                          <p>20% of all BOMB minted will be deposited into the xBOMB smart contract, increasing the amount of BOMB that can be redeemed for each xBOMB. Rewards will be deposited at random times to prevent abuse.</p>
                          <p>Functionality will be developed around xBOMB including using it as collateral to borrow other assets.</p>
                          <p>Reward structure subject to change based on community voting.</p>
                        </CardContent>
                      </Card>
                    </Box> */}
                  </StyledCardWrapper>
                </StyledCardsWrapper>
              </StyledBoardroom>
            </Box>
            {/* <Grid container justify="center" spacing={3}>
            <Grid item xs={4}>
              <Card>
                <CardContent align="center">
                  <Typography>Rewards</Typography>

                </CardContent>
                <CardActions style={{justifyContent: 'center'}}>
                  <Button color="primary" variant="outlined">Claim Reward</Button>
                </CardActions>
                <CardContent align="center">
                  <Typography>Claim Countdown</Typography>
                  <Typography>00:00:00</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent align="center">
                  <Typography>Stakings</Typography>
                  <Typography>{getDisplayBalance(stakedBalance)}</Typography>
                </CardContent>
                <CardActions style={{justifyContent: 'center'}}>
                  <Button>+</Button>
                  <Button>-</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid> */}
          </Box>
          {/* 
          <Box mt={5}>
            <Grid container justify="center" spacing={3} mt={10}>
              <Button
                disabled={stakedBombBalance.eq(0) || (!canWithdraw && !canClaimReward)}
                onClick={onRedeem}
                className={
                  stakedBombBalance.eq(0) || (!canWithdraw && !canClaimReward)
                    ? 'shinyButtonDisabledSecondary'
                    : 'shinyButtonSecondary'
                }
              >
                Claim &amp; Withdraw
              </Button>
            </Grid>
          </Box> */}
        </>
      ) : (
        <UnlockWallet />
      )}
    </Page>
  )
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

export default Supply;
