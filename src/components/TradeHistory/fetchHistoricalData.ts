import { RawOptionHistory } from "./../../types/history";
import { QueryFunctionContext } from "react-query";
import { ITradeHistory, RawTradeHistory } from "../../types/history";
import { debug, LogTypes } from "../../utils/debugger";
import { Option } from "../../classes/Option";
import { API_URL } from "../../constants/amm";

const getOptionFromHistory = (option: RawOptionHistory | null) => {
  if (!option) {
    return null;
  }

  return new Option(
    option.base_token_address,
    option.quote_token_address,
    option.option_type,
    option.option_side,
    option.maturity,
    BigInt(option.strike_price)
  );
};

const parseHostoricDataResponse = (data: RawTradeHistory[]): ITradeHistory[] =>
  data.map((v) => {
    const option = getOptionFromHistory(v.option);
    const { timestamp, action, caller, capital_transfered, tokens_minted } = v;
    return {
      liquidity_pool: v.liquidity_pool,
      option: option,
      timestamp,
      action,
      caller,
      capital_transfered,
      tokens_minted,
    };
  });

export const fetchHistoricalData = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined]>): Promise<
  ITradeHistory[]
> => {
  const walletAddress = queryKey[1];

  if (!walletAddress) {
    throw Error(
      `getHistoricalData did not get walletAddress: ${walletAddress}`
    );
  }

  const data = await fetch(`${API_URL}transactions?address=${walletAddress}`)
    .then((res) => res.json())
    .then((v) => {
      if (v?.status === "success") {
        return v.data;
      }
      return [];
    })
    .catch((e) => {
      debug(LogTypes.WARN, "Failed fetching trade history\n", e);
    });

  debug("RAW HISTORIC DATA", data);

  if (data?.length) {
    return parseHostoricDataResponse(data);
  }
  return [];
};
