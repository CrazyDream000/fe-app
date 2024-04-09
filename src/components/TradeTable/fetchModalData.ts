import { AccountInterface } from "starknet";
import { UserBalance } from "./../../types/wallet";
import { FinancialData } from "../../types/options";
import { getPremia } from "../../calls/getPremia";
import { LogTypes, debug } from "../../utils/debugger";
import { math64toDecimal } from "../../utils/units";
import { getUserBalance } from "../../calls/balanceOf";
import { OptionWithPremia } from "../../classes/Option";

const validDuration = 30 * 1000; // 30s

const balanceData: { balance: UserBalance | undefined; lastFetched: number } = {
  balance: undefined,
  lastFetched: 0,
};

const recentUserBalance = async (account: AccountInterface | undefined) => {
  const timeNow = new Date().getTime();
  if (timeNow < balanceData.lastFetched + validDuration) {
    return balanceData.balance;
  }
  if (!account) {
    return;
  }
  const balanceNow = await getUserBalance(account);
  const timeAfterFetch = new Date().getTime();
  balanceData.balance = balanceNow;
  balanceData.lastFetched = timeAfterFetch;
  return balanceData.balance;
};

type ModalData = {
  prices: FinancialData;
  premiaMath64: bigint;
  balance?: UserBalance;
};

export const fetchModalData = async (
  size: number,
  option: OptionWithPremia,
  account: AccountInterface | undefined,
  signal: AbortSignal
): Promise<ModalData | undefined> => {
  const [{ base, quote }, premiaMath64, balance] = await Promise.all([
    option.tokenPricesInUsd(),
    getPremia(option, size, false),
    recentUserBalance(account),
  ]).catch((e: Error) => {
    debug("Failed fetching ETH or premia", e.message);
    debug(LogTypes.ERROR, e);
    throw e;
  });

  debug("Fetched ETH, premia and user balance", {
    base,
    quote,
    premiaMath64,
    balance,
  });

  if (signal.aborted) {
    return;
  }

  const convertedPremia = math64toDecimal(premiaMath64);

  return {
    prices: option.financialData(size, convertedPremia, base, quote),
    premiaMath64: premiaMath64,
    balance,
  };
};
