import { EventLog } from "ethers";
import { ethers } from "hardhat";
import { Lottery, VRFCoordinatorV2Mock } from "typechain-types";

const mockKeepers = async () => {
    console.log("start");
    try {
        const lottery = await ethers.getContract<Lottery>("Lottery");
        const checkData = ethers.keccak256(ethers.toUtf8Bytes(""));
        const { upkeepNeeded } = await lottery.checkUpkeep.staticCall(checkData);
        if (!upkeepNeeded) {
            console.log("No upkeep needed");
            return;
        }

        const tx = await lottery.performUpkeep(checkData);
        const txReceipt = await tx.wait(1);

        let requestId;
        if (txReceipt?.logs?.[1]) {
            const l = txReceipt.logs[1] as EventLog;
            requestId = l.args[0];
        }

        const vrfCoordinatorV2Mock = await ethers.getContract<VRFCoordinatorV2Mock>(
            "VRFCoordinatorV2Mock"
        );
        await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, await lottery.getAddress());
        console.log("fulfill");

        const recentWinner = await lottery.getRecentWinner();
        console.log("recent winner", recentWinner);
    } catch (e) {
        console.log(e);
    }
};

mockKeepers();
