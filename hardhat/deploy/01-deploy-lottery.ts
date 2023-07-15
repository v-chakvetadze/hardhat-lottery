import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import { SubscriptionCreatedEvent } from "../typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock";
import { verify, validateNetworkId } from "../utils";
import { TypedEventLog } from "../typechain-types/common";

const VRF_SUB_FUND_AMOUNT = ethers.parseEther("30");
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {
        deployments: { deploy, log, get },
        getNamedAccounts,
        network,
    } = hre;

    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const isDevChain = developmentChains.includes(network.name);
    validateNetworkId(chainId);

    let vrfCoordinatorV2Address,
        subscriptionId: bigint = BigInt(0);
    if (isDevChain) {
        const vrfCoordinatorV2Mock = await ethers.getContract<VRFCoordinatorV2Mock>(
            "VRFCoordinatorV2Mock"
        );
        vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress();
        const createSubscriptionTx = await vrfCoordinatorV2Mock.createSubscription();
        const createSubscriptionTxReceipt = await createSubscriptionTx.wait(1);
        if (!createSubscriptionTxReceipt) throw new Error();

        const log = createSubscriptionTxReceipt
            .logs[0] as TypedEventLog<SubscriptionCreatedEvent.Event>;
        subscriptionId = log.args.subId;

        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    }

    const entranceFee = networkConfig[chainId].entranceFee;
    const gasLane = networkConfig[chainId].gasLane;
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
    const interval = networkConfig[chainId].interval;

    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ];
    const lottery = await deploy("Lottery", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: networkConfig[chainId].blockchainConfirmations || 1,
    });

    if (isDevChain) {
        const vrfCoordinatorV2 = await ethers.getContract<VRFCoordinatorV2Mock>(
            "VRFCoordinatorV2Mock"
        );
        await vrfCoordinatorV2.addConsumer(subscriptionId, lottery.address);
    }

    if (!isDevChain && process.env.ETHERSCAN_API_KEY) {
        await verify(lottery.address, args);
    }
};

export default func;
func.tags = ["all", "lottery"];
