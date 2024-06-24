import { Helmet } from "react-helmet";

import { Layout } from "../components/Layout";
import { Proposals } from "../components/Proposal";
import { Vest } from "../components/Vesting";
import { useGovernanceSubpage } from "../hooks/useGovernanceSubpage";
import { GovernanceSubpage } from "../redux/reducers/ui";
import { useNavigate } from "react-router-dom";
import buttonStyles from "../style/button.module.css";
import { setGovernanceSubpage } from "../redux/actions";
import { Airdrop } from "../components/Airdrop/Airdrop";

const VotingSubpage = () => {
  return (
    <div>
      <h3>Proposals</h3>
      <p>Vote on AMM defining proposals</p>
      <Proposals />
    </div>
  );
};

const StakingSubpage = () => {
  return (
    <div>
      <h3>CARM Staking</h3>
      <p>
        Stake your <b>CARM</b>
      </p>
      <Vest />
    </div>
  );
};

const Governance = () => {
  const subpage = useGovernanceSubpage();
  const navigate = useNavigate();

  const handleNavigateClick = (subpage: GovernanceSubpage) => {
    setGovernanceSubpage(subpage);
    navigate(`/governance/${subpage}`);
  };

  return (
    <Layout>
      <Helmet>
        <title>Governance | Carmine Options AMM</title>
        <meta
          name="description"
          content="Vote on proposals and take part in governing Carmine Options AMM"
        />
      </Helmet>
      <button
        className={`${
          subpage === GovernanceSubpage.AirDrop && buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          handleNavigateClick(GovernanceSubpage.AirDrop);
        }}
      >
        Airdrop
      </button>
      <button
        className={`${
          subpage === GovernanceSubpage.Voting && buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          handleNavigateClick(GovernanceSubpage.Voting);
        }}
      >
        Voting
      </button>
      <button
        className={`${
          subpage === GovernanceSubpage.Staking && buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          handleNavigateClick(GovernanceSubpage.Staking);
        }}
      >
        Staking
      </button>

      {subpage === GovernanceSubpage.Voting && <VotingSubpage />}
      {subpage === GovernanceSubpage.Staking && <StakingSubpage />}
      {subpage === GovernanceSubpage.AirDrop && <Airdrop />}
    </Layout>
  );
};

export default Governance;
