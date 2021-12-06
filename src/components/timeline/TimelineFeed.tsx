import { useAuthState } from "context/authContext";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import React, { useEffect, useState } from "react";
import { Proposal } from "types/proposal";
import { setProfiles } from "helpers/profile";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import ProposalPreview from "components/ProposalPreview";
import common from "styles/common";
import i18n from "i18n-js";
import { PROPOSALS_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import { CollapsibleHeaderFlatList } from "react-native-collapsible-header-views";
import TimelineHeader from "components/timeline/TimelineHeader";
import proposal from "constants/proposal";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";

const LOAD_BY = 6;

async function getProposals(
  followedSpaces: any,
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
      space_in: followedSpaces.map((follow: any) => follow.space.id),
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

function TimelineFeed() {
  const { followedSpaces, colors, connectedAddress } = useAuthState();
  const { profiles, spaces } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [joinedSpacesFilter, setJoinedSpacesFilter] = useState(
    proposal.getStateFilters()[0]
  );
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();

  function onChangeFilter(newFilter: string) {
    setLoadCount(0);
    getProposals(
      followedSpaces,
      0,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      newFilter
    );
  }

  useEffect(() => {
    if (followedSpaces.length > 0) {
      setLoadingMore(true);
      getProposals(
        followedSpaces,
        loadCount,
        proposals,
        setLoadCount,
        setProposals,
        true,
        setLoadingMore,
        joinedSpacesFilter.key
      );
    }
  }, [followedSpaces]);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = proposals.map((proposal: Proposal) => proposal.author);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [proposals]);

  return (
    <CollapsibleHeaderFlatList
      key={connectedAddress}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            if (followedSpaces.length > 0) {
              setLoadCount(0);
              setRefreshing(true);
              getProposals(
                followedSpaces,
                0,
                proposals,
                setLoadCount,
                setProposals,
                true,
                setRefreshing,
                joinedSpacesFilter.key
              );
            }
          }}
        />
      }
      headerHeight={followedSpaces.length > 0 ? 148 : 65}
      clipHeader
      CollapsibleHeaderComponent={
        <TimelineHeader
          joinedSpacesFilter={joinedSpacesFilter}
          showBottomSheetModal={() => {
            const stateFilters = proposal.getStateFilters();
            const allFilter = stateFilters[0];
            const activeFilter = stateFilters[1];
            const pendingFilter = stateFilters[2];
            const closedFilter = stateFilters[3];
            const options = [
              allFilter.text,
              activeFilter.text,
              pendingFilter.text,
              closedFilter.text,
            ];
            const setFilter = setJoinedSpacesFilter;
            bottomSheetModalDispatch({
              type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
              payload: {
                options,
                snapPoints: [10, 250],
                show: true,
                initialIndex: 1,
                onPressOption: (index: number) => {
                  if (index === 0) {
                    setFilter(allFilter);
                    onChangeFilter(allFilter.key);
                  } else if (index === 1) {
                    setFilter(activeFilter);
                    onChangeFilter(activeFilter.key);
                  } else if (index === 2) {
                    setFilter(pendingFilter);
                    onChangeFilter(pendingFilter.key);
                  } else if (index === 3) {
                    setFilter(closedFilter);
                    onChangeFilter(closedFilter.key);
                  }
                  bottomSheetModalRef?.current?.close();
                },
              },
            });
          }}
        />
      }
      data={followedSpaces.length > 0 ? proposals : []}
      renderItem={(data) => {
        return (
          <ProposalPreview
            proposal={data.item}
            fromFeed={true}
            space={spaces[data.item?.space?.id]}
          />
        );
      }}
      keyExtractor={(item) => `${item.id}`}
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        setLoadingMore(true);
        getProposals(
          followedSpaces,
          loadCount === 0 ? LOAD_BY : loadCount,
          proposals,
          setLoadCount,
          setProposals,
          false,
          setLoadingMore,
          joinedSpacesFilter.key
        );
      }}
      ListEmptyComponent={
        loadingMore ? (
          <View />
        ) : (
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text style={[common.subTitle, { color: colors.textColor }]}>
              {followedSpaces.length === 0
                ? i18n.t("noSpacesJoinedYet")
                : i18n.t("cantFindAnyResults")}
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
              justifyContent: "center",
              padding: 24,
              height: 150,
            }}
          >
            <ActivityIndicator color={colors.textColor} size="large" />
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              height: 150,
              backgroundColor: colors.bgDefault,
            }}
          />
        )
      }
    />
  );
}

export default TimelineFeed;