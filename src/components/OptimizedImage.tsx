// src/components/OptimizedImage.tsx
import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles';

interface OptimizedImageProps {
    source: { uri: string } | number;
    style?: any;
    placeholder?: React.ReactNode;
    fallback?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    source,
    style,
    placeholder,
    fallback,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    if (error && fallback) {
        return <>{fallback}</>;
    }

    return (
        <View style={[styles.container, style]}>
            <Image
                source={source}
                style={[styles.image, style]}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
                resizeMode="cover"
            />
            {loading && (
                <View style={styles.loadingContainer}>
                    {placeholder || (
                        <ActivityIndicator
                            size="small"
                            color={theme.colors.primary[700]}
                        />
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
    },
});