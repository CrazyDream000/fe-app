import {
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { CSSProperties, useEffect, useState } from "react";
import { AccountInterface } from "starknet";
import { handleStake } from "./handleStake";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { Pool } from "../../classes/Pool";
import { intToDecimal } from "../../utils/units";
import { BASE_DIGITS } from "../../constants/amm";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import { getPoolState } from "../../calls/getPoolState";
import buttonStyles from "../../style/button.module.css";
import inputStyle from "../../style/input.module.css";
import { TokenKey } from "../../classes/Token";

type Props = {
  account: AccountInterface | undefined;
  pool: Pool;
};

const getApy = async (setApy: (n: number) => void, pool: Pool) => {
  // TODO: not yet implemented for BTC
  if (pool.baseToken.id === TokenKey.BTC) {
    setApy(0);
    return;
  }
  const poolId = pool.isCall ? "eth-usdc-call" : "eth-usdc-put";
  fetch(`https://api.carmine.finance/api/v1/mainnet/${poolId}/apy`)
    .then((response) => response.json())
    .then((result) => {
      if (result && result.status === "success") {
        setApy(result.data);
      }
    });
};

const getYieldSinceLaunch = async (
  setYieldSinceLaunch: (n: number) => void,
  pool: Pool
) => {
  // TODO: not yet implemented for BTC
  if (pool.baseToken.id === TokenKey.BTC) {
    setYieldSinceLaunch(0);
    return;
  }
  const state = await getPoolState(
    pool.isCall ? "eth-usdc-call" : "eth-usdc-put"
  );
  const { lp_token_value, timestamp } = state;
  const lpValue = intToDecimal(lp_token_value.toString(10), BASE_DIGITS);
  const MAINNET_LAUNCH_TIMESTAMP = 1680864820;
  const YEAR_SECONDS = 31536000;
  const secondsSinceLaunch = timestamp - MAINNET_LAUNCH_TIMESTAMP;
  const yearFraction = YEAR_SECONDS / secondsSinceLaunch;
  const apySinceLaunch = Math.pow(lpValue, yearFraction);

  setYieldSinceLaunch((apySinceLaunch - 1) * 100);
};

export const StakeCapitalItem = ({ account, pool }: Props) => {
  const txPending = useTxPending(pool.poolId, TransactionAction.Stake);
  const [amount, setAmount] = useState<number>(0);
  const [text, setText] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [apy, setApy] = useState<number | undefined>();
  const [yieldSinceLaunch, setYieldSinceLaunch] = useState<
    number | undefined
  >();

  const theme = useTheme();

  useEffect(() => {
    getApy(setApy, pool);
    getYieldSinceLaunch(setYieldSinceLaunch, pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = handleNumericChangeFactory(setText, setAmount);

  const displayApy =
    apy === undefined ? "--" : `${apy < 0 ? "" : "+"}${apy.toFixed(2)}%`;
  const apySx: CSSProperties = { fontWeight: "bold", textAlign: "center" };
  if (apy && apy < 0) {
    apySx.color = theme.palette.error.main;
  } else if (apy && apy > 0) {
    apySx.color = theme.palette.success.main;
  }

  const displayYieldSinceLaunch =
    yieldSinceLaunch === undefined
      ? "--"
      : `${yieldSinceLaunch < 0 ? "" : "+"}${yieldSinceLaunch.toFixed(2)}%`;
  const yslSx: CSSProperties = { fontWeight: "bold", textAlign: "center" };
  if (yieldSinceLaunch && yieldSinceLaunch < 0) {
    yslSx.color = theme.palette.error.main;
  } else if (yieldSinceLaunch && yieldSinceLaunch > 0) {
    yslSx.color = theme.palette.success.main;
  }

  const handleStakeClick = () =>
    handleStake(account!, amount, pool, setLoading);

  return (
    <TableRow>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography>{pool.name}</Typography>
      </TableCell>
      <TableCell>
        {pool.baseToken.id === TokenKey.BTC ? (
          <Tooltip title="Not yet implemented for BTC">
            <Typography sx={yslSx}>--</Typography>
          </Tooltip>
        ) : (
          <Typography sx={yslSx}>{displayYieldSinceLaunch}</Typography>
        )}
      </TableCell>
      <TableCell>
        {pool.baseToken.id === TokenKey.BTC ? (
          <Tooltip title="Not yet implemented for BTC">
            <Typography sx={yslSx}>--</Typography>
          </Tooltip>
        ) : (
          <Typography sx={apySx}>{displayApy}</Typography>
        )}
      </TableCell>
      <TableCell sx={{ minWidth: "100px" }} align="center">
        <input
          className={inputStyle.input}
          type="text"
          value={text}
          onChange={handleChange}
        />
      </TableCell>
      <TableCell sx={{ display: "flex", alignItems: "center" }} align="right">
        <button
          className={`${buttonStyles.button} ${buttonStyles.secondary}`}
          disabled={loading || !account || txPending}
          onClick={handleStakeClick}
        >
          {loading || txPending
            ? "Processing..."
            : account
            ? "Stake"
            : "Connect wallet"}
        </button>
      </TableCell>
    </TableRow>
  );
};
