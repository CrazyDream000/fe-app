import { MetaMaskInpageProvider } from "@metamask/providers";

import { TokenKey } from "../classes/Token";

export enum SupportedWalletIds {
  ArgentX = "argentX",
  Braavos = "braavos",
  OKXWallet = "okxwallet",
  BitGet = "bitkeep",
}

export type UserBalance = {
  [key in TokenKey]: bigint;
};

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
