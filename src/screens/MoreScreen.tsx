import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CONNECT_ACCOUNT_SCREEN,
  LANDING_SCREEN,
} from "../constants/navigation";
import common from "../styles/common";
import Button from "../components/Button";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import { useExploreDispatch, useExploreState } from "../context/exploreContext";
import { setProfiles } from "../util/profile";
import ConnectedWallet from "../components/ConnectedWallet";

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  bottomButton: {
    position: "absolute",
    bottom: 30,
    width: width - 32,
    left: 16,
  },
});

function MoreScreen() {
  const { connectedAddress, savedWallets }: any = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const connector = useWalletConnect();
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const authDispatch = useAuthDispatch();
  const savedWalletKeys = Object.keys(savedWallets).filter(
    (address: string) => address !== connectedAddress
  );

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray: string[] = Object.keys(savedWallets);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    if (filteredArray.length > 0) {
      setProfiles(filteredArray, exploreDispatch);
    }
  }, [connectedAddress]);

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <ScrollView style={{ marginTop: 24, flex: 1 }}>
        <Text
          style={[
            common.headerTitle,
            { marginBottom: 16, paddingHorizontal: 16 },
          ]}
        >
          {i18n.t("account")}
        </Text>
        <ConnectedWallet address={connectedAddress} isConnected />
        {savedWalletKeys.map((address: string) => {
          return (
            <ConnectedWallet
              address={address}
              isConnected={false}
              key={address}
            />
          );
        })}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(CONNECT_ACCOUNT_SCREEN);
          }}
        >
          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <Text style={common.h4}>{i18n.t("addWallet")}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.bottomButton}>
        <Button
          onPress={async () => {
            try {
              await connector.killSession();
            } catch (e) {}
            authDispatch({
              type: AUTH_ACTIONS.LOGOUT,
            });
            navigation.reset({
              index: 0,
              routes: [{ name: LANDING_SCREEN }],
            });
          }}
          title={i18n.t("logout")}
        />
      </View>
    </View>
  );
}

export default MoreScreen;