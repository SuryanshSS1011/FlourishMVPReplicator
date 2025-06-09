// app/(auth)/signup.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/styles';
import { Input, Button } from '../../src/components/ui';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading, error } = useAuthStore();

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await register(name, email, password);
            if (!error) {
                router.replace('/(app)/(tabs)/dashboard');
            }
        } catch (err) {
            Alert.alert('Error', 'Registration failed. Please try again.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={signupStyles.container}>
                <TouchableOpacity style={signupStyles.backButton} onPress={() => router.back()}>
                    <Feather size={21} name="arrow-left" color={theme.colors.text.primary} />
                </TouchableOpacity>

                <Text style={signupStyles.title}>Create an Account</Text>
                <Text style={signupStyles.subtitle}>Join Flourish and grow your wellness journey.</Text>

                <View style={signupStyles.inputContainer}>
                    <Input
                        label="Name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                    />
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <Button
                    title="Sign Up"
                    onPress={handleSignup}
                    loading={loading}
                />

                {error && (
                    <Text style={signupStyles.errorText}>{error}</Text>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const signupStyles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primary[100],
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
    },
    backButton: {
        marginTop: 75,
        marginBottom: theme.spacing.xl,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: theme.typography.sizes['6xl'],
        fontFamily: theme.typography.fonts.primary,
        textAlign: 'center',
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    subtitle: {
        fontSize: theme.typography.sizes.base,
        textAlign: 'center',
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xl,
        fontFamily: theme.typography.fonts.primary,
    },
    inputContainer: {
        marginBottom: theme.spacing.xl,
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: theme.spacing.md,
        fontFamily: theme.typography.fonts.primary,
    },
});