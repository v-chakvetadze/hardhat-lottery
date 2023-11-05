import { configureChains, createConfig } from "wagmi";
import { goerli, sepolia, mainnet, hardhat } from "wagmi/chains";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { alchemyApiKey } from "./webConfig";

const walletConnectProjectId = " ";

const useLocalhost = true;
// process.env.NODE_ENV === "development"
const chain = useLocalhost ? hardhat : sepolia;

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [/*mainnet,*/ chain],
    useLocalhost
        ? [publicProvider()]
        : [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()]
);

export const config = createConfig({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        /*new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: walletConnectProjectId,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),*/
    ],
    publicClient,
    webSocketPublicClient,
});
