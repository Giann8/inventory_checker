
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from "@nozbe/watermelondb/react";

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
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginVertical: 4,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5, // Android shadow
        borderWidth: 1,
        borderColor: '#f0f0f0',
        flex: 1,
    },
    header: {
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productType: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    stockInfo: {
        marginBottom: 8,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        paddingHorizontal: 8,
    },
    stockLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#495057',
    },
    stockValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
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
        color: '#6c757d',
        marginBottom: 2,
    },
    stockDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
    },
    footer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    lastUpdate: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'right',
    },
    noStockInfo: {
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderStyle: 'dashed',
        marginBottom: 8,
    },
    noStockText: {
        fontSize: 14,
        color: '#6c757d',
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