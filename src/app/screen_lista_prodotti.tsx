import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    listContainer: {
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    cardContainer: {
        flex: 1,
        maxWidth: '48%',
        marginBottom: 16,
    },
    
});

// Enhanced component con observables
const ScorteGiornaliereScreen = withObservables([], () => ({
    prodotti: database.get('prodotti').query().observe()
}))(ScorteGiornaliereScreenBase);

export default ScorteGiornaliereScreen;