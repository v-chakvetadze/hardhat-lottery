import { networkConfig } from "../helper-hardhat-config";

export const validateNetworkId: (networkId: any) => asserts networkId is keyof typeof networkConfig = (
    networkId
) => {
    const isHardhatNetwork = networkId === 31337;
    const isKnownNetwork = !!networkId && networkId in networkConfig;

    const isValidNetwork = isHardhatNetwork || isKnownNetwork;
    if (!isValidNetwork) throw new Error(`Invalid chain id: ${networkId}`);
};