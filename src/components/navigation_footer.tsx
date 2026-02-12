import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../theme';

const NavigationFooter = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      icon: <Ionicons name="home" size={24} color={theme.colors.textSecondary} />,
      route: '/',
    },
    {
      label: 'Prodotti',
      icon: <Ionicons name="cube" size={24} color={theme.colors.textSecondary} />,
      route: '/screen_lista_prodotti',
    },
    {
      label: 'Scorte',
      icon: <Ionicons name="bar-chart-sharp" size={24} color={theme.colors.textSecondary} />,
      route: '/screen_scorte_giornaliere',
    },
    {
      label: 'Tare',
      icon: <Ionicons name="cube-outline" size={24} color={theme.colors.textSecondary} />,
      route: '/screen_tare',
    },
    {
      label: 'Aggiungi',
      icon: <Ionicons name="add-outline" size={24} color={theme.colors.textSecondary} />,
      route: '/aggiungi_scorte',
    },
  ];

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === route;
    }
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.navItem,
            isActive(item.route) && styles.navItemActive,
          ]}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={[
            styles.icon,
            isActive(item.route) && styles.iconActive,
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.label,
            isActive(item.route) && styles.labelActive,
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
    color: theme.colors.textSecondary,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
});

export default NavigationFooter;
