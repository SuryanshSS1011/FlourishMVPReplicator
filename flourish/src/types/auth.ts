// src/types/auth.ts
export interface User {
    $id: string;
    email: string;
    name?: string;
    phone?: string;
    emailVerification: boolean;
    phoneVerification: boolean;
    prefs: Record<string, any>;
    registration: string;
    status: boolean;
}

export interface Session {
    $id: string;
    userId: string;
    expire: string;
    provider: string;
    providerUid: string;
    providerAccessToken?: string;
    providerAccessTokenExpiry?: string;
    providerRefreshToken?: string;
    ip: string;
    osCode: string;
    osName: string;
    osVersion: string;
    clientType: string;
    clientCode: string;
    clientName: string;
    clientVersion: string;
    clientEngine: string;
    clientEngineVersion: string;
    deviceName: string;
    deviceBrand: string;
    deviceModel: string;
    countryCode: string;
    countryName: string;
    current: boolean;
}

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

