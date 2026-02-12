
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from "@nozbe/watermelondb/react";
import { theme } from '../theme';
/**
 * Card piccola per visualizzare informazioni prodotto
 * @param {Object} prodotto - Il prodotto da visualizzare
 * @param {Object} scorta - L'ultima scorta del prodotto
 * @param {Function} onPress - Callback quando la card viene premuta
 */
const crude_prodotto = ({ prodotto, scorta, onPress }) => {
    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => onPress && onPress(prodotto)}
            activeOpacity={0.7}
        >
            {/* Header con nome prodotto */}
            <View style={styles.header}>
                <Text style={styles.productName} numberOfLines={1}>
                    {prodotto?.name || 'Prodotto sconosciuto'}
                </Text>
                <Text style={styles.productType}>
                    {prodotto?.type || ''}
                </Text>
            </View>

            

            {/* Footer con data ultimo aggiornamento */}
            {scorta?.createdAt && (
                <View style={styles.footer}>
                    <Text style={styles.lastUpdate}>
                        Agg: {new Date(scorta.createdAt).toLocaleDateString('it-IT')}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.xs,
        marginHorizontal: theme.spacing.xs,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.shadows.md.shadowOpacity,
        shadowRadius: theme.shadows.md.shadowRadius,
        elevation: theme.shadows.md.elevation,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flex: 1,
    },
    header: {
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    productType: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textTransform: 'capitalize',
    },
    stockInfo: {
        marginBottom: 8,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
        paddingVertical: 4,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: 8,
    },
    stockLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    stockValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.inStock,
    },
    stockDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stockItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    stockDetailLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    stockDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    footer: {
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    lastUpdate: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'right',
    },
    noStockInfo: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        marginBottom: theme.spacing.xs,
    },
    noStockText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

const enhance = withObservables(['prodotto'], ({ prodotto }) => ({
    prodotto,
    // Puoi aggiungere qui l'osservazione della scorta più recente
     scorta: prodotto?.getUltimaScorta() || null,
}));

const ProdottoCard = enhance(crude_prodotto);

export default ProdottoCard;