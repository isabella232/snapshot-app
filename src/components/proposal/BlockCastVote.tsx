import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import i18n from "i18n-js";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import Block from "../Block";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import { getPower } from "helpers/snapshot";
import Button from "../Button";
import VotingSingleChoice from "./VotingSingleChoice";
import VotingRankedChoice from "./VotingRankedChoice";
import VoteConfirmModal from "./VoteConfirmModal";
import { useAuthState } from "context/authContext";
import VotingQuadratic from "./VotingQuadratic";
import VotingApproval from "./VotingApproval";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import common from "styles/common";
import { useNavigation } from "@react-navigation/core";
import size from "lodash/size";
import { addressIsSnapshotWallet } from "helpers/address";

const { height: deviceHeight } = Dimensions.get("screen");

interface BlockCastVoteProps {
  proposal: Proposal;
  resultsLoaded: boolean;
  setScrollEnabled: (scrollEnabled: boolean) => void;
  space: Space;
  getProposal: () => void;
  onClose: () => void;
  scrollEnabled: boolean;
}

async function loadPower(
  connectedAddress: string,
  proposal: Proposal,
  space: Space,
  setTotalScore: (totalScore: number) => void
) {
  if (!connectedAddress || !proposal.author) return;
  const response = await getPower(space, connectedAddress, proposal);
  if (typeof response.totalScore === "number") {
    setTotalScore(response.totalScore);
  }
}

function BlockCastVote({
  proposal,
  resultsLoaded,
  setScrollEnabled,
  space,
  getProposal,
  onClose,
  scrollEnabled,
}: BlockCastVoteProps) {
  const { colors } = useAuthState();
  const { connectedAddress, isWalletConnect, snapshotWallets } = useAuthState();
  const [selectedChoices, setSelectedChoices] = useState<any>([]);
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const navigation = useNavigation();
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );

  const [totalScore, setTotalScore] = useState(0);
  let VotesComponent;

  if (proposal.type === "single-choice") {
    VotesComponent = VotingSingleChoice;
  } else if (proposal.type === "ranked-choice") {
    VotesComponent = VotingRankedChoice;
  } else if (proposal.type === "quadratic" || proposal.type === "weighted") {
    VotesComponent = VotingQuadratic;
  } else if (proposal.type === "approval") {
    VotesComponent = VotingApproval;
  }

  useEffect(() => {
    loadPower(connectedAddress ?? "", proposal, space, setTotalScore);
  }, [space]);

  if (VotesComponent) {
    return (
      <>
        <Block
          title={i18n.t("vote")}
          headerStyle={{
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            borderBottomWidth: 0,
            paddingTop: 0,
          }}
          blockStyle={{ borderWidth: 0 }}
          Content={
            <View
              style={{
                paddingVertical: 24,
                paddingHorizontal:
                  proposal.type === "quadratic" || proposal.type === "weighted"
                    ? 8
                    : 24,
              }}
            >
              {resultsLoaded ? (
                <VotesComponent
                  proposal={proposal}
                  selectedChoices={selectedChoices}
                  setSelectedChoices={setSelectedChoices}
                  setScrollEnabled={setScrollEnabled}
                />
              ) : (
                <Placeholder
                  style={{ justifyContent: "center", alignItems: "center" }}
                  Animation={Fade}
                >
                  <PlaceholderLine width={100} />
                  <PlaceholderLine width={100} />
                  <PlaceholderLine width={100} />
                </Placeholder>
              )}

              <Button
                title={i18n.t("vote")}
                onPress={() => {
                  let initialSnapPoint: number | string =
                    selectedChoices.length > 2
                      ? deviceHeight / 2 + size(selectedChoices) * 20
                      : deviceHeight / 2;
                  if (initialSnapPoint >= deviceHeight) {
                    initialSnapPoint = "100%";
                  }

                  bottomSheetModalDispatch({
                    type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                    payload: {
                      options: [],
                      snapPoints: [10, initialSnapPoint, "100%"],
                      show: true,
                      scroll: scrollEnabled,
                      initialIndex: 1,
                      ModalContent: () => (
                        <VoteConfirmModal
                          onClose={() => {
                            onClose();
                            bottomSheetModalRef.current.close();
                          }}
                          proposal={proposal}
                          selectedChoices={selectedChoices}
                          space={space}
                          totalScore={totalScore}
                          getProposal={getProposal}
                          navigation={navigation}
                        />
                      ),
                    },
                  });
                }}
                disabled={
                  (!isSnapshotWallet && !isWalletConnect) ||
                  selectedChoices.length === 0
                }
                buttonContainerStyle={{
                  backgroundColor:
                    (!isSnapshotWallet && !isWalletConnect) ||
                    selectedChoices.length === 0
                      ? colors.borderColor
                      : colors.bgBlue,
                  borderColor:
                    (!isSnapshotWallet && !isWalletConnect) ||
                    selectedChoices.length === 0
                      ? colors.borderColor
                      : colors.bgBlue,
                }}
                buttonTitleStyle={{
                  color: colors.white,
                }}
              />
            </View>
          }
        />
      </>
    );
  }
  return (
    <View
      style={[common.alignItemsCenter, common.justifyCenter, { width: "100%" }]}
    >
      <Text style={[common.h4, { color: colors.textColor }]}>
        {i18n.t("vote")}
      </Text>
    </View>
  );
}

export default BlockCastVote;
