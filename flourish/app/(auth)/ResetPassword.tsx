// ✅ ResetPasswordScreen.tsx
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useLocalSearchParams } from 'expo-router';
import { useAppwrite } from '@/providers/AppwriteProvider';

export default function ResetPasswordScreen() {
    const { userId, secret } = useLocalSearchParams();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);
    const { handlePasswordReset } = useAppwrite();

    useEffect(() => {
        if (!userId || !secret) {
            Alert.alert("Invalid reset link");
            navigation.navigate("LoginScreen");
        }
    }, [userId, secret]);

    const handlePasswordResetPress = async () => {
        if (password !== confirmPassword) {
            setIsPasswordMismatch(true);
            return Alert.alert('Passwords do not match');
        }

        try {
            await handlePasswordReset(password, userId as string, secret as string);
            Alert.alert("Password updated successfully");
            navigation.navigate("LoginScreen");
        } catch (err) {
            Alert.alert("Error", 'Failed to reset password');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backarrow} onPress={() => navigation.navigate("LoginScreen")}>
                    <Feather size={21} name="arrow-left" />
                </TouchableOpacity>

                <Text style={styles.text1}>Create New Password</Text>
                <Text style={styles.text2}>Please enter and confirm your new password. You will need to log in after resetting.</Text>

                <View style={styles.container3}>
                    <Text style={styles.text3}>Password</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={styles.textbox}
                            value={password}
                            onChangeText={setPassword}
                            placeholder='Enter password'
                            placeholderTextColor='#94A3B8'
                            secureTextEntry={!showPassword}
                        />
                        <Feather
                            style={styles.icon}
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                    </View>

                    <Text style={styles.text3}>Confirm Password</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={styles.textbox}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder='Confirm password'
                            placeholderTextColor='#94A3B8'
                            secureTextEntry={!showConfirmPassword}
                        />
                        <Feather
                            style={styles.icon}
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={24}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    </View>

                    {isPasswordMismatch && <Text style={styles.error}>Passwords do not match</Text>}
                </View>

                <TouchableOpacity style={styles.button} onPress={handlePasswordResetPress}>
                    <Text style={{ color: 'white' }}>Reset Password</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DEDED0',
    },
    container3: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    backarrow: {
        marginTop: 75,
        marginLeft: 30,
    },
    text1: {
        fontSize: 30,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 30,
    },
    text2: {
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 40,
        marginTop: 10,
        color: '#475569',
    },
    text3: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 20,
    },
    textbox: {
        backgroundColor: 'white',
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 10,
    },
    button: {
        marginTop: 40,
        alignSelf: 'center',
        width: 358,
        height: 44,
        backgroundColor: '#2B8761',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
        right: 10,
    },
    error: {
        color: 'red',
        marginTop: 8,
    },
});