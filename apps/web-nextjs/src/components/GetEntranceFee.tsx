"use client";
import { formatEther } from "viem";
import { waitForTransaction } from "@wagmi/core";
import {
    useLotteryGetEntranceFee,
    useLotteryEnterLottery,
    useLotteryGetNumberOfPlayers,
    useLotteryGetRecentWinner,
} from "../generated";

const sepoliaAddress = "0x49b404A394c666A3231F60DC887E53ba12e6D75C";
const hardhatAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const address = hardhatAddress;

export const GetEntranceFee = () => {
    const { data: entranceFee, refetch: refetchEntranceFee } = useLotteryGetEntranceFee({
        address,
    });
    const fee = entranceFee || BigInt(0);

    const { data: numberOfPlayers, refetch: refetchNumberOfPlayers } = useLotteryGetNumberOfPlayers(
        {
            address,
        }
    );

    const { data: recentWinner, refetch: refetchRecentWinner } = useLotteryGetRecentWinner({
        address,
    });

    const { writeAsync: enterLottery } = useLotteryEnterLottery({
        value: fee,
        address,
        onSuccess: (data, vars, context) => undefined,
        //console.log("enter lottery success", data, vars, context),
        onError: (err, vars, context) => console.log("Error", err),
    });

    const enterLotteryClick = async () => {
        const txResult = await enterLottery();
        console.log("lottery entered", txResult);
        const waitResult = await waitForTransaction({ hash: txResult.hash });
        console.log("tx receipt", waitResult);
        refetchEntranceFee();
        refetchNumberOfPlayers();
        refetchRecentWinner();
    };

    return (
        <>
            <div>{`Entrance fee ${formatEther(fee)} ETH`}</div>
            <div>{`Total players: ${numberOfPlayers}`}</div>
            <div>{`Recent winner is: ${recentWinner}`}</div>
            <button onClick={enterLotteryClick}>Enter lottery</button>
        </>
    );
};
