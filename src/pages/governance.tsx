import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet";

import { Layout } from "../components/Layout";
import { Proposals } from "../components/Proposal";
import { isMainnet } from "../constants/amm";
import { Vest } from "../components/Vesting";

type Props = {
  message: string;
  data?: string[];
};

const Governance = () => {
  const SwitchNetwork = ({ message, data }: Props) => (
    <Box
      sx={{
        marginTop: 4,
        padding: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ mb: 4 }}>{message}</Typography>
        {/* <NetworkButton /> */}
        {/* {account && <ClaimButton account={account} data={data} />} */}
      </Box>
    </Box>
  );

  return (
    <Layout>
      <Helmet>
        <title>Governance | Carmine Options AMM</title>
        <meta
          name="description"
          content="Vote on proposals and take part in governing Carmine Options AMM"
        />
      </Helmet>
      {isMainnet ? (
        <div>
          <h3>CARM Staking</h3>
          <p>
            Stake your <b>CARM</b>
          </p>
          <Vest />
          <h3>Proposals</h3>
          <p>Vote on AMM defining proposals</p>
          <Proposals />
        </div>
      ) : (
        <SwitchNetwork message="To see live proposals please switch to mainnet" />
      )}
    </Layout>
  );
};

export default Governance;
