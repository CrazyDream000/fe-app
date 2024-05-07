import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { UserPoints, fetchTopUserPoints, fetchUserPointsQuery } from "./fetch";
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

export const ClickableUser = ({ address }: { address: string }) => (
  <a
    target="_blank"
    rel="noopener nofollow noreferrer"
    href={`https://starkscan.co/contract/${address}`}
  >
    {addressElision(address)}
  </a>
);

const formatBigNumber = (n: number): string =>
  new Intl.NumberFormat("fr-FR").format(n); // French local uses space as separator

const Item = ({ data, sx }: { data: UserPoints; sx?: any }) => {
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
        <ClickableUser address={address} />
      </TableCell>
      <TableCell>{formatBigNumber(liqPoints)}</TableCell>
      <TableCell>{formatBigNumber(tradePoints)}</TableCell>
      <TableCell>{formatBigNumber(refPoints)}</TableCell>
      <TableCell>{formatBigNumber(votePoints)}</TableCell>
      <TableCell>{formatBigNumber(totalPoints)}</TableCell>
    </TableRow>
  );
};

const UserItemWithAccount = ({ address }: { address: string }) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.userPoints, address],
    fetchUserPointsQuery
  );

  if (isLoading || isError || !data) {
    return null;
  }

  return <Item data={data} sx={{ background: "#323232" }} />;
};

const UserItem = () => {
  const account = useAccount();

  if (!account) {
    return null;
  }

  return <UserItemWithAccount address={account.address} />;
};

const Bold = ({ children }: { children: ReactNode }) => (
  <span style={{ fontWeight: "700" }}>{children}</span>
);

export const Leaderboard = () => {
  const { isLoading, isError, data } = useQuery(
    QueryKeys.topUserPoints,
    fetchTopUserPoints
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
          <UserItem />
          {data!.map((userPoints, i) => (
            <Item data={userPoints} key={i} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
