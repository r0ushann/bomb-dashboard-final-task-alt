import React, { useMemo } from 'react';
import { useWallet } from 'use-wallet';
import styled from 'styled-components';
import Stake from './components/Stake';
import { makeStyles } from '@material-ui/core/styles';

import { Box, Card, CardContent, Typography, Grid } from '@material-ui/core';
import { roundAndFormatNumber } from '../../0x';

import { Alert } from '@material-ui/lab';

import UnlockWallet from '../../components/UnlockWallet';
import Page from '../../components/Page';

import useXbombBalance from '../../hooks/useXbombBalance';
import useXbombAPR from '../../hooks/useXbombAPR';
import useStakedTotalBombBalance from '../../hooks/useTotalStakedBombBalance';
import { createGlobalStyle } from 'styled-components';
import { Helmet } from 'react-helmet';

import HomeImage from '../../assets/img/background.jpg';
import useFetchBombAPR from '../../hooks/useFetchBombAPR';
const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;
const TITLE = 'bomb.money | xBOMB - BOMB Staking';

const useStyles = makeStyles((theme) => ({
  gridItem: {
    height: '100%',
    [theme.breakpoints.up('md')]: {
      height: '90px',
    },
  },
}));

const Staking = () => {
  const classes = useStyles();
  const { account } = useWallet();
  // const { onRedeem } = useRedeemOnBoardroom();
  //  const stakedBombBalance = useStakedBombBalance();
  const xbombBalance = useXbombBalance();
  const xbombRate = Number(xbombBalance / 1000000000000000000).toFixed(4);
  const xbombAPR = useXbombAPR();
  // console.log("xbombAPR", xbombAPR)
  //const xbombTVL = xbombAPR.TVL;
  const xbombPrintApr = useFetchBombAPR();
  // console.log("xbombPrintApr", xbombPrintApr)

  const xbombPrintAprNice = useMemo(() => (xbombPrintApr ? Number(xbombPrintApr).toFixed(2) : null), [xbombPrintApr]);

  const stakedTotalBombBalance = useStakedTotalBombBalance();
  const bombTotalStaked = Number(stakedTotalBombBalance / 1000000000000000000).toFixed(0);
  const xbombTVL = useMemo(() => (xbombAPR ? Number(xbombAPR.TVL).toFixed(0) : null), [xbombAPR]);
  // const xbombDailyAPR = useMemo(() => (xbombAPR ? Number(xbombAPR.dailyAPR).toFixed(2) : null), [xbombAPR]);
  //const xbombYearlyAPR = useMemo(() => (xbombAPR ? Number(xbombAPR.yearlyAPR).toFixed(2) : null), [xbombAPR]);

  // console.log('xbombAPR', xbombYearlyAPR);

  // const cashStat = useCashPriceInEstimatedTWAP();

  return (
    <Page>
      <BackgroundImage />
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
          <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
            BOMB Staking for xBOMB
          </Typography>
          <Grid container justify="center">
            <Box mt={3} style={{ width: '600px' }}>
              <Alert variant="filled" severity="info">
                <b> Most rewards are generated from boardroom printing!</b>
                <br />
                20% of all BOMB minted - from protocol allocation, does not impact BSHARE boardroom printing.
                <br />
                If TWAP of BOMB peg is not over 1.01, yield will be reduced.
                <br />
                <br />
                The APR (Minted BOMB) shown is based on our latest print, and is only applied when the Boardroom is
                printing (over 1.01 peg at epoch start)
                <br />
                {/* <br />We are currently in debt phase, APR will be approximately 3x higher once debt is repaid. */}
              </Alert>
            </Box>
          </Grid>

          <Box mt={5}>
            <Grid container justify="center" spacing={3}>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>1 xBOMB =</Typography>
                    <Typography>{Number(xbombRate)} BOMB</Typography>
                  </CardContent>
                </Card>
              </Grid>
              {/* <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>
                      BOMB PEG <small>(TWAP)</small>
                    </Typography>
                    <Typography>{scalingFactor} BTC</Typography>
                    <Typography>
                      <small>per 10,000 BOMB</small>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid> */}
              {/* <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>Historic APR</Typography>
                    <Typography>{xbombYearlyAPR}%</Typography>
                  </CardContent>
                </Card>
              </Grid> */}
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>APR (Minted BOMB)</Typography>
                    <Typography>{xbombPrintAprNice}%</Typography>
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
              {!!account && (
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>xBOMB TVL</Typography>
                    <Typography>${roundAndFormatNumber(xbombTVL, 2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              )}
            </Grid>

            <Box mt={4}>
              <StyledBoardroom>
                <StyledCardsWrapper>
                  {/* <StyledCardWrapper>
                    <Harvest />
                  </StyledCardWrapper> */}
                  {/* <Spacer /> */}

                  <StyledCardWrapper>
                    {!!account ? (
                      <Stake />
                    ) : (
                        <UnlockWallet />
                    )}
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
                    <Box>
                      <Card>
                        <CardContent>
                          <h2>About xBOMB & Rewards</h2>
                          {/* <p><strong>We are currently depositing 10,000 BOMB per week into the staking pool until our BTC Single Staking service is launched.</strong></p> */}
                          <p>xBOMB will be the governance token required to cast votes on protocol decisions.</p>
                          <p>
                            20% of all BOMB minted will be deposited into the xBOMB smart contract, increasing the
                            amount of BOMB that can be redeemed for each xBOMB. Rewards will be deposited at random
                            times to prevent abuse.
                          </p>
                          <p>
                            Functionality will be developed around xBOMB including using it as collateral to borrow
                            other assets.
                          </p>
                          <p>Reward structure subject to change based on community voting.</p>
                        </CardContent>
                      </Card>
                    </Box>
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
    </Page>
  );
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

export default Staking;
