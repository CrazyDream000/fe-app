import { Helmet } from "react-helmet";

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Airdrop } from "../components/Airdrop/Airdrop";
import { Layout } from "../components/layout";
import { Positions } from "../components/PositionTable";
import { TradeHistory } from "../components/History/History";
import { usePortfolioParam } from "../hooks/usePortfolio";
import { setPortfolioParam } from "../redux/actions";
import { PortfolioParamType } from "../redux/reducers/ui";
import buttonStyles from "../style/button.module.css";
import { Referral } from "../components/Referral";
import { isMainnet } from "../constants/amm";

const Portfolio = () => {
  const portfolioParam = usePortfolioParam();
  const navigate = useNavigate();
  const { target } = useParams();

  useEffect(() => {
    // Check if the URL contains the #history hash
    switch (target) {
      case "history":
        setPortfolioParam(PortfolioParamType.History);
        break;
      case "airdrop":
        setPortfolioParam(PortfolioParamType.AirDrop);
        break;
      case "position":
        setPortfolioParam(PortfolioParamType.Position);
        break;
      case "referral":
        setPortfolioParam(PortfolioParamType.Referral);
        break;
      default:
        switch (portfolioParam) {
          case PortfolioParamType.History:
            setPortfolioParam(PortfolioParamType.History);
            break;
          case PortfolioParamType.AirDrop:
            setPortfolioParam(PortfolioParamType.AirDrop);
            break;
          case PortfolioParamType.Position:
            setPortfolioParam(PortfolioParamType.Position);
            break;
          case PortfolioParamType.Referral:
            setPortfolioParam(PortfolioParamType.Referral);
            break;
          default:
            setPortfolioParam(PortfolioParamType.Position);
            break;
        }
        break;
    }
  }, [target, portfolioParam]);

  return (
    <Layout>
      <Helmet>
        <title>Portfolio | Carmine Options AMM</title>
        <meta
          name="description"
          content="Your current positions and history of your activity"
        />
      </Helmet>
      <button
        className={`${
          portfolioParam === PortfolioParamType.AirDrop &&
          buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          navigate(`/portfolio/airdrop`);
        }}
      >
        Airdrop
      </button>
      <button
        className={`${
          portfolioParam === PortfolioParamType.Position &&
          buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          navigate(`/portfolio/position`);
        }}
      >
        Position
      </button>
      <button
        className={`${
          portfolioParam === PortfolioParamType.History &&
          buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          navigate(`/portfolio/history`);
        }}
      >
        History
      </button>
      {isMainnet && (
        <button
          className={`${
            portfolioParam === PortfolioParamType.Referral &&
            buttonStyles.secondary
          }`}
          onClick={() => {
            navigate(`/portfolio/referral`);
          }}
        >
          Referral
        </button>
      )}
      {portfolioParam === PortfolioParamType.AirDrop && (
        <div>
          <Airdrop />
        </div>
      )}
      {portfolioParam === PortfolioParamType.Position && (
        <div>
          <Positions />
        </div>
      )}
      {portfolioParam === PortfolioParamType.History && (
        <div>
          <TradeHistory />
        </div>
      )}
      {isMainnet && portfolioParam === PortfolioParamType.Referral && (
        <div>
          <Referral />
        </div>
      )}
    </Layout>
  );
};

export default Portfolio;
