import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from "@nozbe/watermelondb/react";
import Ionicons from '@expo/vector-icons/Ionicons';
import Scorte from '../model/scorte';
import Product from '../model/product';
import { theme } from '../theme';
const crude_scorta = ({ scorta, prodotto, onPress }) => {
    if(!scorta){
        return (
            <View style={styles.card}>
                <View style={styles.noStockInfo}>
                    <Text style={styles.noStockText}>Nessuna scorta registrata</Text>
                </View>
            </View>
        );
    }
    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(scorta, prodotto)} activeOpacity={0.7}>
            {scorta ? (
                <View>
                    {prodotto && <Text style={styles.productName}>{prodotto.name}</Text>}
                    <View style={styles.stockInfo}>
                        <View style={styles.stockRow}>
                            <Text style={styles.stockLabel}>Totale:</Text>
                            <Text style={styles.stockValue}>
                                {scorta.quantitaTotale ? scorta.quantitaTotale.toFixed(3) : '0.000'} kg
                            </Text>
                        </View>
                        <View style={styles.stockRow}>
                            <Text style={styles.stockLabel}>Scarto:</Text>
                            <Text style={styles.stockValue}>
                                {scorta.quantitaScarto ? scorta.quantitaScarto.toFixed(3) : '0.000'} kg
                            </Text>
                        </View>
                        <View style={styles.stockDetails}>
                            <View style={styles.lineaGroup}>
                                <Text style={styles.lineaLabel}>Linea</Text>
                                <View style={styles.lineaContainer}>
                                    <View style={styles.stockItem}>
                                        <Text style={styles.stockDetailLabel}>Quantità</Text>
                                        <Text style={styles.stockDetailValue}>
                                            {scorta.quantitaInLinea ? scorta.quantitaInLinea.toFixed(3) : '0.000'} kg
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.cellaGroup}>
                                <Text style={styles.cellaLabel}>Cella</Text>
                                <View style={styles.cellaContainer}>
                                    <View style={styles.stockItem}>
                                        <Text style={styles.stockDetailLabel}>Sigillato</Text>
                                        <Text style={styles.stockDetailValue}>
                                            {scorta.quantitaInMagazzinoSigillato ? scorta.quantitaInMagazzinoSigillato.toFixed(3) : '0.000'} kg
                                        </Text>
                                    </View>
                                    <View style={styles.stockItem}>
                                        <Text style={styles.stockDetailLabel}>Aperto</Text>
                                        <Text style={styles.stockDetailValue}>
                                            {scorta.quantitaInMagazzinoAperto ? scorta.quantitaInMagazzinoAperto.toFixed(3) : '0.000'} kg
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.editHint}>
                            <Ionicons name="create-outline" size={18} color="#2C5F2D" />
                            <Text style={styles.editHintText}>Tocca per modificare</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.noStockInfo}>
                    <Text style={styles.noStockText}>Nessuna scorta registrata</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({

    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: theme.shadows.sm.shadowOpacity,
        shadowRadius: theme.shadows.sm.shadowRadius,
        elevation: theme.shadows.sm.elevation,
    },
    editHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    editHintText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    stockInfo: {
        marginTop: theme.spacing.xs,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: theme.spacing.xs,
    },
    stockLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    stockValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    stockDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 8,
        gap: 8,
    },
    stockItem: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    lineaGroup: {
        flex: 1,
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
        flex: 2,
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
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
        gap: theme.spacing.xs,
    },
    stockDetailLabel: {
        fontSize: 11,
        color: theme.colors.textDisabled,
        textTransform: 'uppercase',
        marginBottom: theme.spacing.xs,
    },
    stockDetailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    noStockInfo: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    noStockText: {
        fontSize: 14,
        color: theme.colors.textDisabled,
        fontStyle: 'italic',
    },
});

const enhance = withObservables(['scorta', 'prodotto'], ({scorta, prodotto}: {scorta: Scorte, prodotto: Product}) => ({
    scorta,
    prodotto:scorta.prodotto
}));

const ScortaCard = enhance(crude_scorta);

export default ScortaCard;