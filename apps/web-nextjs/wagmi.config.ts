import { defineConfig } from "@wagmi/cli";
import { etherscan, react, hardhat } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    react(),
    hardhat({
      project: "../../libs/contract",
      commands: {
        clean: 'npx hardhat clean',
        build: 'npx hardhat compile',
        rebuild: 'npx hardhat compile',
      },
    }),
  ],
});
