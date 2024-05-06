import { useEffect, useState } from "react";
import { useAccount } from "../../hooks/useAccount";
import { defiSpringClaim } from "../../calls/getDefiSpringClaim";
import { AccountInterface } from "starknet";
import { DefiSpringData, DefiSpringStatus, getDefiSpringData } from "./fetch";
import { shortInteger } from "../../utils/computations";
import { openWalletConnectDialog } from "../ConnectWallet/Button";

import buttonStyles from "../../style/button.module.css";
import styles from "./defi.module.css";
import { Skeleton } from "@mui/material";

export const RewardsWithAccount = ({
  account,
}: {
  account: AccountInterface;
}) => {
  const address = account.address;

  const [status, setStatus] = useState<DefiSpringStatus>(
    DefiSpringStatus.Initial
  );
  const [data, setData] = useState<DefiSpringData | undefined>();

  useEffect(() => {
    getDefiSpringData(address, setStatus, setData);
  }, [address]);

  console.log({ status, data });

  if (
    status === DefiSpringStatus.Initial ||
    status === DefiSpringStatus.Fetching
  ) {
    return (
      <div className={styles.deficontainer}>
        <Skeleton
          animation="wave"
          variant="text"
          sx={{ fontSize: "1.29rem", width: "340px" }}
        />
        <Skeleton
          animation="wave"
          variant="text"
          sx={{ fontSize: "1.29rem" }}
        />
        <Skeleton
          variant="rectangular"
          width={205}
          height={50}
          sx={{ margin: "auto" }}
        />
      </div>
    );
  }

  if (status === DefiSpringStatus.Error || data === undefined) {
    return <p>Something went wrong, please try again later</p>;
  }

  const call = [data.amount, data.proof.length, ...data.proof];

  const claim = async () => await defiSpringClaim(account, call);

  const { allocation, claimed } = data;

  const claimedHumenReadable = shortInteger(claimed, 18);
  const allocationHumenReadable = shortInteger(allocation, 18);

  const isAllClaimed = allocation === claimed;

  return (
    <div className={styles.deficontainer}>
      <p>Total allocated amount: STRK {allocationHumenReadable.toFixed(4)}</p>
      <p>Already claimed: STRK {claimedHumenReadable.toFixed(4)}</p>
      {isAllClaimed ? (
        allocation === 0n ? (
          <p>Nothing to claim</p>
        ) : (
          <p>All claimed</p>
        )
      ) : (
        <button className={buttonStyles.secondary} onClick={claim}>
          Claim STRK {shortInteger(allocation - claimed, 18).toFixed(4)}
        </button>
      )}
    </div>
  );
};

export const Rewards = () => {
  const account = useAccount();

  if (!account) {
    return (
      <div>
        <p>Connect wallet to access Starknet Rewards</p>
        <button
          className={buttonStyles.secondary}
          onClick={openWalletConnectDialog}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return <RewardsWithAccount account={account} />;
};
