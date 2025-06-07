import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import VehicleList from "../components/VehicleList"; // Asegúrate que la ruta sea correcta
import WelcomeCard from "../components/WelcomeCard"; // Asegúrate que la ruta sea correcta
import MainLayout from "../mainLayout"; // Asegúrate que la ruta sea correcta
import { useLocalSearchParams } from 'expo-router';

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const userDataObject = params.userData ? JSON.parse(params.userData) : null;
  
  // Obtener apiBase y apiKey de los parámetros
  // Es crucial que estos parámetros se hayan pasado desde la pantalla de login
  const apiBase = params.apiBase;
  const apiKey = params.apiKey;

  const userName = userDataObject ? `${userDataObject.First_name} ${userDataObject.Last_name}` : "Usuario";
  const userJobTitle = userDataObject ? userDataObject.Job_title : "Bienvenido";
  const userId = userDataObject ? userDataObject.Id_user : null;

  return (
       <MainLayout>
        <WelcomeCard name={userName} jobTitle={userJobTitle} />
        {/* Pasar userId, apiBase y apiKey a VehicleList */}
        {userId && apiBase && apiKey ? (
          <VehicleList userId={userId} apiBase={apiBase} apiKey={apiKey} />
        ) : (
          <View style={styles.centeredMessage}>
            <Text>Cargando información del usuario...</Text>
            {/* Podrías mostrar un ActivityIndicator aquí también */}
          </View>
        )}
      </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  logoContainer: {
    alignItems: "center",

  },
  welcomeWrapper: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#7722FF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    marginHorizontal: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 18,
    color: "#FFF",
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
