import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import PesoStandard from "../model/peso_standard";

const crudePesoStandardCard = ({ pesoStandard }: { pesoStandard: PesoStandard }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.peso}>{pesoStandard.peso}g</Text>
            <Text style={styles.descrizione}>{pesoStandard.descrizione}</Text>
            {pesoStandard.isDefault && <Text style={styles.default}>Default</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    peso: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    descrizione: {
        fontSize: 14,
        color: '#555',
    },
    default:    {
        marginTop: 5,
        fontSize: 12,
        color: '#2C5F2D',
        fontWeight: '600',
    },
});

const enhance = withObservables(['pesoStandard'], ({ pesoStandard }: { pesoStandard: PesoStandard }) => ({
    pesoStandard,
}));

 const PesoStandardCard = enhance(crudePesoStandardCard);

export default PesoStandardCard;