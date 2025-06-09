import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { account, OAuthProvider } from '@/lib/appwrite';

export default function RegisterScreen() {
    const navigation = useNavigation();

    const SignupPress = () => navigation.navigate('SignupScreen');
    const LoginPress = () => navigation.navigate('LoginScreen');

    const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
    if (!deepLink.hostname) deepLink.hostname = 'localhost';
    const scheme = `${deepLink.protocol}//`;

    const GooglePress = async () => {
        try {
            const loginUrl = await account.createOAuth2Token(OAuthProvider.Google, `${deepLink}`, `${deepLink}`);
            const result = await WebBrowser.openAuthSessionAsync(loginUrl, scheme);
            const url = new URL(result.url);
            const secret = url.searchParams.get('secret');
            const userId = url.searchParams.get('userId');
            await account.createSession(userId!, secret!);
            navigation.navigate('DashboardScreen');
        } catch {
            alert('Google sign-in failed');
        }
    };

    return (
        <View>
            <LinearGradient colors={['#AEB1AE', '#4A7B56']} style={styles.gradient}>
                <Image style={{ position: 'absolute', width: '100%', height: '100%' }} source={require('@/assets/images/login page 1.png')} />
                <View style={styles.button_view}>
                    <View style={styles.button2_style}>
                        <TouchableOpacity style={styles.button1} onPress={SignupPress}>
                            <Text style={styles.text}>Signup</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button2} onPress={LoginPress}>
                            <Text style={[styles.text, { color: 'white' }]}>Login</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.button3} onPress={GooglePress}>
                        <Text style={styles.text}>Login with Google</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    gradient: {
        width: '100%',
        height: '100%',
    },
    button_view: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: '15%'

    },
    button2_style: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignContent: 'center',
        paddingBottom: 15,
    },
    button1: {
        width: "40%",
        height: 50,
        borderWidth: 2,
        borderColor: "#164432",
        justifyContent: 'center',
        borderRadius: 30,
    },
    button2: {
        alignItems: 'center',
        width: "40%",
        height: 50,
        justifyContent: 'center',
        borderRadius: 30,
        backgroundColor: "#2B8761",

    },
    button3: {
        alignItems: 'center',
        width: "87%",
        height: 50,
        borderWidth: 2,
        borderColor: "#164432",
        justifyContent: 'center',
        borderRadius: 30,
        alignSelf: 'center',
    },
    text: {
        fontFamily: 'Roboto',
        fontSize: 16,
        color: '#164432',
        textAlign: 'center',
    },
})