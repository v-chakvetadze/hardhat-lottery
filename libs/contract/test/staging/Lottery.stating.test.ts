import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { assert, expect } from "chai";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { Lottery } from "../../typechain-types";
import { validateNetworkId } from "utils";
import {
    RandomWordsRequestedEvent,
    VRFCoordinatorV2Mock,
} from "typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock";
import { TypedEventLog } from "typechain-types/common";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", async () => {
          let lottery: Lottery, lotteryEntranceFee: bigint, deployer: string;
          const chainId = network.config.chainId;
          validateNetworkId(chainId);

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              lottery = await ethers.getContract("Lottery", deployer);
              lotteryEntranceFee = await lottery.getEntranceFee();
          });

          describe("fulfillRandomWords", async () => {
              it("works with live network", async () => {
                  const startingTimeStamp = await lottery.getLatestTimeStamp();
                  const accounts = await ethers.getSigners();

                  await new Promise<void>(async (resolve, reject) => {
                      const evt = await lottery.getEvent("WinnerPicked");
                      console.log(1)
                      await lottery.once(evt, async () => {
                          console.log("WinnerPicked");
                          try {
                              const recentWinner = await lottery.getRecentWinner();
                              const lotteryState = await lottery.getLotteryState();
                              //const winnerEndingBalance = await accounts[0].getBalance();
                              const endingTimeStamp = await lottery.getLatestTimeStamp();

                              await expect(lottery.getPlayer(0)).to.be.reverted;
                              assert.equal(recentWinner.toString(), accounts[0].address);
                              assert.equal(Number(lotteryState), 0);
                              /*assert.equal(
                                  Number(winnerEndingBalance),
                                  Number(winnerStartingBalance.add(lotteryEntranceFee))
                              );*/
                              assert(endingTimeStamp > startingTimeStamp);
                          } catch (e) {
                            console.log((e as any)?.toString())
                              reject(e);
                          }
                      });
console.log(2)
                      const tx = await lottery.enterLottery({ value: lotteryEntranceFee });
                      await tx.wait(1);
                      console.log(3)
                      //const winnerStartingBalance = await accounts[0].getBalance();
                  });
              });
          });
      });
