import { ethers } from "hardhat";

export const networkConfig = {
    5: {
        name: "goerli",
        blockchainConfirmations: 6,
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.parseEther("0.1"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "30",
    },
    31337: {
        name: "hardhat",
        blockchainConfirmations: 1,
        vrfCoordinatorV2: null,
        entranceFee: ethers.parseEther("0.1"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: null,
        callbackGasLimit: "500000",
        interval: "30",
    },
};

export const developmentChains = ["hardhat", "localhost"];
