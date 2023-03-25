// @ts-nocheck
import React, {useEffect} from 'react';
import styled from 'styled-components';

import {useParams} from 'react-router-dom';
import {useWallet} from 'use-wallet';
import {makeStyles} from '@material-ui/core/styles';

import {Box, Button, Card, CardContent, Typography, Grid} from '@material-ui/core';

import PageHeader from '../../components/PageHeader';
import Spacer from '../../components/Spacer';
import UnlockWallet from '../../components/UnlockWallet';
import Harvest from './components/Harvest';
import Stake from './components/Stake';
import useBank from '../../hooks/useBank';
import useStatsForPool from '../../hooks/useStatsForPool';
import useRedeem from '../../hooks/useRedeem';
import {Bank as BankEntity} from '../../bomb-finance';
import useBombFinance from '../../hooks/useBombFinance';
import {Alert} from '@material-ui/lab';
//import { bankDefinitions } from '../../config';

const useStyles = makeStyles((theme) => ({
  gridItem: {
    height: '100%',
    [theme.breakpoints.up('md')]: {
      height: '90px',
    },
  },
}));

const Bank: React.FC = () => {
  useEffect(() => window.scrollTo(0, 0));
  const classes = useStyles();
  const {bankId} = useParams();
  const bank = useBank(bankId);

  const {account} = useWallet();
  const { onRedeem } = useRedeem(bank);


   let statsOnPool = useStatsForPool(bank);
  // console.log(statsOnPool);

  //   if (bank.depositTokenName.includes('80BOMB-20BTCB-LP') || bank.depositTokenName.includes('80BSHARE-20WBNB-LP')) {
  //     statsOnPool = {
  //       dailyAPR: 'COMING SOON',
  //       yearlyAPR: 'COMING SOON',
  //       TVL: 'COMING SOON',
  //     }
  //   } 
  
  
  //const statsOnPool = useStatsForPool(bank);
  let vaultUrl: string;
  if (bank.depositTokenName.includes('BOMB-BTCB')) {
    vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
  
   else if (bank.depositTokenName.includes('BOMB-BSHARE')) {
    vaultUrl = 'https://www.bomb.farm/#/bsc/';
  }
     else if (bank.depositTokenName.includes('BSHARE-BNB')) {
    vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bshare-wbnb';
  }

  return account && bank ? (
    <>
      <PageHeader
        icon="💣"
   //     subtitle={`Deposit ${bank?.depositTokenName} and earn ${bank?.earnTokenName}`}
        title={bank?.name}
      />
         <Box mt={5}>
          {(vaultUrl) ? (
        <Grid container justify="center" spacing={3} style={{ marginBottom: '30px' }}>
        <Alert variant="filled" severity="info">
            <h3>Our autocompounding vaults are live!</h3><br />
            We support zapping tokens, and auto-compound every 2 hours!<br />
            Check it out here: <a href={vaultUrl}>{vaultUrl}</a>
            </Alert> </Grid> 
          ) : ""}
      </Box>
      <Box>
        <Grid container justify="center" spacing={3} style={{marginBottom: '50px'}}>
          <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
            <Card className={classes.gridItem}>
              <CardContent style={{textAlign: 'center'}}>
                <Typography>APR</Typography>
                <Typography>{bank.closedForStaking ? '0.00' : statsOnPool?.yearlyAPR}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
            <Card className={classes.gridItem}>
              <CardContent style={{textAlign: 'center'}}>
                <Typography>Daily APR</Typography>
                <Typography>{bank.closedForStaking ? '0.00' : statsOnPool?.dailyAPR}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
            <Card className={classes.gridItem}>
              <CardContent style={{textAlign: 'center'}}>
                <Typography>TVL</Typography>
                <Typography>${statsOnPool?.TVL}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
   
      <Box mt={5}>
        <StyledBank>
          <StyledCardsWrapper>
            <StyledCardWrapper>
              <Harvest bank={bank} />
            </StyledCardWrapper>
            <Spacer />
            <StyledCardWrapper>{<Stake bank={bank} />}</StyledCardWrapper>
          </StyledCardsWrapper>
          <Spacer size="lg" />
          {bank.depositTokenName.includes('LP') && <LPTokenHelpText bank={bank} />}
          <Spacer size="lg" />
          <div>
            <Button onClick={onRedeem} className="shinyButtonSecondary">
              Claim &amp; Withdraw
            </Button>
          </div>
          <Spacer size="lg" />
        </StyledBank>
      </Box>
    </>
  ) : !bank ? (
    <BankNotFound />
  ) : (
    <UnlockWallet />
  );
};

const LPTokenHelpText: React.FC<{bank: BankEntity}> = ({bank}) => {
  const bombFinance = useBombFinance();
  const bombAddr = bombFinance.BOMB.address;
  const bshareAddr = bombFinance.BSHARE.address;
    const busmAddr = bombFinance.BUSM.address;
  const busdAddr = bombFinance.BUSD.address;

  //const depositToken = bank.depositTokenName;
  //console.log({depositToken})
  let pairName: string;
  let uniswapUrl: string;
 // let vaultUrl: string;
  if (bank.depositTokenName.includes('BOMB-BTCB')) {
    pairName = 'BOMB-BTCB pair';
    uniswapUrl = 'https://pancakeswap.finance/add/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c/' + bombAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
    else if (bank.depositTokenName.includes('80BOMB-20BTCB-LP')) {
    pairName = 'BOMB MAXI 80% BOMB - 20% BTCB (at ACSI.finance)';
    uniswapUrl = 'https://app.acsi.finance/#/pool/0xd6f52e8ab206e59a1e13b3d6c5b7f31e90ef46ef000200000000000000000028/invest';
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
      else if (bank.depositTokenName.includes('80BSHARE-20WBNB-LP')) {
    pairName = 'BSHARE MAXI 80% BSHARE - 20% BNB (at ACSI.finance)';
    uniswapUrl = 'https://app.acsi.finance/#/pool/0x2c374ed1575e5c2c02c569f627299e902a1972cb000200000000000000000027/invest';
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
  else if (bank.depositTokenName.includes('BOMB-BSHARE')) {
    pairName = 'BOMB-BSHARE pair';
    uniswapUrl = 'https://pancakeswap.finance/add/' + bombAddr + '/' + bshareAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
      else if (bank.depositTokenName.includes('BUSM-BUSD')) {
    pairName = 'BUSM-BUSD pair';
    uniswapUrl = 'https://pancakeswap.finance/add/' + busmAddr + '/' + busdAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
    
  else {
    pairName = 'BSHARE-BNB pair';
    uniswapUrl = 'https://pancakeswap.finance/add/BNB/' + bshareAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bshare-bnb';

  }
  return (
    <Card>
      <CardContent>
        <StyledLink href={uniswapUrl} target="_blank">
          {`Provide liquidity for ${pairName} now!`}
        </StyledLink>
      </CardContent>
    </Card>
  );
};

const BankNotFound = () => {
  return (
    <Center>
      <PageHeader icon="🏚" title="Not Found" subtitle="You've hit a bank just robbed by unicorns." />
    </Center>
  );
};

const StyledBank = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledLink = styled.a`
  font-weight: 700;
  text-decoration: none;
  color: ${(props) => props.theme.color.primary.main};
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

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default Bank;
