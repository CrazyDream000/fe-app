import { AccountInterface } from "starknet";
import { useAccount } from "../../hooks/useAccount";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { unVestCarm, vestCarm } from "./calls";
import { useEffect, useState } from "react";
import { balanceOfCarmineToken } from "../../calls/balanceOf";
import { Skeleton } from "@mui/material";
import { shortInteger } from "../../utils/computations";
import styles from "./vest.module.css";
import inputStyles from "../../style/input.module.css";

export const VestWithAccount = ({ account }: { account: AccountInterface }) => {
  const [carmBalance, setCarmBalance] = useState<number | undefined>(undefined);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    balanceOfCarmineToken(account).then((b) =>
      setCarmBalance(shortInteger(b, 18))
    );
  }, [account]);

  if (carmBalance === undefined) {
    return (
      <Skeleton className={styles.container}>
        <Skeleton />
        <Skeleton />
      </Skeleton>
    );
  }

  const handleInputChange = (value: string) => {
    // Allow empty string, valid number, or a single decimal point followed by numbers
    const numericValue =
      value === "" || /^\d*\.?\d{0,6}$/.test(value) ? value : inputValue;

    const num = parseFloat(numericValue);

    if (num && num > carmBalance) {
      // cannot set more than holds
      return;
    }

    setInputValue(numericValue);
  };

  return (
    <div>
      <p>
        You have 0 <b>CARM</b> and {carmBalance.toFixed(5)} <b>veCarm</b>
      </p>
      <p>Stake your CARM for a period</p>
      <div className={styles.container}>
        <input
          className={inputStyles.input}
          placeholder="0"
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <button onClick={vestCarm}>1 month</button>
        <button onClick={vestCarm}>6 months</button>
        <button onClick={vestCarm}>1 year</button>
      </div>
    </div>
  );
};

export const Vest = () => {
  const account = useAccount();

  if (!account) {
    return <button onClick={openWalletConnectDialog}>Connect wallet</button>;
  }

  return <VestWithAccount account={account} />;
};
