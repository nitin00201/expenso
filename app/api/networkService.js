import NetInfo from '@react-native-community/netinfo';

export const checkInternetConnection = async () => {
  const state = await NetInfo.fetch()
  return state.isConnected;
};

// Listen for Network Changes
export const addNetworkListener = (callback) => {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected);
  });
};
