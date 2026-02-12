import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from '../theme';
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
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.shadows.md.shadowOpacity,
        shadowRadius: theme.shadows.md.shadowRadius,
        elevation: theme.shadows.md.elevation,
    },
    peso: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    descrizione: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    default:    {
        marginTop: theme.spacing.xs,
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '600',
    },
});

const enhance = withObservables(['pesoStandard'], ({ pesoStandard }: { pesoStandard: PesoStandard }) => ({
    pesoStandard,
}));

 const PesoStandardCard = enhance(crudePesoStandardCard);

export default PesoStandardCard;