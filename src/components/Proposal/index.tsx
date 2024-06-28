import { useQuery } from "react-query";
import { NoContent } from "../TableNoContent";
import ProposalTable from "./ProposalTable";
import { QueryKeys } from "../../queries/keys";
import { fetchLiveProposals } from "../../calls/liveProposals";
import { LoadingAnimation } from "../Loading/Loading";

export const Proposals = () => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.liveProposals],
    fetchLiveProposals
  );

  if (isError) {
    return <p>Something went wrong, please try again later.</p>;
  }

  if (isLoading || !data) {
    return <LoadingAnimation />;
  }

  if (data.length === 0) {
    return <NoContent text="No proposals are currently live" />;
  }

  return <ProposalTable activeData={data} />;
};
