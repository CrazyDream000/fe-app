import { AccountInterface } from "starknet";
import { Vote } from "../Vote/Vote";

type Props = {
  proposal: number;
  balance: bigint;
  account?: AccountInterface;
};

export const ProposalItem = ({ proposal, balance, account }: Props) => (
  <div>
    <h3>Proposal {proposal}</h3>
    <div>
      <Vote proposal={proposal} balance={balance} account={account} />
    </div>
  </div>
);
