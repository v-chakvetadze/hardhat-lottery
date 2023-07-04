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

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", async () => {
          let lottery: Lottery,
              vrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
              lotteryEntranceFee: bigint,
              deployer: string,
              interval: bigint;
          const chainId = network.config.chainId;
          validateNetworkId(chainId);

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              lottery = await ethers.getContract("Lottery", deployer);
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
              lotteryEntranceFee = await lottery.getEntranceFee();
              interval = await lottery.getInterval();
          });

          describe("constructor", async () => {
              it("Initializes the lottery correctly", async () => {
                  const lotteryState = await lottery.getLotteryState();
                  assert.equal(lotteryState.toString(), "0");
                  assert.equal(interval.toString(), networkConfig[chainId].interval);
              });
          });

          describe("enterLottery", async () => {
              it("reverts when you dont pay enough", async () => {
                  await expect(lottery.enterLottery()).to.be.revertedWithCustomError(
                      lottery,
                      "Lottery__NotEnoughETHEntered"
                  );
              });
              it("records players when they enter", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  const newPlayer = await lottery.getPlayer(0);
                  assert.equal(newPlayer, deployer);
              });
              it("emits event on enter", async () => {
                  await expect(lottery.enterLottery({ value: lotteryEntranceFee })).to.emit(
                      lottery,
                      "LotteryEnter"
                  );
              });
              it("doesnt allow entrance when raffle is calculating", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1]);
                  await network.provider.send("evm_mine", []);
                  await lottery.performUpkeep("0x");
                  await expect(
                      lottery.enterLottery({ value: lotteryEntranceFee })
                  ).to.be.revertedWithCustomError(lottery, "Lottery__NotOpen");
              });
          });

          /*describe("checkUpkeep", async () => {
              it("returns false if people haven't sent any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x");
                  assert(!upkeepNeeded);
              });
              it("returns false if lottery isn't open", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  await lottery.performUpkeep("0x"); 
                  const lotteryState = await lottery.getLotteryState();
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x"); 
                  assert.equal(lotteryState.toString() == "1", upkeepNeeded == false);
              });
              it("returns false if enough time hasn't passed", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  await network.provider.send("evm_increaseTime", [Number(interval) - 5]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x"); 
                  assert(!upkeepNeeded);
              });
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x");
                  assert(upkeepNeeded);
              });
          });*/

          describe("performUpkeep", async () => {
              it("it can only run if checkUpkeep is true", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1]);
                  await network.provider.send("evm_mine", []);
                  const tx = await lottery.performUpkeep("0x");
                  assert(tx);
              });
              it("reverts when checkUpkeep is false", async () => {
                  await expect(lottery.performUpkeep("0x")).to.be.revertedWithCustomError(
                      lottery,
                      "Lottery__UpkeepNotNeeded"
                  );
              });
              it("updates the raffle state, emits an event and calls the VRF coordinator", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1]);
                  await network.provider.send("evm_mine", []);
                  const txResponse = await lottery.performUpkeep("0x");
                  const txReceipt = await txResponse.wait(1);
                  const lotteryState = await lottery.getLotteryState();
                  const { requestId } = (
                      txReceipt?.logs[1] as TypedEventLog<RandomWordsRequestedEvent.Event>
                  ).args;
                  assert(requestId > 0);
                  assert(Number(lotteryState) == 1);
              });
          });

          describe("fulfillRandomWords", async () => {
              beforeEach(async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee });
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1]);
                  await network.provider.send("evm_mine", []);
              });

              it("can only be called after performUpkeer", async () => {
                  const address = await lottery.getAddress();
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, address)
                  ).to.be.revertedWith("nonexistent request");
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, address)
                  ).to.be.revertedWith("nonexistent request");
              });

              it("picks a winner, resets the lottery and sends money", async () => {
                  const additionalEntrants = 3;
                  const startingAccountIndex = 1;
                  const accounts = await ethers.getSigners();

                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      const accountConnectedLottery = lottery.connect(accounts[i]);
                      await accountConnectedLottery.enterLottery({ value: lotteryEntranceFee });
                  }

                  const startingTimeStamp = await lottery.getLatestTimeStamp();

                  await new Promise<void>(async (resolve, reject) => {
                      const evt = await lottery.getEvent("WinnerPicked");
                      await lottery.once(evt, async () => {
                          try {
                              const recentWinner = await lottery.getRecentWinner();
                              const lotteryState = await lottery.getLotteryState();
                              const endingTimeStamp = await lottery.getLatestTimeStamp();
                              const numPlayers = await lottery.getNumberOfPlayers();
                              //   const winnerEndingBalance = await accounts[1].getBalance();

                              assert(Number(numPlayers) === 0);
                              assert(Number(lotteryState) === 0);
                              assert(endingTimeStamp > startingTimeStamp);
                              //   assert.equal(
                              //       winnerEndingBalance.toString(),
                              //       winnerStartingBalance.add(
                              //           raffleEntranceFee
                              //               .mul(additionalEntrants)
                              //               .add(lotteryEntranceFee)
                              //               .toString()
                              //       )
                              //   );
                              resolve();
                          } catch (e) {
                              reject(e);
                          }
                          
                      });

                      const tx = await lottery.performUpkeep("0x");
                      const txReceipt = await tx.wait(1);
                      const { requestId } = (
                          txReceipt?.logs[1] as TypedEventLog<RandomWordsRequestedEvent.Event>
                      ).args;
                      const address = await lottery.getAddress();
                      //const winnerStartingBalance=await accounts[1].getBalance();
                      await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, address);
                  });
              });
          });
      });
