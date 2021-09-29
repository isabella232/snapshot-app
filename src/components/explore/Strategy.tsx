import React from "react";
import { StyleSheet, View, Text } from "react-native";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import { n } from "../../util/miscUtils";
import { Strategy } from "../../types/explore";
import common from "../../styles/common";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  text: {
    fontFamily: "Calibre-Medium",
    color: colors.headingColor,
    fontSize: 18,
  },
  version: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.headingColor,
    marginLeft: 4,
  },
  authorText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.darkGray,
    marginLeft: 4,
  },
});

type StrategyComponentProps = {
  strategy: Strategy;
};

function StrategyComponent({ strategy }: StrategyComponentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={common.h3}>{strategy.key}</Text>
        <Text style={styles.version}>v{strategy.version}</Text>
      </View>
      <View style={styles.authorContainer}>
        <FontAwesome5Icon name="github" color={colors.darkGray} size={16} />
        <Text style={styles.authorText}>{strategy.author}</Text>
      </View>
      <Text style={styles.text}>
        {i18n.t("inSpaces", { spaceCount: n(strategy.spaces) })}
      </Text>
    </View>
  );
}

export default StrategyComponent;