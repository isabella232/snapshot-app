import React from "react";
import { Text, View } from "react-native";
import colors from "../constants/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useWalletConnect } from "@walletconnect/react-native-dapp";

function LoginButton() {
  const connector = useWalletConnect();
  return (
    <TouchableOpacity
      onPress={async () => {
        await connector.connect();
      }}
    >
      <View
        style={{
          padding: 16,
          backgroundColor: colors.black,
          borderRadius: 24,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <Text style={{ color: colors.white, fontWeight: "bold", fontSize: 20 }}>
          Log in
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default LoginButton;
