import { ProposalItem } from "./ProposalItem";
import { useAccount } from "../../hooks/useAccount";
import { useState, useEffect } from "react";
import { balanceOfCarmineToken } from "../../calls/balanceOf";
import styles from "./Proposal.module.css";

type Props = {
  activeData: number[];
};

const ProposalTable = ({ activeData }: Props) => {
  const account = useAccount();
  const [balance, setBalance] = useState(0n);

  useEffect(() => {
    // when account changes assume balance 0 until new is fetched
    setBalance(0n);
    if (account) {
      balanceOfCarmineToken(account).then((res) => setBalance(res));
    }
  }, [account]);

  return (
    <div className={styles.listcontainer}>
      {activeData.map((item, i) => (
        <ProposalItem
          proposal={item}
          account={account}
          balance={balance}
          key={i}
        />
      ))}
    </div>
  );
};

export default ProposalTable;
