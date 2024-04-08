import { Helmet } from "react-helmet";

import { AlternativeTradingView } from "../components/CryptoGraph/AlternativeTradingView";
import { Layout } from "../components/Layout";
import TradeTable from "../components/TradeTable";

const TradePage = () => (
  <Layout>
    <Helmet>
      <title>Trade | Carmine Options AMM</title>
      <meta
        name="description"
        content="Buy and sell crypto options with Carmine Options AMM"
      />
    </Helmet>
    <div style={{ width: "100%", height: "500px" }}>
      <AlternativeTradingView />
    </div>
    <TradeTable />
  </Layout>
);

export default TradePage;
