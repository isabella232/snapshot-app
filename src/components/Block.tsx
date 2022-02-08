import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import colors from "../constants/colors";
import common from "../styles/common";
import { useAuthState } from "context/authContext";

export const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    width: "100%",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "android" ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    flexDirection: "row",
    alignItems: "center",
  },
  countContainer: {
    backgroundColor: colors.darkGray,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginLeft: 4,
    marginBottom: 4,
    minWidth: 30,
    height: 30,
  },
  countText: {
    color: colors.white,
    fontFamily: "Calibre-Medium",
    fontSize: 15,
  },
});

interface BlockProps {
  title?: string;
  Content: React.ReactElement;
  count?: number | string | undefined;
  hideHeaderBorder?: boolean;
  hideHeader?: boolean;
  TitleComponent?: React.ReactElement;
  TitleRightComponent?: React.ReactElement;
  titleStyle?: any;
  headerStyle?: any;
  blockStyle?: any;
}

function Block({
  title,
  TitleComponent,
  TitleRightComponent,
  Content,
  count,
  hideHeaderBorder,
  hideHeader = false,
  titleStyle = {},
  headerStyle = {},
  blockStyle = {},
}: BlockProps) {
  const { colors } = useAuthState();
  return (
    <View
      style={[styles.block, { borderColor: colors.borderColor }, blockStyle]}
    >
      {!hideHeader && (
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.borderColor },
            hideHeaderBorder ? { borderBottomWidth: 0 } : {},
            headerStyle,
          ]}
        >
          {TitleComponent !== undefined && TitleComponent}
          {title !== undefined && (
            <Text style={[common.h4, { color: colors.textColor }, titleStyle]}>
              {title}
            </Text>
          )}
          {count !== undefined && (
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
          {TitleRightComponent !== undefined && TitleRightComponent}
        </View>
      )}
      {Content}
    </View>
  );
}

export default Block;
