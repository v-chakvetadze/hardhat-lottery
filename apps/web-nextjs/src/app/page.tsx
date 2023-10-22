import { Account } from "../components/Account";
import { Connect } from "../components/Connect";
import { Connected } from "../components/Connected";
import { NetworkSwitcher } from "../components/NetworkSwitcher";
import { GetEntranceFee } from "../components/GetEntranceFee";
import ClientOnly from "./clientOnly";

export default async function Index() {
    /*
     * Replace the elements below with your own.
     *
     * Note: The corresponding styles are in the ./index.@emotion/styled file.
     */
    return (
        <div>
            <h1>wagmi + Next.js</h1>
            <ClientOnly>
                <Connect />
                <Connected>
                    <hr />
                    <h2>Network</h2>
                    <NetworkSwitcher />
                    <br />
                    <hr />
                    <h2>Account</h2>
                    <Account />
                    <br />
                    <hr />
                    <h2>Get Entrance Fee</h2>
                    <GetEntranceFee />
                </Connected>
            </ClientOnly>
        </div>
    );
}
