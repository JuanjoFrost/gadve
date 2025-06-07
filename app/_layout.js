import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context"; // Importar SafeAreaProvider

export default function RootLayout() {
  return (
    <>

        <StatusBar hidden={true} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        />
   
    </>
  );
}
