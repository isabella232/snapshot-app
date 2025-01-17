import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../constants/colors";
import IconFont from "./IconFont";
import Input from "./Input";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingRight: 16,
    borderBottomColor: colors.borderColor,
  },
  searchInput: {
    flex: 1,
    borderLeftWidth: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    paddingLeft: 0,
    marginBottom: 0,
    paddingBottom: 0,
    paddingTop: 0,
    marginLeft: 16,
    marginTop: 0,
    fontSize: 21,
    fontFamily: "Calibre-Medium",
    height: 49,
    lineHeight: 21,
    color: colors.textColor,
    textAlignVertical: "center",
  },
});

interface SearchInputProps {
  onChangeText: (text: string) => void;
  value: string;
  RightComponent?: React.FC | undefined;
  searchRef: any;
}

function SearchInput({
  RightComponent = undefined,
  onChangeText,
  value,
  searchRef,
}: SearchInputProps) {
  const { colors } = useAuthState();
  return (
    <View
      style={[
        styles.searchInputContainer,
        { borderBottomColor: colors.borderColor },
      ]}
    >
      <Input
        selectionColor={colors.darkGray}
        style={[styles.searchInput, { color: colors.textColor }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={i18n.t("search")}
        placeholderTextColor={colors.borderColor}
        setRef={searchRef}
        textAlign="left"
        textAlignVertical="center"
      />
      {RightComponent !== undefined && <RightComponent />}
    </View>
  );
}

export default SearchInput;
