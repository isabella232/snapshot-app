import React, { useState, useMemo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MarkdownBody from "../components/proposal/MarkdownBody";
import { ScrollView, View, Text } from "react-native";
import { Proposal } from "../types/proposal";
import common from "../styles/common";
import { useExploreState } from "../context/exploreContext";
import { Space } from "../types/explore";
import { PROPOSAL_VOTES_QUERY } from "../util/queries";
import apolloClient from "../util/apolloClient";
import StateBadge from "../components/StateBadge";
import BlockInformation from "../components/proposal/BlockInformation";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import BlockVotes from "../components/proposal/BlockVotes";
import { getResults } from "../util/snapshot";
import BackButton from "../components/BackButton";
import BlockResults from "../components/proposal/BlockResults";
import BlockCastVote from "../components/proposal/BlockCastVote";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import ProposalMenu from "../components/proposal/ProposalMenu";

type ProposalScreenProps = {
  route: {
    params: {
      proposal: Proposal;
      fromFeed: boolean;
      spaceId?: string;
      proposalId?: string;
    };
  };
};

function getSpace(
  spaces: { [spaceId: string]: Space },
  proposal: Proposal,
  routeSpaceId?: string
): Space | {} {
  if (proposal?.space || routeSpaceId) {
    const spaceId = proposal?.space?.id ?? routeSpaceId;
    const space = spaces[spaceId] ?? {};
    return {
      id: spaceId,
      ...space,
    };
  }

  return {};
}

async function getProposal(
  proposal: Proposal,
  setProposal: (proposal: Proposal) => void,
  setLoaded: (loaded: boolean) => void,
  setVotes: (votes: any) => void,
  setProposalFullyLoading: (loading: boolean) => void,
  proposalId?: string
) {
  const result = await apolloClient.query({
    query: PROPOSAL_VOTES_QUERY,
    variables: {
      id: proposal.id ?? proposalId,
    },
  });
  const votes = get(result, "data.votes", []);
  const updatedProposal = {
    ...proposal,
    ...get(result, "data.proposal", {}),
    votes: votes,
  };
  setProposal(updatedProposal);
  setVotes(votes);
  setLoaded(true);
  setProposalFullyLoading(false);
  return { proposal: updatedProposal, votes };
}

async function getResultsObj(
  space: Space,
  proposal: Proposal,
  votes: any[],
  setVotes: (votes: any[]) => void,
  setResults: (results: any) => void,
  setResultsLoaded: (resultsLoaded: boolean) => void
) {
  const response = await getResults(space, proposal, votes);
  if (response.votes) {
    setVotes(response.votes);
    setResults(response.results);
  }
  setResultsLoaded(true);
}

function ProposalScreen({ route }: ProposalScreenProps) {
  const [proposal, setProposal] = useState<Proposal>(
    route.params.proposal ?? {}
  );
  const [loaded, setLoaded] = useState(false);
  const [proposalFullyLoading, setProposalFullyLoading] = useState(
    isEmpty(proposal)
  );
  const [votes, setVotes] = useState<any[]>([]);
  const [results, setResults] = useState({});
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const { spaces } = useExploreState();
  const space: any = useMemo(
    () => getSpace(spaces, proposal, route.params.spaceId),
    [spaces, proposal]
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getProposal(
      proposal,
      setProposal,
      setLoaded,
      setVotes,
      setProposalFullyLoading,
      route.params.proposalId
    );
  }, []);

  useEffect(() => {
    if (loaded) {
      getResultsObj(
        space,
        proposal,
        votes,
        setVotes,
        setResults,
        setResultsLoaded
      );
    }
  }, [loaded]);

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <View style={[common.headerContainer, common.justifySpaceBetween]}>
        <BackButton title={route.params.fromFeed ? null : space?.name} />
        {!proposalFullyLoading && (
          <ProposalMenu proposal={proposal} space={space} />
        )}
      </View>
      {proposalFullyLoading ? (
        <View
          style={[
            common.containerHorizontalPadding,
            common.containerVerticalPadding,
          ]}
        >
          <Placeholder
            style={{ justifyContent: "center", alignItems: "center" }}
            Animation={Fade}
          >
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
          </Placeholder>
        </View>
      ) : (
        <ScrollView scrollEnabled={scrollEnabled}>
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={[common.h1, { marginBottom: 8, marginTop: 16 }]}>
              {proposal.title}
            </Text>
            <View style={{ alignSelf: "flex-start", marginBottom: 24 }}>
              <StateBadge state={proposal.state} />
            </View>
            <MarkdownBody body={proposal.body} />
          </View>
          <View style={{ width: 10, height: 30 }} />
          {proposal?.state === "active" && (
            <>
              <BlockCastVote
                proposal={proposal}
                resultsLoaded={resultsLoaded}
                setScrollEnabled={setScrollEnabled}
                space={space}
                getProposal={async () => {
                  const proposalResponse = await getProposal(
                    proposal,
                    setProposal,
                    setLoaded,
                    setVotes,
                    setProposalFullyLoading
                  );

                  getResultsObj(
                    space,
                    proposalResponse?.proposal,
                    proposalResponse?.votes,
                    setVotes,
                    setResults,
                    setResultsLoaded
                  );
                }}
              />
              <View style={{ width: 10, height: 10 }} />
            </>
          )}

          <BlockVotes
            proposal={proposal}
            votes={votes}
            space={space}
            resultsLoaded={resultsLoaded}
          />
          <View style={{ width: 10, height: 10 }} />
          <BlockResults
            resultsLoaded={resultsLoaded}
            results={results}
            proposal={proposal}
            space={space}
          />
          <View style={{ width: 10, height: 10 }} />
          <BlockInformation proposal={proposal} space={space} />
          <View style={{ width: 10, height: 75 }} />
        </ScrollView>
      )}
    </View>
  );
}

export default ProposalScreen;
