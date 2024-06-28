import { GovernanceContract } from "../utils/blockchain";

export const fetchLiveProposals = async (): Promise<number[]> => {
  const res = (await GovernanceContract.call("get_live_proposals")) as bigint[];
  const proposals = res.map((bi: bigint) => Number(bi));

  return proposals;
};
