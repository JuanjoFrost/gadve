import { Redirect } from 'expo-router';

export default function Index() {
  // Puedes redirigir a la página que quieras que sea la inicial
  return <Redirect href="/login" />;
}