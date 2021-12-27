import React, { useMemo } from "react";
import { Platform, Share } from "react-native";
import BottomSheetModal from "components/BottomSheetModal";
import i18n from "i18n-js";
import { Space } from "types/explore";
import { useAuthDispatch, useAuthState } from "context/authContext";
import { CREATE_PROPOSAL_SCREEN } from "constants/navigation";
import { useToastShowConfig } from "constants/toast";
import { Proposal } from "types/proposal";
import { useNavigation } from "@react-navigation/native";
import { deleteProposal, isAdmin } from "helpers/apiUtils";
import { getProposalUrl } from "helpers/proposalUtils";

interface ProposalMenuProps {
  proposal: Proposal;
  space: Space;
  bottomSheetRef: any;
  onClose: () => void;
}

function ProposalBottomSheet({
  bottomSheetRef,
  proposal,
  space,
  onClose,
}: ProposalMenuProps) {
  const { connectedAddress, wcConnector } = useAuthState();
  const options = useMemo(() => {
    const setOptions = [i18n.t("share"), i18n.t("duplicateProposal")];
    if (
      isAdmin(connectedAddress ?? "", space) ||
      connectedAddress === proposal?.author
    ) {
      setOptions.push(i18n.t("deleteProposal"));
    }
    return setOptions;
  }, [proposal, space]);
  const authDispatch = useAuthDispatch();
  const snapPoints = [10, options.length > 1 ? 200 : 100];
  const toastShowConfig = useToastShowConfig();
  const navigation: any = useNavigation();
  const destructiveButtonIndex = 2;

  return (
    <BottomSheetModal
      bottomSheetRef={bottomSheetRef}
      snapPoints={snapPoints}
      options={options}
      onPressOption={async (index) => {
        if (index === 0) {
          try {
            await Share.share({
              url: getProposalUrl(proposal, space),
              message:
                proposal.title + Platform.OS === "android"
                  ? ` ${getProposalUrl(proposal, space)}`
                  : "",
            });
          } catch (error) {
            console.log("SHARE ERROR", error);
          }
        } else if (index === 1) {
          navigation.navigate(CREATE_PROPOSAL_SCREEN, { proposal, space });
        } else if (
          (isAdmin(connectedAddress ?? "", space) ||
            connectedAddress === proposal?.author) &&
          index === 2
        ) {
          deleteProposal(
            wcConnector,
            connectedAddress ?? "",
            space,
            proposal,
            authDispatch,
            toastShowConfig,
            navigation
          );
        }
        onClose();
      }}
      destructiveButtonIndex={destructiveButtonIndex}
      initialIndex={1}
      icons={[
        { name: "upload", size: 22 },
        { name: "external-link" },
        { name: "close" },
      ]}
    />
  );
}

export default ProposalBottomSheet;
