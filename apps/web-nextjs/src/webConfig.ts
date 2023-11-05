import { Address } from "viem";

const alchemyApiKey = process.env.ALCHEMY_API_KEY!;
const hardhatContractAddress = process.env.NEXT_PUBLIC_HARDHAT_CONTRACT_ADDRESS! as Address;
const sepoliaContractAddress = process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS! as Address;

export { alchemyApiKey, hardhatContractAddress, sepoliaContractAddress };
