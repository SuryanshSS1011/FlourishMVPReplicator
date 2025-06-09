import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { account, ID } from '@/lib/appwrite';
import { RootStackParamList } from '../types';

export default function SignupScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleSignup = async () => {
        try {
            await account.create(ID.unique(), email, password, name);
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            console.log('Signed up as:', user);
            navigation.navigate('DashboardScreen');
        } catch (error: any) {
            console.error('Signup error:', error);
            Alert.alert('Signup failed', error.message || 'Please try again.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backarrow} onPress={navigation.goBack}>
                    <Feather size={21} name="arrow-left" />
                </TouchableOpacity>

                <Text style={styles.title}>Create an Account</Text>
                <Text style={styles.subtitle}>Join Flourish and grow your wellness journey.</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor="#94A3B8"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        autoCapitalize="none"
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor="#94A3B8"
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={!showPassword}
                        />
                        <Feather
                            style={styles.icon}
                            size={24}
                            name={showPassword ? 'eye-off' : 'eye'}
                            onPress={togglePasswordVisibility}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                    <Text style={{ color: 'white' }}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#DEDED0',
        flex: 1,
    },
    backarrow: {
        marginTop: 75,
        marginLeft: 30,
    },
    title: {
        marginTop: 30,
        fontSize: 30,
        fontFamily: 'Roboto',
        textAlign: 'center',
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        color: '#475569',
        marginHorizontal: 40,
        marginVertical: 10,
    },
    inputContainer: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Roboto',
    },
    input: {
        backgroundColor: 'white',
        height: 44,
        borderRadius: 8,
        paddingLeft: 10,
        marginTop: 10,
        marginBottom: 20,
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
        right: 10,
    },
    button: {
        marginTop: 40,
        width: 358,
        height: 44,
        backgroundColor: '#2B8761',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        alignSelf: 'center',
    },
});