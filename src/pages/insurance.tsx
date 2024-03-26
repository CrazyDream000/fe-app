import { Helmet } from "react-helmet";
import { Layout } from "../components/layout";
import { BuyInsuranceBox } from "../components/Insurance/BuyInsuranceBox";
import { ActiveInsurance } from "../components/Insurance/ActiveInsurance";
import { ClaimInsurance } from "../components/Insurance/ClaimInsurance";
import styles from "./insurance.module.css";

const Insurance = () => {
  return (
    <Layout>
      <Helmet>
        <title>Insurance | Carmine Options AMM</title>
        <meta
          name="description"
          content="Insure the value of your crypto assets"
        />
      </Helmet>
      <h3>Insurance</h3>
      <BuyInsuranceBox />
      <div className={styles.container}>
        <div>
          <h3>Active Insurance</h3>
          <ActiveInsurance />
        </div>
        <div>
          <h3>Claimable Insurance</h3>
          <ClaimInsurance />
        </div>
      </div>
    </Layout>
  );
};

export default Insurance;
