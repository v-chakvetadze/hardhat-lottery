import { ethers, getNamedAccounts, network } from "hardhat";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
import { Lottery } from "../../typechain-types";
import { validateNetworkId } from "utils";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Staging Tests", async () => {
          let lottery: Lottery, lotteryEntranceFee: bigint, deployer: string;
          const chainId = network.config.chainId;
          validateNetworkId(chainId);

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              lottery = await ethers.getContractAtWithSignerAddress(
                  "Lottery",
                  "0x4Dcd9c7b45609dbeDdF5042Ec61987BfFd506ECa",
                  deployer
              );
              lotteryEntranceFee = await lottery.getEntranceFee();
          });

          describe("fulfillRandomWords", async () => {
              it("works with live network", (done) => {
                  (async () => {
                      try {
                          const startingTimeStamp = await lottery.getLatestTimeStamp();
                          const accounts = await ethers.getSigners();

                          const evt = await lottery.getEvent("WinnerPicked");
                          await lottery.once(evt, async () => {
                              console.log("WinnerPicked");
                              try {
                                  const recentWinner = await lottery.getRecentWinner();
                                  const lotteryState = await lottery.getLotteryState();
                                  const winnerEndingBalance = await ethers.provider.getBalance(
                                      accounts[0].address
                                  );
                                  const endingTimeStamp = await lottery.getLatestTimeStamp();

                                  await expect(lottery.getPlayer(0)).to.be.reverted;
                                  assert.equal(recentWinner.toString(), accounts[0].address);
                                  assert.equal(Number(lotteryState), 0);
                                  assert(
                                      winnerEndingBalance ===
                                          winnerStartingBalance + lotteryEntranceFee
                                  );
                                  assert(endingTimeStamp > startingTimeStamp);

                                  done();
                              } catch (e) {
                                  console.log((e as any)?.toString());
                                  done(e);
                              }
                          });
                          const tx = await lottery.enterLottery({ value: lotteryEntranceFee });
                          await tx.wait(1);
                          const winnerStartingBalance = await ethers.provider.getBalance(
                              accounts[0].address
                          );
                      } catch (e) {
                          console.log(e);
                          done(e);
                      }
                  })();
              });
          });
      });
