import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Logo from '../components/logo';
import VehicleList from '../components/VehicleList';

export default function HomeScreen() {
  const { usuario } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <View style={styles.welcomeWrapper}>
        <Text style={styles.welcomeText}>Hola, {usuario}!</Text>
        <Text style={styles.messageText}>¡Te damos la bienvenida a gadve!</Text>
      </View>
      <VehicleList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: 40, // margen superior para evitar solaparse con el notch
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeWrapper: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#7722FF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    marginHorizontal: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 18,
    color: '#FFF',
  },
});
