// ✅ VerifyScreen.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

export default function VerifyScreen() {
    const [code, setCode] = useState('');
    const maxLength = 6;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleCodeInputChange = (text: string) => {
        const numeric = text.replace(/[^0-9]/g, '');
        setCode(numeric);
        if (numeric.length >= maxLength) Keyboard.dismiss();
    };

    const handleVerify = () => {
        if (code.length !== maxLength) {
            return Alert.alert("Invalid code", "Please enter a 6-digit code.");
        }
        navigation.navigate("ResetPasswordScreen", { code });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backarrow} onPress={navigation.goBack}>
                    <Feather size={21} name="arrow-left" />
                </TouchableOpacity>

                <Text style={styles.text1}>Verify Account</Text>
                <Text style={styles.text2}>Enter the 6-digit code sent to your email.</Text>

                <View style={styles.container3}>
                    <Text style={styles.text3}>Enter Code</Text>
                    <TextInput
                        style={styles.textbox}
                        keyboardType="numeric"
                        maxLength={maxLength}
                        value={code}
                        onChangeText={handleCodeInputChange}
                        placeholder="6 Digit Code"
                        placeholderTextColor="#94A3B8"
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleVerify}>
                    <Text style={{ color: 'white' }}>Verify Account</Text>
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
        color: '#475569',
        textAlign: 'center',
        marginHorizontal: 40,
        marginVertical: 10,
    },
    text3: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 10,
    },
    textbox: {
        backgroundColor: 'white',
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    button: {
        marginTop: 60,
        alignSelf: 'center',
        width: 358,
        height: 44,
        backgroundColor: '#2B8761',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
});