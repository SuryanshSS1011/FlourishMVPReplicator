// ✅ ForgotPasswordScreen.tsx
import { View, Text, TouchableOpacity, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppwrite } from '@/providers/AppwriteProvider';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const { handlePasswordResetRequest } = useAppwrite();

    const handleSendInstructionPress = async () => {
        if (loading) return;
        setLoading(true);
        const result = await handlePasswordResetRequest(email);
        if (result.success) {
            Alert.alert("Email Sent!");
            navigation.navigate("ResetPasswordScreen");
        } else {
            Alert.alert("Error", result.error?.message || "Unexpected error occurred");
        }
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backarrow} onPress={navigation.goBack}>
                    <Feather size={21} name="arrow-left" />
                </TouchableOpacity>

                <Text style={styles.text1}>Forgot Password</Text>
                <Text style={styles.text2}>No worries! Enter your email address below and we will send you a code to reset password.</Text>

                <View style={styles.container3}>
                    <Text style={styles.text3}>E-mail</Text>
                    <TextInput
                        style={styles.textbox}
                        value={email}
                        autoCapitalize='none'
                        onChangeText={setEmail}
                        placeholder='Enter your email'
                        placeholderTextColor="#94A3B8"
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSendInstructionPress} disabled={loading}>
                    <Text style={{ color: 'white' }}>{loading ? 'Sending...' : 'Send Reset Instructions'}</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#DEDED0",
        flex: 1,
    },
    container3: {
        marginTop: 10,
        marginHorizontal: 16,
    },
    backarrow: {
        marginTop: 75,
        marginLeft: 30,
    },
    text1: {
        marginTop: 30,
        fontSize: 30,
        fontWeight: '700',
        textAlign: 'center',
    },
    text2: {
        fontSize: 14,
        color: "#475569",
        textAlign: 'center',
        marginHorizontal: 40,
        marginTop: 10,
    },
    text3: {
        fontSize: 14,
        fontWeight: '500'
    },
    textbox: {
        backgroundColor: "white",
        height: 44,
        borderRadius: 8,
        paddingLeft: 10,
        marginTop: 10,
    },
    button: {
        marginTop: 80,
        alignSelf: 'center',
        width: 358,
        height: 44,
        backgroundColor: "#2b8761",
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
});