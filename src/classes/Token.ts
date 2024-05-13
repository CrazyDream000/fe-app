import { BigNumberish, Call } from "starknet";

import {
  AMM_ADDRESS,
  AMM_METHODS,
  BTC_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
} from "../constants/amm";

export enum TokenKey {
  ETH = "eth",
  USDC = "usdc",
  BTC = "btc",
  STRK = "strk",
}

const TOKENS: [TokenKey, string, number, string][] = [
  [TokenKey.ETH, "ETH", 18, ETH_ADDRESS],
  [TokenKey.USDC, "USDC", 6, USDC_ADDRESS],
  [TokenKey.BTC, "wBTC", 8, BTC_ADDRESS],
  [TokenKey.STRK, "STRK", 18, STRK_ADDRESS],
];

export class Token {
  private _id: TokenKey;
  private _symbol: string;
  private _decimals: number;
  private _address: string;

  static instances = TOKENS.map(
    (args) => new Token(args[0], args[1], args[2], args[3])
  );

  private constructor(
    id: TokenKey,
    symbol: string,
    decimals: number,
    address: string
  ) {
    this._id = id;
    this._symbol = symbol;
    this._decimals = decimals;
    this._address = address;
    this._id = id;
  }

  static byKey(key: TokenKey): Token {
    const match = this.instances.find((token) => token.id === key);
    if (match) {
      return match;
    }
    // unreachable
    throw new Error(`Token "${key}" does not exist`);
  }

  static byAddress(address: BigNumberish): Token {
    const bigIntAddress = BigInt(address);

    const match = this.instances.find(
      (token) => BigInt(token.address) === bigIntAddress
    );

    if (match) {
      return match;
    }

    // unreachable
    throw new Error(`Token with address "${address}" does not exist`);
  }

  approveCalldata(amount: BigNumberish): Call {
    return {
      contractAddress: this.address,
      entrypoint: AMM_METHODS.APPROVE,
      calldata: [AMM_ADDRESS, BigInt(amount).toString(10), "0"],
    };
  }

  // GETTERS
  get id(): TokenKey {
    return this._id;
  }

  get symbol(): string {
    return this._symbol;
  }

  get decimals(): number {
    return this._decimals;
  }

  get address(): string {
    return this._address;
  }
}
