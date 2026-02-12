// theme.ts
export const theme = {
 colors : {
  // Primari
  primary: '#2563EB',      // Blu professionale
  primaryDark: '#1E40AF',  // Blu scuro
  primaryLight: '#DBEAFE', // Blu chiaro per backgrounds
  
  // Secondari
  secondary: '#10B981',    // Verde per azioni positive/stock ok
  warning: '#F59E0B',      // Arancione per alert/low stock
  danger: '#EF4444',       // Rosso per errori/out of stock
  
  // Neutrali
  background: '#F9FAFB',   // Grigio chiarissimo
  surface: '#FFFFFF',      // Bianco per card
  border: '#E5E7EB',       // Grigio per bordi
  
  // Testo
  textPrimary: '#111827',  // Nero quasi puro
  textSecondary: '#6B7280', // Grigio per testo secondario
  textDisabled: '#9CA3AF', // Grigio chiaro
  
  // Stati stock
  inStock: '#10B981',      // Verde
  lowStock: '#F59E0B',     // Arancione
  outOfStock: '#EF4444',   // Rosso
},
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};