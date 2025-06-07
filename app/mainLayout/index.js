import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  createDrawerNavigator,
  DrawerItemList,
} from "@react-navigation/drawer";
import Logo from "../components/logo"; // Asegúrate de que la ruta sea correcta
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Drawer = createDrawerNavigator();

const MainLayout = ({ children }) => {
  return (
    <View style={styles.container}>
      <Drawer.Navigator
        initialRouteName="Mis vehículos"
        drawerContent={(props) => (
          <SafeAreaView style={styles.drawerContent} edges={['top', 'left', 'right']}>
            {/* Encabezado del menú */}

            {/* Opciones del menú */}
            <DrawerItemList {...props} />

            {/* Botón adicional */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => router.replace("/login")}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </SafeAreaView>
        )}
        screenOptions={({ navigation }) => ({
          drawerType: "front",
          drawerStyle: {
            backgroundColor: "#ffffff",
            width: 250,
            paddingTop: Constants.statusBarHeight,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={24} color="#f97316" />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Logo />
            </View>
          ),
          headerTitleAlign: "center",
        })}
      >
        {/* Rutas del menú lateral */}
        <Drawer.Screen
          name="Mis vehículos"
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        >
          {() => (
            <SafeAreaView style={styles.screenContainer} edges={['bottom']}>
              <View style={styles.content}>{children}</View>
            </SafeAreaView>
          )}
        </Drawer.Screen>
      </Drawer.Navigator>

      {/* Ícono de WhatsApp */}
      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={() => console.log("WhatsApp icon pressed")}
      >
        <Ionicons name="logo-whatsapp" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  screenContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  menuButton: {
    marginLeft: 15,
  },
  whatsappButton: {
    position: "absolute",
    bottom: Constants.statusBarHeight + 20,
    right: 20,
    backgroundColor: "#36c73b",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;