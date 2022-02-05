import React from "react";
import { Text, View } from "react-native";
import i18n from "i18n-js";
import { TouchableOpacity } from "react-native-gesture-handler";
import get from "lodash/get";
import { useNavigation } from "@react-navigation/native";
import SpaceAvatar from "../SpaceAvatar";
import common from "styles/common";
import FollowButton from "../FollowButton";
import { Space } from "types/explore";
import { n } from "helpers/miscUtils";
import {
  CREATE_PROPOSAL_SCREEN,
  SPACE_SETTINGS_SCREEN,
} from "constants/navigation";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import { addressIsSnapshotWallet } from "helpers/address";
import SubscribeToSpaceButton from "components/space/SubscribeToSpaceButton";

interface SpaceHeader {
  space: Space;
  isWalletConnect: boolean | undefined;
}

function SpaceHeader({ space, isWalletConnect }: SpaceHeader) {
  const { colors, connectedAddress, snapshotWallets } = useAuthState();
  const navigation: any = useNavigation();
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );
  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 24,
        backgroundColor: colors.bgDefault,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View>
          <SpaceAvatar space={space} symbolIndex="space" size={60} />
          <Text
            style={[
              { marginTop: 8 },
              common.headerTitle,
              { color: colors.textColor },
            ]}
          >
            {get(space, "name")}
          </Text>
          <Text style={[{ marginTop: 4 }, common.subTitle]}>
            {get(space, "id")}
          </Text>
          <Text style={[{ marginTop: 4 }, common.subTitle]}>
            {n(get(space, "followers"))} {i18n.t("members")}
          </Text>
        </View>
        {(isWalletConnect || isSnapshotWallet) && (
          <View style={{ marginLeft: "auto", marginTop: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <SubscribeToSpaceButton space={space} />
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(SPACE_SETTINGS_SCREEN, { space });
                }}
              >
                <View style={{ marginBottom: 8 }}>
                  <IconFont name="gear" size={30} color={colors.textColor} />
                </View>
              </TouchableOpacity>
            </View>
            <FollowButton space={space} />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(CREATE_PROPOSAL_SCREEN, { space });
              }}
            >
              <View style={{ marginTop: 16, alignSelf: "flex-end" }}>
                <IconFont name="plus" size={30} color={colors.textColor} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default SpaceHeader;
