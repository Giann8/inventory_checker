import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';

export default function LoadingScreenUpdates({ message }: { message: string }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#2C5F2D" />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#333',
    },
    offlineText: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
    },
    lineaGroup: {
        flex: 2,
        alignItems: 'center',
    },
    lineaLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    lineaContainer: {
        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: '#2C5F2D',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 4,
        gap: 8,
    },
    cellaGroup: {
        flex: 3,
        alignItems: 'center',
    },
    cellaLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
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