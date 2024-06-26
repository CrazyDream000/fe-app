import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import {
  BraavosBonus,
  UserPoints,
  fetchBraavosBonus,
  fetchTopUserPoints,
  fetchUserPointsQuery,
} from "./fetch";
import { LoadingAnimation } from "../Loading/Loading";
import tableStyles from "../../style/table.module.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { addressElision } from "../../utils/utils";
import { useAccount } from "../../hooks/useAccount";
import { ReactNode } from "react";
import { BraavosBadge } from "./BraavosBadge";
import styles from "./points.module.css";

export const ClickableUser = ({ address }: { address: string }) => (
  <a
    target="_blank"
    rel="noopener nofollow noreferrer"
    href={`https://starkscan.co/contract/${address}`}
    style={{ width: "115px" }}
  >
    {addressElision(address)}
  </a>
);

const formatBigNumber = (n: number): string =>
  new Intl.NumberFormat("fr-FR").format(n); // French local uses space as separator

const Item = ({
  data,
  braavosBonus,
  sx,
}: {
  data: UserPoints;
  braavosBonus?: BraavosBonus;
  sx?: any;
}) => {
  const {
    address,
    trading_points: tradePoints,
    liquidity_points: liqPoints,
    referral_points: refPoints,
    vote_points: votePoints,
    total_points: totalPoints,
    position,
  } = data;

  const displayPosition =
    position > 3
      ? position + ""
      : position === 1
      ? "🥇"
      : position === 2
      ? "🥈"
      : "🥉";

  return (
    <TableRow sx={sx}>
      <TableCell>{displayPosition}</TableCell>
      <TableCell>
        <div className={styles.leaderuser}>
          <ClickableUser address={address} />
          {braavosBonus && <BraavosBadge data={braavosBonus} />}
        </div>
      </TableCell>
      <TableCell>{formatBigNumber(liqPoints)}</TableCell>
      <TableCell>{formatBigNumber(tradePoints)}</TableCell>
      <TableCell>{formatBigNumber(refPoints)}</TableCell>
      <TableCell>{formatBigNumber(votePoints)}</TableCell>
      <TableCell>{formatBigNumber(totalPoints)}</TableCell>
    </TableRow>
  );
};

const UserItemWithAccount = ({
  address,
  braavosBonus,
}: {
  address: string;
  braavosBonus?: BraavosBonus;
}) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.userPoints, address],
    fetchUserPointsQuery
  );

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <Item
      data={data}
      braavosBonus={braavosBonus}
      sx={{ background: "#323232" }}
    />
  );
};

const UserItem = ({
  braavos,
}: {
  braavos?: { [key: string]: BraavosBonus };
}) => {
  const account = useAccount();

  if (!account) {
    return null;
  }

  const braavosBonus = braavos && braavos[account.address];

  return (
    <UserItemWithAccount
      braavosBonus={braavosBonus}
      address={account.address}
    />
  );
};

const Bold = ({ children }: { children: ReactNode }) => (
  <span style={{ fontWeight: "700" }}>{children}</span>
);

export const Leaderboard = () => {
  const { isLoading, isError, data } = useQuery(
    QueryKeys.topUserPoints,
    fetchTopUserPoints
  );
  const { data: braavosData } = useQuery(
    QueryKeys.braavosBonus,
    fetchBraavosBonus
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <p>Error</p>;
  }

  return (
    <TableContainer>
      <Table className={tableStyles.table} aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Bold>#</Bold>
            </TableCell>
            <TableCell>
              <Bold>User</Bold>
            </TableCell>
            <TableCell>
              <Bold>Liquidity</Bold>
            </TableCell>
            <TableCell>
              <Bold>Trading</Bold>
            </TableCell>
            <TableCell>
              <Bold>Referral</Bold>
            </TableCell>
            <TableCell>
              <Bold>Vote</Bold>
            </TableCell>
            <TableCell>
              <Bold>Total</Bold>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <UserItem braavos={braavosData} />
          {data!.map((userPoints, i) => (
            <Item
              data={userPoints}
              braavosBonus={braavosData && braavosData[userPoints.address]}
              key={i}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
