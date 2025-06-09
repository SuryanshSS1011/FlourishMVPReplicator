// src/components/ui/Modal.tsx
import React from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../styles/colors';
import type { ModalProps } from '../../types';

export const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    title,
    children,
    animationType = 'fade',
}) => {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType={animationType}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={modalStyles.overlay}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={modalStyles.container}>
                            {title && (
                                <View style={modalStyles.header}>
                                    <Text style={modalStyles.title}>{title}</Text>
                                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                                        <Feather name="x" size={24} color={theme.colors.text.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={modalStyles.content}>
                                {children}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.background.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.layout.card.borderRadius,
        maxHeight: '80%',
        width: '100%',
        ...theme.shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: theme.typography.sizes['2xl'],
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fonts.primary,
    },
    closeButton: {
        padding: theme.spacing.xs,
    },
    content: {
        padding: theme.spacing.xl,
    },
});