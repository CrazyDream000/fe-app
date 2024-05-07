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
import { addressElision } from "../../utils/utils";

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

  if (
    status === DefiSpringStatus.Initial ||
    status === DefiSpringStatus.Fetching
  ) {
    return (
      <div className={styles.outer}>
        <p>
          <Skeleton
            animation="wave"
            variant="text"
            sx={{ fontSize: "1.29rem", width: "140px" }}
          />
        </p>
        <div className={styles.box}>
          <div className={styles.deficontainer}>
            <div>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "160px" }}
                />
              </p>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "50px" }}
                />
              </p>
            </div>
            <div>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "160px" }}
                />
              </p>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "50px" }}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === DefiSpringStatus.Error || data === undefined) {
    return <p>Something went wrong, please try again later</p>;
  }

  const call = [data.amount, data.proof.length, ...data.proof];

  const claim = async () => await defiSpringClaim(account, call);

  const { allocation, claimed } = data;

  const claimedHumanReadable = shortInteger(claimed, 18);
  const claimableHumanReadable = shortInteger(allocation - claimed, 18);

  const isAllClaimed = allocation === claimed;

  return (
    <div className={styles.outer}>
      <p>Ready to claim for {addressElision(account.address)}</p>
      <div className={styles.box}>
        <div className={styles.deficontainer}>
          <div>
            <p>Available to claim</p>
            <p>{claimableHumanReadable.toFixed(4)}</p>
          </div>
          <div>
            <p>Claimed</p>
            <p>{claimedHumanReadable.toFixed(4)}</p>
          </div>
        </div>
        {!isAllClaimed && (
          <div className={styles.buttoncontainer}>
            <button className={buttonStyles.secondary} onClick={claim}>
              Claim {shortInteger(allocation - claimed, 18).toFixed(4)} STRK
            </button>
          </div>
        )}
      </div>
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
