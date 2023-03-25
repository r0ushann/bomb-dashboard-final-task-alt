import React, {useMemo} from 'react';
import clsx from 'clsx';
import {Link} from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@material-ui/core';

import ListItemLink from '../ListItemLink';
import useBombStats from '../../hooks/useBombStats';
import useBtcStats from '../../hooks/useBtcStats';
import useShareStats from '../../hooks/usebShareStats';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AccountButton from './AccountButton';

import bombLogo from '../../assets/img/bomb-logo.png';
import {roundAndFormatNumber} from '../../0x';
//import TokenSymbol from '../TokenSymbol';

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  appBar: {
    color: '#f9d749',
    'background-color': '#171923',
    // borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '10px',
    marginBottom: '3rem',
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
  hide: {
    display: 'none',
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    fontFamily: 'Rubik',
    fontSize: '0px',
    flexGrow: 1,
  },
  link: {
    textTransform: 'uppercase',
    color: '#f9d749',
    fontSize: '18px',
    marginTop: '15px',
    margin: theme.spacing(10, 1, 1, 2),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  brandLink: {
    textDecoration: 'none',
    color: '#f9d749',
    '&:hover': {
      textDecoration: 'none',
    },
  },
}));

const Nav = () => {
  const matches = useMediaQuery('(min-width:900px)');
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const bombStats = useBombStats();
  const btcStats = useBtcStats();
  const shareStats = useShareStats();

  // const [connected, setConnected] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const btcPriceInDollars = useMemo(() => (btcStats ? Number(btcStats).toFixed(2) : null), [btcStats]);
  const bombPriceInDollars = useMemo(
    () => (bombStats ? Number(bombStats.priceInDollars).toFixed(2) : null),
    [bombStats],
  );
  const sharePriceInDollars = useMemo(
    () => (shareStats ? Number(shareStats.priceInDollars).toFixed(2) : null),
    [shareStats],
  );

  return (
    <AppBar position="sticky" elevation={0} className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        {matches ? (
          <>
            <Typography variant="h6" color="inherit" noWrap style={{flexGrow: '0'}} className={classes.toolbarTitle}>
              {/* <a className={ classes.brandLink } href="/">Bomb Money</a> */}
              <Link to="/" color="inherit" className={classes.brandLink}>
                <img alt="bomb.money" src={bombLogo} height="60px" />
              </Link>
            </Typography>
            <Box style={{paddingLeft: '15px', fontSize: '1rem', flexGrow: '1'}}>
              <Link to="/" className={'navLink ' + classes.link}>
                Home
              </Link>
              <div className={'navDropdownMenu'} style={{"display": "inline", "position": "relative"}}>
                <span className={'navDropdownMenuRoot navLink ' + classes.link}>Earn</span>
                <div className={'navDropdownMenuContainer'}>
                  <ul className={'navDropdownMenuWrapper'}>
                    <li className={'navDropdownMenuItem'}>
                      <Link to="/farm" className={'navLink ' + classes.link}>
                        Farm
                      </Link>
                    </li>
                    <li className={'navDropdownMenuItem'}>
                      <Link to="/xbomb" className={'navLink ' + classes.link}>
                        xBOMB
                      </Link>
                    </li>
                    <li className={'navDropdownMenuItem'}>
                      <Link to="/boardroom" className={'navLink ' + classes.link}>
                        Boardroom
                      </Link>
                    </li>
                    <li className={'navDropdownMenuItem'}>
                      <a
                          href="https://bomb.farm"
                          className={'navLink ' + classes.link}
                          rel="noopener noreferrer"
                          //  target="_blank"
                      >
                        Vaults
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <Link to="/bond" className={'navLink ' + classes.link}>
                Bond
              </Link>


              
 
              

              {/* <Link color="textPrimary" to="/sbs" className={classes.link}>
                SBS
              </Link>
              <Link color="textPrimary" to="/liquidity" className={classes.link}>
                Liquidity
              </Link>
              <Link color="textPrimary" to="/regulations" className={classes.link}>
                Regulations
              </Link> */}
                      <a
                href="https://bombbtc.com"
                className={'navLink ' + classes.link}
                rel="noopener noreferrer"
              //  target="_blank"
              >
                BTC Staking
              </a>
                          <a
                href="https://shop.bomb.money"
                className={'navLink ' + classes.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                Merch
              </a>
                               <a
                href="https://vote.bomb.money"
                className={'navLink ' + classes.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                Vote
              </a>
                        <a
                href="https://docs.bomb.money"
                className={'navLink ' + classes.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                Docs
              </a>
            </Box>

            <Box
              style={{
                flexGrow: '0',
                paddingLeft: '15px',
                paddingTop: '5px',
                fontSize: '1rem',
                paddingRight: '15px',
                height: '30px',
                display: 'flex',
              }}
            >
              <div className="navTokenIcon bomb"></div>{' '}
              <div className="navTokenPrice">${roundAndFormatNumber(Number(bombPriceInDollars), 2)}</div>
              <div className="navTokenIcon bshare"></div>{' '}
              <div className="navTokenPrice">${roundAndFormatNumber(Number(sharePriceInDollars), 2)}</div>
              <div className="navTokenIcon btc"></div>{' '}
              <div className="navTokenPrice">${roundAndFormatNumber(Number(btcPriceInDollars), 2)}</div>
            </Box>
            <AccountButton text="Connect" />
          </>
        ) : (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>

            <img
              alt="bomb.money"
              src={bombLogo}
              style={{height: '40px', marginTop: '-10px', marginLeft: '10px', marginRight: '15px'}}
            />
            <AccountButton text="Connect" />
            <Drawer
              className={classes.drawer}
              onClose={handleDrawerClose}
              // onEscapeKeyDown={handleDrawerClose}
              // onBackdropClick={handleDrawerClose}
              variant="temporary"
              anchor="left"
              open={open}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <div>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === 'rtl' ? (
                    <ChevronRightIcon htmlColor="white" />
                  ) : (
                    <ChevronLeftIcon htmlColor="white" />
                  )}
                </IconButton>
              </div>
              <Divider />
              <List>
                <ListItem>
                  <AccountButton text="Connect" />
                </ListItem>
                <ListItemLink primary="Home" to="/" />
                <ListItemLink primary="Farm" to="/farm" />
                <ListItemLink primary="xBOMB" to="/xbomb" />
                <ListItemLink primary="Boardroom" to="/boardroom" />
                <ListItemLink primary="Bond" to="/bond" />
                {/* <ListItemLink primary="SBS" to="/sbs" /> */}
                {/* <ListItemLink primary="Liquidity" to="/liquidity" /> */}
                {/* <ListItemLink primary="Regulations" to="/regulations" /> */}
                <ListItem button component="a" href="https://docs.bomb.money">
                  <ListItemText>Documentation</ListItemText>
                </ListItem>
                <ListItem button component="a" href="https://bomb.farm">
                  <ListItemText>Vaults</ListItemText>
                  </ListItem>
                  <ListItem button component="a" href="https://shop.bomb.money">
                  <ListItemText>Merch</ListItemText>
                  </ListItem>
                     <ListItem button component="a" href="https://vote.bomb.money">
                  <ListItemText>Vote</ListItemText>
                  </ListItem>
                <ListItem button component="a" href="https://bombbtc.com">
                  <ListItemText>BTC Staking</ListItemText>
                </ListItem>
              </List>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
