import { bnToOptionSide, convertSizeToInt } from "../utils/conversions";
import {
  timestampToReadableDate,
  timestampToShortTimeDate,
  toHex,
} from "../utils/utils";
import { OptionSide, FinancialData, OptionStruct } from "../types/options";
import { BASE_MATH_64 } from "../constants/amm";
import { Pool } from "./Pool";
import { shortInteger } from "../utils/computations";
import { BigNumberish } from "starknet";
import { Cubit } from "../types/units";

export class Option extends Pool {
  public maturity: number;
  public maturityHex: string;
  public strike: number;
  public strikeHex: string;
  public side: OptionSide;
  public id: string;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    side: BigNumberish,
    maturity: BigNumberish,
    strike: bigint | number
  ) {
    super(base, quote, type);

    this.maturityHex = toHex(maturity);
    this.maturity = Number(BigInt(maturity));
    this.strikeHex = toHex(
      typeof strike === "bigint" ? strike : BigInt(strike) * BASE_MATH_64
    );
    this.strike =
      typeof strike === "number" ? strike : Number(strike / BASE_MATH_64);

    this.side = bnToOptionSide(side);
    this.id = this.generateId();
  }

  /**
   * Generates id that uniquily describes option
   */
  generateId(): string {
    return JSON.stringify({
      base: this.baseToken.id,
      quote: this.quoteToken.id,
      type: this.type,
      side: this.side,
      maturity: this.maturity,
      strike: this.strike,
    });
  }

  tradeCalldata(size: string | number): string[] {
    const targetSize = typeof size === "number" ? convertSizeToInt(size) : size;
    return [
      this.type,
      this.strikeHex, // cubit
      "0", // cubit - false
      this.maturityHex,
      this.side,
      targetSize,
      this.quoteToken.tokenAddress,
      this.baseToken.tokenAddress,
    ];
  }

  addPosition(size: BigNumberish, value: BigNumberish): OptionWithPosition {
    return new OptionWithPosition(
      this.baseToken.tokenAddress,
      this.quoteToken.tokenAddress,
      this.type,
      this.side,
      this.maturity,
      this.strike,
      size,
      value
    );
  }

  addPremia(premia: BigNumberish): OptionWithPremia {
    return new OptionWithPremia(
      this.baseToken.tokenAddress,
      this.quoteToken.tokenAddress,
      this.type,
      this.side,
      this.maturity,
      this.strike,
      premia
    );
  }

  isSide(side: OptionSide): boolean {
    return this.side === side;
  }

  financialDataCall(
    size: number,
    // premia is in base token
    premia: number,
    basePrice: number,
    quotePrice: number
  ): FinancialData {
    const premiaUsd = premia * basePrice;
    const premiaBase = premia;
    const premiaQuote = premiaUsd / quotePrice;
    const sizeOnePremiaUsd = premiaUsd / size;
    const sizeOnePremiaBase = premiaBase / size;
    const sizeOnePremiaQuote = premiaQuote / size;

    return {
      premiaUsd,
      premiaBase,
      premiaQuote,
      sizeOnePremiaUsd,
      sizeOnePremiaBase,
      sizeOnePremiaQuote,
    };
  }

  financialDataPut(
    size: number,
    // premia is in quote token
    premia: number,
    basePrice: number,
    quotePrice: number
  ): FinancialData {
    const premiaUsd = premia * quotePrice;
    const premiaBase = premiaUsd / basePrice;
    const premiaQuote = premia;
    const sizeOnePremiaUsd = premiaUsd / size;
    const sizeOnePremiaBase = premiaBase / size;
    const sizeOnePremiaQuote = premiaQuote / size;

    return {
      premiaUsd,
      premiaBase,
      premiaQuote,
      sizeOnePremiaUsd,
      sizeOnePremiaBase,
      sizeOnePremiaQuote,
    };
  }

  financialData(
    size: number,
    premia: number,
    basePrice: number,
    quotePrice: number
  ): FinancialData {
    return this.isCall
      ? this.financialDataCall(size, premia, basePrice, quotePrice)
      : this.financialDataPut(size, premia, basePrice, quotePrice);
  }

  ////////////
  // GETTERS
  ////////////

  get otherSideOption(): Option {
    const otherSide =
      this.side === OptionSide.Long ? OptionSide.Short : OptionSide.Long;
    return new Option(
      this.baseToken.tokenAddress,
      this.quoteToken.tokenAddress,
      this.type,
      otherSide,
      this.maturityHex,
      this.strike
    );
  }

  get sideAsText(): string {
    return this.side === OptionSide.Long ? "Long" : "Short";
  }

  get isLong(): boolean {
    return this.side === OptionSide.Long;
  }

  get isShort(): boolean {
    return this.side === OptionSide.Short;
  }

  get display(): string {
    return `${this.sideAsText} ${this.typeAsText} - strike price $${
      this.strike
    } - expires ${timestampToReadableDate(this.maturity * 1000)}`;
  }

  get isFresh(): boolean {
    return this.maturity * 1000 > new Date().getTime();
  }

  get isExpired(): boolean {
    return !this.isFresh;
  }

  get struct(): OptionStruct {
    return {
      option_side: this.side,
      maturity: this.maturityHex,
      strike_price: Cubit(this.strikeHex),
      quote_token_address: this.quoteToken.tokenAddress,
      base_token_address: this.baseToken.tokenAddress,
      option_type: this.type,
    };
  }

  get dateShort(): string {
    return timestampToShortTimeDate(this.maturity * 1000);
  }

  get dateRich(): string {
    return timestampToReadableDate(this.maturity * 1000);
  }
}

export class OptionWithPosition extends Option {
  public sizeHex: string;
  public valueHex: string;
  public size: number;
  public value: number;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    side: BigNumberish,
    maturity: BigNumberish,
    strike: bigint | number,
    size: BigNumberish,
    value: BigNumberish
  ) {
    super(base, quote, type, side, maturity, strike);

    this.sizeHex = toHex(size);
    this.valueHex = toHex(value);
    this.size = shortInteger(this.sizeHex, this.digits);
    this.value = Number(BigInt(this.valueHex) / BASE_MATH_64);
  }

  get fullSize(): string {
    return this.sizeHex;
  }

  get isInTheMoney(): Boolean {
    return !!this.value && this.isExpired;
  }

  get isOutOfTheMoney(): Boolean {
    return !this.value && this.isExpired;
  }
}

export class OptionWithPremia extends Option {
  public premiaHex: string;
  public premia: number;
  public premiaBase: bigint;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    side: BigNumberish,
    maturity: BigNumberish,
    strike: bigint | number,
    premia: BigNumberish
  ) {
    super(base, quote, type, side, maturity, strike);

    this.premiaHex = toHex(premia);
    this.premiaBase = BigInt(this.premiaHex) / BASE_MATH_64;
    this.premia = shortInteger(this.premiaBase, this.digits);
  }
}
