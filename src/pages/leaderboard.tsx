import { useEffect } from "react";

import { Layout } from "../components/Layout";
import { Leaderboard } from "../components/Points/Leaderboard";

const LeaderboardPage = () => {
  useEffect(() => {
    document.title = "Points | Carmine Finance";
  });

  return (
    <Layout>
      <h3>Carmine Points Program</h3>
      <p>Elevate Your Status, Enhance Your Rewards</p>
      <h3>Leaderboard</h3>
      <Leaderboard />
    </Layout>
  );
};

export default LeaderboardPage;
