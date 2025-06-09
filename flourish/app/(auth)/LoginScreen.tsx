import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { account, ID, OAuthProvider, Models } from '@/lib/appwrite';

export default function LoginScreen() {
    const [loginedInUser, setLoginedInUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showpassword, setShowpassword] = useState(false);

    const navigation = useNavigation();

    const togglePassword = () => setShowpassword(!showpassword);

    const SignupPress = () => navigation.navigate('SignupScreen');
    const ForgotPasswordScreenPress = () => navigation.navigate('ForgotPasswordScreen');

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
            const loginstatus = await account.get();
            setLoginedInUser(loginstatus);
            navigation.navigate('DashboardScreen');
        } catch (err) {
            Alert.alert('Google login failed');
        }
    };

    const LoginPress = async () => {
        try {
            await account.createEmailPasswordSession(email, password);
            const loginstatus = await account.get();
            setLoginedInUser(loginstatus);
            navigation.navigate('DashboardScreen');
        } catch {
            Alert.alert('There was an error logging in');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                <Image style={{ width: '100%' }} source={require('@/assets/images/splash 8.png')} />
                <View style={styles.container}>
                    <View style={styles.container2}>
                        <View style={styles.container3}>
                            <Text style={styles.text}>E-mail</Text>
                            <TextInput
                                style={styles.textbox}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="#94A3B8"
                            />
                            <Text style={styles.text}>Password</Text>
                            <View style={styles.password}>
                                <TextInput
                                    style={styles.textbox}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showpassword}
                                />
                                <Feather style={styles.icon} size={24} name={showpassword ? 'eye-off' : 'eye'} onPress={togglePassword} />
                            </View>
                        </View>

                        <View style={styles.help}>
                            <TouchableOpacity onPress={ForgotPasswordScreenPress}>
                                <Text style={styles.text2}>Forgot Password?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={SignupPress}>
                                <Text style={styles.text2}>Register</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.login_button} onPress={LoginPress}>
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>

                        <Text style={styles.text3}>or login with</Text>

                        <TouchableOpacity style={styles.button} onPress={GooglePress}>
                            <Text>Login with Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DEDED0",
        position: "absolute",
        top: "80%",
        width: "100%",
        height: "100%",
        borderRadius: 16,

    },
    container2: {
        flex: 1,
        alignItems: "center",
        paddingTop: 25,
        flexDirection: 'column'

    },
    container3: {
        width: '100%',
        marginLeft: 90,

    },
    textbox: {
        backgroundColor: "white",
        width: "80%",
        height: 44,
        borderRadius: 8,
        textAlign: 'left',
        paddingLeft: 10,
        marginTop: 10,
        marginBlock: 10,
    },
    text: {
        alignItems: 'flex-start',
        width: "100%",
        fontFamily: "Roboto",
    },
    text2: {
        alignItems: 'flex-start',
        width: "100%",
        fontFamily: "Roboto",
        marginTop: 5,
        textDecorationLine: 'underline',
        color: "#3c9afb",
    },
    password: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
    },
    icon: {
        position: "absolute",
        marginLeft: 280,
    },

    help: {
        width: "100%",
        alignItems: "flex-end",
        display: 'flex',
        marginRight: 90,
        paddingTop: 10,
        paddingBottom: 10,

    },
    button: {
        alignItems: 'center',
        width: "87%",
        height: 44,
        borderWidth: 2,
        borderColor: "#164432",
        justifyContent: 'center',
        borderRadius: 30,
        alignSelf: 'center',
    },
    login_button: {
        alignItems: 'center',
        width: "87%",
        height: 44,
        justifyContent: 'center',
        borderRadius: 30,
        marginTop: 30,
        alignSelf: 'center',
        backgroundColor: "#2B8761",
    },
    text3: {
        width: "100%",
        fontFamily: "Roboto",
        textAlign: 'center',
        paddingTop: 6,
        marginBottom: 6,
    },
    loginText: {
        color: "white",
        fontFamily: "Roboto",
        fontWeight: 'bold',
    },
})