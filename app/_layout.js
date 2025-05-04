import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      {/* Oculta la barra de estado */}
      <StatusBar hidden={true} />
      <Stack 
        screenOptions={{
          headerShown: false, 
          animation: 'fade_from_bottom', 
        }}
      />
    </>
  );
}