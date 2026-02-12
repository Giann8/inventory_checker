import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export default function LoadingScreenUpdates({ message }: { message: string }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
    loadingText: {
        marginTop: theme.spacing.lg,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    offlineText: {
        marginTop: theme.spacing.sm,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    lineaGroup: {
        flex: 2,
        alignItems: 'center',
    },
    lineaLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
    },
    lineaContainer: {
        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
        gap: theme.spacing.xs,
    },
    cellaGroup: {
        flex: 3,
        alignItems: 'center',
    },
    cellaLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
    },
    cellaContainer: {
        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: '#2C5F2D',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 4,
        gap: 8,
    },
});