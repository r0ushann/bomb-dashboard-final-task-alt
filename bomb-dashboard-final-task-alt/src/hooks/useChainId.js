import { useCallback, useEffect, useState } from 'react';

const useChainId = () => {
    const [chainId, setChainId] = useState(97);

    const fetchChainId = useCallback(async () => {
        if (window.ethereum) {
            const ethereum = window.ethereum;
            let chainId = await ethereum.request({
                method: 'eth_chainId',
            });
            chainId = parseInt(chainId, 16);
            setChainId(chainId);

            window.ethereum.on('networkChanged', function (chainId) {
                chainId = parseInt(chainId, 16);
                setChainId(chainId);
            });
        }
    }, []);

    useEffect(() => {
        fetchChainId().catch((err) => console.error(err.stack));

        const refreshChainId = setInterval(fetchChainId, 1000);
        return () => clearInterval(refreshChainId);
    }, [fetchChainId]);

    return chainId;
};

export default useChainId;