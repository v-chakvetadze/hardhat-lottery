import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";

const BASE_FEE = ethers.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {
        deployments: { deploy, log },
        getNamedAccounts,
    } = hre;

    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Local  network deteced. Deploying mocks");
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        });
        log("-------------- Mock deployed --------------");
    }
};

export default func;
func.tags = ["all", "mocks"];
