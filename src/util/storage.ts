import { AsyncStorage } from "react-native";

function getKey(key: string) {
  return `SnapshotApp_${key}`;
}

const KEYS = {
  connectedAddress: "connectedAddress",
  isWalletConnect: "isWalletConnect",
  aliases: "aliases",
  androidAppUrl: "androidAppUrl",
  savedWallets: "savedWallets",
  theme: "theme"
};

export async function load(key: string) {
  return await AsyncStorage.getItem(getKey(key));
}

export async function save(key: string, value: string) {
  return await AsyncStorage.setItem(getKey(key), value);
}

export async function clearAll() {
  try {
    await remove(KEYS.connectedAddress);
  } catch (e) {}
  try {
    await remove(KEYS.isWalletConnect);
  } catch (e) {}
  try {
    await remove(KEYS.aliases);
  } catch (e) {}
  try {
    await remove(KEYS.androidAppUrl);
  } catch (e) {}
  try {
    await remove(KEYS.savedWallets);
  } catch (e) {}
}

export async function remove(key: string) {
  return await AsyncStorage.removeItem(getKey(key));
}

export default {
  load,
  save,
  clearAll,
  KEYS,
  remove,
};
