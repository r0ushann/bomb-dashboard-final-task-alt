import React, {Suspense, lazy} from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {ThemeProvider as TP} from '@material-ui/core/styles';
import {ThemeProvider as TP1} from 'styled-components';
import {UseWalletProvider} from 'use-wallet';
import usePromptNetwork from './hooks/useNetworkPrompt';
import BanksProvider from './contexts/Banks';
import BombFinanceProvider from './contexts/BombFinanceProvider';
import ModalsProvider from './contexts/Modals';
import store from './state';
import theme from './theme';
import newTheme from './newTheme';
import config from './config';
import Updaters from './state/Updaters';
import Loader from './components/Loader';
import Popups from './components/Popups';
import useChainId from './hooks/useChainId';
//import Regulations from './views/Regulations/Regulations';
import {RefreshContextProvider} from './contexts/RefreshContext';

const Home = lazy(() => import('./views/Home'));
const Farm = lazy(() => import('./views/Farm'));
const Boardroom = lazy(() => import('./views/Boardroom'));
const Bond = lazy(() => import('./views/Bond'));
const Xbomb = lazy(() => import('./views/Stake'));
const Supply = lazy(() => import('./views/Supply'));
// const SBS = lazy(() => import('./views/Sbs'));
// const Liquidity = lazy(() => import('./views/Liquidity'));

const NoMatch = () => (
  <h3 style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
    URL Not Found. <a href="/">Go back home.</a>
  </h3>
);

const App: React.FC = () => {
  // Clear localStorage for mobile users
  if (typeof localStorage.version_app === 'undefined' || localStorage.version_app !== '1.1') {
    localStorage.clear();
    localStorage.setItem('connectorId', '');
    localStorage.setItem('version_app', '1.1');
  }

  usePromptNetwork();

  return (
    <Providers>
      <Router>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/farm">
              <Farm />
            </Route>
            <Route path="/boardroom">
              <Boardroom />
            </Route>
            <Route path="/bond">
              <Bond />
            </Route>
            <Route path="/xbomb">
              <Xbomb />
            </Route>
            <Route path="/supply">
              <Supply />
            </Route>
            {/* <Route path="/sbs">
              <SBS />
            </Route> */}
            {/* <Route path="/regulations">
              <Regulations />
            </Route> */}
            {/* <Route path="/liquidity">
              <Liquidity />
            </Route> */}
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
        </Suspense>
      </Router>
    </Providers>
  );
};

const UseWalletProviderWrapper = (props: any) => {
  const chainId = useChainId();

  return <UseWalletProvider chainId={chainId} {...props}></UseWalletProvider>;
}

const Providers: React.FC = ({children}) => {
  return (
    <TP1 theme={theme}>
      <TP theme={newTheme}>
        <UseWalletProviderWrapper
                    chainId={config.chainId}

          connectors={{
            walletconnect: { rpcUrl: 'https://rpc.ankr.com/bsc' },
            walletlink: {
           //   url: config.defaultProvider,
              url: 'https://rpc.ankr.com/bsc',
              appName: 'bomb.money',
              appLogoUrl: 'https://raw.githubusercontent.com/bombmoney/bomb-assets/master/bomb-512.png',
            },
          }}
        >
          <Provider store={store}>
            <Updaters />
            <RefreshContextProvider>
              <BombFinanceProvider>
                <ModalsProvider>
                  <BanksProvider>
                    <>
                      <Popups />
                      {children}
                    </>
                  </BanksProvider>
                </ModalsProvider>
              </BombFinanceProvider>
            </RefreshContextProvider>
          </Provider>
        </UseWalletProviderWrapper>
      </TP>
    </TP1>
  );
};

export default App;
