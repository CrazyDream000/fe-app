import { UserBalance } from "./../types/wallet";
import { AccountInterface, Contract } from "starknet";
import ABI from "../abi/lptoken_abi.json";
import { TokenKey } from "../tokens/tokens";
import { BTC_ADDRESS, ETH_ADDRESS, USDC_ADDRESS } from "../constants/amm";

const CARM_TOKEN_ADDRESS =
  "0x3c0286e9e428a130ae7fbbe911b794e8a829c367dd788e7cfe3efb0367548fa";

const balanceFromTokenAddress = async (
  account: AccountInterface,
  tokenAddress: string
): Promise<bigint> => {
  const contract = new Contract(ABI, tokenAddress, account);
  const balance = await contract.balanceOf(account.address);
  return balance;
};

export const balanceOfEth = async (
  account: AccountInterface
): Promise<bigint> => {
  return balanceFromTokenAddress(account, ETH_ADDRESS);
};

export const balanceOfUsdc = async (
  account: AccountInterface
): Promise<bigint> => {
  return balanceFromTokenAddress(account, USDC_ADDRESS);
};

export const balanceOfBtc = async (
  account: AccountInterface
): Promise<bigint> => {
  return balanceFromTokenAddress(account, BTC_ADDRESS);
};

export const balanceOfCarmineToken = async (
  account: AccountInterface
): Promise<bigint> => balanceFromTokenAddress(account, CARM_TOKEN_ADDRESS);

export const getUserBalance = async (
  account: AccountInterface
): Promise<UserBalance | undefined> => {
  const promises = [
    balanceOfEth(account),
    balanceOfUsdc(account),
    balanceOfBtc(account),
  ];
  const values = await Promise.all(promises);
  return {
    [TokenKey.ETH]: values[0],
    [TokenKey.USDC]: values[1],
    [TokenKey.BTC]: values[2],
  };
};
