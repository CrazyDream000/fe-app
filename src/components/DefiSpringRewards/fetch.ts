import { getDefiSpringClaimed } from "../../calls/getDefiSpringClaim";

type ClaimCalldata = {
  amount: string;
  proof: string[];
};

export enum DefiSpringStatus {
  Initial = "INITIAL",
  Fetching = "FETCHING",
  Ready = "READY",
  Error = "ERROR",
}

export type DefiSpringData = {
  amount: string;
  proof: string[];
  allocation: bigint;
  claimed: bigint;
};

const defiSpringUrl =
  "https://defi-spring-distribution-h5cslfrcca-ew.a.run.app";

export const fetchUserAllocation = async (address: string): Promise<bigint> => {
  const res = await fetch(
    `${defiSpringUrl}/get_allocation_amount?address=${address}`
  );

  const body = await res.json();

  return BigInt(body);
};

export const fetchCalldata = async (
  address: string
): Promise<ClaimCalldata> => {
  const res = await fetch(`${defiSpringUrl}/get_calldata?address=${address}`);

  if (res.status === 200) {
    return await res.json();
  }

  const message = await res.text();

  throw Error(message);
};

export const getDefiSpringData = async (
  address: string,
  setStatus: (s: DefiSpringStatus) => void,
  setData: (d: DefiSpringData) => void
) => {
  setStatus(DefiSpringStatus.Fetching);
  const allocationPromise = fetchUserAllocation(address);
  const calldataPromise = fetchCalldata(address);
  const claimedPromise = getDefiSpringClaimed(address);

  Promise.all([allocationPromise, calldataPromise, claimedPromise])
    .then(([allocation, calldata, claimed]) => {
      setData({
        allocation,
        claimed,
        amount: calldata.amount,
        proof: calldata.proof,
      });
      setStatus(DefiSpringStatus.Ready);
    })
    .catch((err: Error) => {
      const { message } = err;
      if (message.includes("Address not found in tree")) {
        // no allocation - return 0s
        setData({
          allocation: 0n,
          claimed: 0n,
          amount: "0",
          proof: [],
        });
        setStatus(DefiSpringStatus.Ready);
        return;
      }
      console.error(message);
      // unknow error - display error
      setStatus(DefiSpringStatus.Error);
    });
};
