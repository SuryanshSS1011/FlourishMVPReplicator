// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [isInternetReachable, setIsInternetReachable] = useState(true);

    useEffect(() => {
        return NetInfo.addEventListener((state: NetInfoState) => {
                    setIsConnected(state.isConnected ?? false);
                    setIsInternetReachable(state.isInternetReachable ?? false);
                });
    }, []);

    return { isConnected, isInternetReachable };
};