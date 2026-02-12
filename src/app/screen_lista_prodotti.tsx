import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { theme } from '../theme';
import database from '../db';
import React from 'react';
import { router } from 'expo-router';
import { withObservables } from "@nozbe/watermelondb/react";
import AddProdotto from '../components/addprodotto';
import ProdottoCard from '../components/prodotto_card';
import Product from '../model/product';

const ScorteGiornaliereScreenBase = ({ prodotti }) => {

    const handleProductPress = (prodotto: Product) => {
        Alert.alert(
            prodotto.name || 'Prodotto',
            'Cosa vuoi fare?',
            [
                {
                    text: 'Cancella',
                    style: 'destructive',
                    onPress: () => handleDeleteProduct(prodotto)
                },
                {
                    text: 'Pesi Standard',
                    onPress: () => {

                        router.push(`/screen_peso_standard/${prodotto.id}`);
                    }
                },
                {
                    text: 'Annulla',
                    style: 'cancel'
                }
            ]
        );
    };
    
    const handleDeleteProduct = async (prodotto: Product) => {
        try {
            await Product.eliminaProdotto(prodotto);
            Alert.alert('Successo', 'Prodotto eliminato!');
        } catch (error) {
            Alert.alert('Errore', 'Impossibile eliminare il prodotto');
            console.error('Errore eliminazione:', error);
        }
    };

    /**
     * 
     * @param param0 
     * @returns 
     */
    const renderProdotto = ({ item }: { item: Product }) => (
        <View style={styles.cardContainer}>
            <ProdottoCard prodotto={item} scorta={null} onPress={() => handleProductPress(item)} />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Scorte Giornaliere</Text>
                <AddProdotto />
            </View>
            
            <FlatList
                data={prodotti}
                renderItem={renderProdotto}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: theme.spacing.md,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.shadows.md.shadowOpacity,
        shadowRadius: theme.shadows.md.shadowRadius,
        elevation: theme.shadows.md.elevation,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    listContainer: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.sm,
    },
    cardContainer: {
        flex: 1,
        maxWidth: '48%',
        marginBottom: theme.spacing.md,
    },
    
});

// Enhanced component con observables
const ScorteGiornaliereScreen = withObservables([], () => ({
    prodotti: database.get('prodotti').query().observe()
}))(ScorteGiornaliereScreenBase);

export default ScorteGiornaliereScreen;