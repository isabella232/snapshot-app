import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Proposal } from "../../types/proposal";
import { PROPOSALS_QUERY, SPACES_QUERY } from "../../util/queries";
import apolloClient from "../../util/apolloClient";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import { ContextDispatch } from "../../types/context";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "../../context/exploreContext";
import { Space } from "../../types/explore";
import React, { useEffect, useState } from "react";
import { setProfiles } from "../../util/profile";
import common from "../../styles/common";
import ProposalPreview from "../ProposalPreview";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../../context/authContext";

const LOAD_BY = 6;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

async function getProposals(
  space: string,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void,
  state: string
) {
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: [space],
      state,
    },
  };
  const result = await apolloClient.query(query);
  const proposalResult = get(result, "data.proposals", []);
  if (isInitial) {
    setProposals(proposalResult);
  } else {
    const newProposals = uniqBy([...proposals, ...proposalResult], "id");
    setProposals(newProposals);
    setLoadCount(loadCount + LOAD_BY);
  }
  setLoadingMore(false);
}

async function getSpace(spaceId: string, exploreDispatch: ContextDispatch) {
  const query = {
    query: SPACES_QUERY,
    variables: {
      id_in: [spaceId],
    },
  };
  const result: any = await apolloClient.query(query);
  exploreDispatch({
    type: EXPLORE_ACTIONS.UPDATE_SPACES,
    payload: result.data.spaces,
  });
}

type SpaceProposalsProps = {
  space: Space;
  spaceScreenRef: any;
  scrollProps: any;
  headerHeight?: number;
  filter: { key: string };
};
function SpaceProposals({
  space,
  spaceScreenRef,
  scrollProps,
  headerHeight = 150,
  filter,
}: SpaceProposalsProps) {
  const { refreshFeed } = useAuthState();
  const { profiles } = useExploreState();
  const authDispatch = useAuthDispatch();
  const spaceId: string = get(space, "id", "");
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const exploreDispatch = useExploreDispatch();

  const onRefresh = () => {
    setLoadCount(0);
    getProposals(
      spaceId,
      0,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      filter.key
    );
  };

  useEffect(() => {
    if (refreshFeed?.spaceId === spaceId) {
      onRefresh();
      authDispatch({
        type: AUTH_ACTIONS.SET_REFRESH_FEED,
        payload: null,
      });
    }
  }, [refreshFeed]);

  useEffect(() => {
    spaceScreenRef.current = {
      onChangeFilter: (newFilter: string) => {
        setLoadCount(0);
        getProposals(
          spaceId,
          0,
          proposals,
          setLoadCount,
          setProposals,
          true,
          setLoadingMore,
          newFilter
        );
      },
    };
  }, []);

  useEffect(() => {
    setLoadingMore(true);
    getProposals(
      spaceId,
      loadCount,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      filter.key
    );
    getSpace(spaceId, exploreDispatch);
  }, [space]);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = proposals.map((proposal: Proposal) => proposal.author);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [space, proposals]);

  return (
    <View style={common.screen}>
      <AnimatedFlatList
        scrollEventThrottle={1}
        bounces={false}
        overScrollMode={"never"}
        contentContainerStyle={{ marginTop: headerHeight }}
        data={proposals}
        keyExtractor={(item: Proposal, i) => item.id}
        renderItem={(data: { item: Proposal }) => {
          return <ProposalPreview proposal={data.item} space={space} />;
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            progressViewOffset={200}
            colors={[colors.textColor]}
            tintColor={colors.textColor}
            titleColor={colors.textColor}
            onRefresh={onRefresh}
          />
        }
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          setLoadingMore(true);
          getProposals(
            spaceId,
            loadCount === 0 ? LOAD_BY : loadCount,
            proposals,
            setLoadCount,
            setProposals,
            false,
            setLoadingMore,
            filter.key
          );
        }}
        ListEmptyComponent={
          loadingMore ? (
            <View />
          ) : (
            <View style={{ marginTop: 30, paddingHorizontal: 16 }}>
              <Text style={common.subTitle}>
                {i18n.t("cantFindAnyResults")}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "flex-start",
                marginTop: 24,
                padding: 24,
                height: headerHeight + 150,
              }}
            >
              <ActivityIndicator color={colors.textColor} size="large" />
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                height: headerHeight + 150,
                backgroundColor: "white",
              }}
            />
          )
        }
        {...scrollProps}
      />
    </View>
  );
}

export default SpaceProposals;
