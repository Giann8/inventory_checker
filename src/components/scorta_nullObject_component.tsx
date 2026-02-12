import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Product from '../model/product';
import { theme } from '../theme';
const ScortaNullObjectComponent: React.FC<{ prodotto: Product }> = ({ prodotto }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.productName}>{prodotto.name}</Text>
      <View style={styles.stockInfo}>
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Totale:</Text>
          <Text style={[styles.stockValue, styles.stockValueZero]}>
            0
          </Text>
        </View>
        
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Scarto:</Text>
          <Text style={[styles.stockValue, styles.stockValueZero]}>
            0
          </Text>
        </View>
        
        <View style={styles.stockDetails}>
          <View style={styles.lineaGroup}>
            <Text style={styles.lineaLabel}>Linea</Text>
            <View style={styles.lineaContainer}>
              <View style={styles.stockItem}>
                <Text style={styles.stockDetailLabel}>Quantità</Text>
                <Text style={[styles.stockDetailValue, styles.stockDetailValueZero]}>
                  0
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cellaGroup}>
            <Text style={styles.cellaLabel}>Magazzino</Text>
            <View style={styles.cellaContainer}>
              <View style={styles.stockItem}>
                <Text style={styles.stockDetailLabel}>Sigillato</Text>
                <Text style={[styles.stockDetailValue, styles.stockDetailValueZero]}>
                  0
                </Text>
              </View>
              
              <View style={styles.stockItem}>
                <Text style={styles.stockDetailLabel}>Aperto</Text>
                <Text style={[styles.stockDetailValue, styles.stockDetailValueZero]}>
                  0
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
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
  stockValueZero: {
    color: theme.colors.textDisabled,
    fontWeight: '400',
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
  stockDetailValueZero: {
    color: theme.colors.textDisabled,
    fontWeight: '400',
  },
});

export default ScortaNullObjectComponent;
