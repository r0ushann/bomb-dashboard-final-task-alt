import { useEffect, useState } from 'react';
import config from './../config';

/**
 * For more read https://github.com/NoahZinsmeister/web3-react/blob/6737868693adb7e1e28ae80499e19901e9aae45a/example/hooks.ts#L33
 * And https://docs.metamask.io/guide/ethereum-provider.html
 * @param provider ethereum provider in this case is the window.ethereum available due to metamask being installed
 * @returns
 */
export const connectToNetwork = async (provider: any) => {
  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: `0x${config.chainId.toString(16)}`,
        chainName: config.networkName,
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.ankr.com/bsc'],
        blockExplorerUrls: [config.ftmscanUrl],
      },
    ],
  });
};

const usePromptNetwork = () => {
  const [networkPrompt, setNetworkPrompt] = useState(false);
  const { ethereum } = window as any;

  useEffect(() => {
    if (!networkPrompt) {
      if (ethereum && ethereum.networkVersion !== config.chainId.toString()) {
        connectToNetwork(ethereum);
        setNetworkPrompt(true);
      }
    }
  }, [networkPrompt, ethereum]);
};

export default usePromptNetwork;
