import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const NavigationFooter = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      icon: <Ionicons name="home" size={24} color="#666" />,
      route: '/',
    },
    {
      label: 'Prodotti',
      icon: <Ionicons name="cube" size={24} color="#666" />,
      route: '/screen_lista_prodotti',
    },
    {
      label: 'Scorte',
      icon: <Ionicons name="bar-chart-sharp" size={24} color="#666" />,
      route: '/screen_scorte_giornaliere',
    },
    {
      label: 'Aggiungi',
      icon: <Ionicons name="add-outline" size={24} color="#666" />,
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
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
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  labelActive: {
    color: '#2C5F2D',
    fontWeight: '700',
  },
});

export default NavigationFooter;
