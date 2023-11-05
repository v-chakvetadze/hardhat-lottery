declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ETHERSCAN_API_KEY: string;
            GOERLI_RPC_URL: string;
            PRIVATE_KEY: string;
            COINMARKETCAP_API_KEY: string;
            SEPOLIA_RPC_URL: string;
            SEPOLIA_PRIVATE_KEY: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
