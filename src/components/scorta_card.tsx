import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from "@nozbe/watermelondb/react";
import Ionicons from '@expo/vector-icons/Ionicons';
import Scorte from '../model/scorte';
import Product from '../model/product';

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
                                {scorta.quantitaTotale || 0}
                            </Text>
                        </View>
                        
                        <View style={styles.stockRow}>
                            <Text style={styles.stockLabel}>Scarto:</Text>
                            <Text style={styles.stockValue}>
                                {scorta.quantitaScarto || 0}
                            </Text>
                        </View>
                        
                        <View style={styles.stockDetails}>
                            <View style={styles.lineaGroup}>
                                <Text style={styles.lineaLabel}>Linea</Text>
                                <View style={styles.lineaContainer}>
                                    <View style={styles.stockItem}>
                                        <Text style={styles.stockDetailLabel}>Quantità</Text>
                                        <Text style={styles.stockDetailValue}>
                                            {scorta.quantitaInLinea || 0}
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
                                            {scorta.quantitaInMagazzinoSigillato || 0}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.stockItem}>
                                        <Text style={styles.stockDetailLabel}>Aperto</Text>
                                        <Text style={styles.stockDetailValue}>
                                            {scorta.quantitaInMagazzinoAperto || 0}
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
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    editHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    editHintText: {
        fontSize: 13,
        color: '#2C5F2D',
        fontWeight: '500',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C5F2D',
        marginBottom: 8,
    },
    stockInfo: {
        marginTop: 8,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 8,
    },
    stockLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    stockValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C5F2D',
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
        flex: 2,
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
    stockDetailLabel: {
        fontSize: 11,
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    stockDetailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    noStockInfo: {
        padding: 20,
        alignItems: 'center',
    },
    noStockText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
});

const enhance = withObservables(['scorta', 'prodotto'], ({scorta, prodotto}: {scorta: Scorte, prodotto: Product}) => ({
    scorta,
    prodotto:scorta.prodotto
}));

const ScortaCard = enhance(crude_scorta);

export default ScortaCard;