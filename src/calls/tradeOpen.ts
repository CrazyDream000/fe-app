import { UserBalance } from "./../types/wallet";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "./../redux/actions";
import { AccountInterface } from "starknet";
import { Option } from "../classes/Option";
import { debug } from "../utils/debugger";
import { getToApprove, shortInteger } from "../utils/computations";
import AmmAbi from "../abi/amm_abi.json";
import LpAbi from "../abi/lptoken_abi.json";
import { afterTransaction } from "../utils/blockchain";
import { invalidatePositions } from "../queries/client";
import { TransactionAction } from "../redux/reducers/transactions";
import { ToastType } from "../redux/reducers/ui";
import { math64ToInt } from "../utils/units";
import { apiUrl } from "../api";
import { isMainnet } from "../constants/amm";

export const approveAndTradeOpen = async (
  account: AccountInterface,
  option: Option,
  size: number,
  premiaNum: number,
  premiaMath64: bigint,
  balance: UserBalance,
  updateTradeState: ({
    failed,
    processing,
  }: {
    failed: boolean;
    processing: boolean;
  }) => void,
  isInsurance = false
): Promise<boolean> => {
  const premiaTokenCount = math64ToInt(premiaMath64, option.digits);
  const toApprove = getToApprove(option, size, BigInt(premiaTokenCount));
  const toApproveNumber = shortInteger(toApprove, option.digits);

  debug({ premiaMath64, toApprove, toApproveNumber });

  const tokenId = option.underlying.id;

  if (balance[tokenId] < toApproveNumber) {
    const [has, needs] = [
      shortInteger(balance[tokenId].toString(10), option.digits),
      toApproveNumber,
    ];
    debug({
      size,
      premiaMath64,
      premiaTokenCount,
      toApproveNumber,
      has,
      needs,
    });
    showToast(
      `To open this position you need ${option.symbol}\u00A0${Number(
        needs
      ).toFixed(4)}, but you only have ${option.symbol}\u00A0${has.toFixed(4)}`,
      ToastType.Warn
    );
    throw Error("Not enough funds");
  }

  const approve = option.underlying.approveCalldata(toApprove);
  const tradeOpen = option.tradeOpenCalldata(size, premiaMath64);

  option.sendBeginCheckoutEvent(size, premiaNum, isInsurance);

  const res = await account
    .execute([approve, tradeOpen], [LpAbi, AmmAbi])
    .catch((e) => {
      debug("Trade open rejected or failed", e.message);
      throw Error("Trade open rejected or failed");
    });

  option.sendPurchaseEvent(size, premiaNum, isInsurance);

  if (isInsurance && isMainnet) {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: account.address,
        calldata: tradeOpen.calldata,
      }),
    };

    fetch(apiUrl("insurance-event"), options)
      .then((response) => {
        debug("Insurance event sent", response);
      })
      .catch((err) => {
        debug("Insurance event failed", err);
        console.error(err);
      });
  }

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;
    addTx(hash, option.optionId, TransactionAction.TradeOpen);
    afterTransaction(
      hash,
      () => {
        markTxAsDone(hash);
        invalidatePositions();
        updateTradeState({
          failed: false,
          processing: false,
        });
        showToast("Successfully opened position", ToastType.Success);
      },
      () => {
        markTxAsFailed(hash);
        updateTradeState({
          failed: true,
          processing: false,
        });
        showToast("Failed to open position", ToastType.Error);
      }
    );
  } else {
    throw Error("Trade open failed unexpectedly");
  }

  return true;
};
