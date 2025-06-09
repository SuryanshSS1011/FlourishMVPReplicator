// src/components/ui/Input.tsx
import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../styles';
import type { InputProps } from '../../types';

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    error,
    disabled = false,
}) => {
    const [isSecureVisible, setIsSecureVisible] = useState(false);
    const isPassword = secureTextEntry;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        error && styles.inputError,
                        disabled && styles.inputDisabled,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.muted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !isSecureVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={!disabled}
                />

                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setIsSecureVisible(!isSecureVisible)}
                    >
                        <Feather
                            name={isSecureVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={theme.colors.text.muted}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const inputStyles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        height: theme.layout.input.height,
        borderRadius: theme.layout.input.borderRadius,
        backgroundColor: theme.colors.card,
        paddingHorizontal: theme.spacing.md,
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.primary,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    inputDisabled: {
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.muted,
    },
    eyeIcon: {
        position: 'absolute',
        right: theme.spacing.md,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    errorText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
        fontFamily: theme.typography.fonts.primary,
    },
});

const styles = { ...inputStyles };

