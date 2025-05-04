// LoginScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Logo from '../components/logo';


// Datos dummy para el autocompletado de empresas
const empresasDummy = [
  "Acme Corporation",
  "Globex",
  "Soylent Corp",
  "Initech",
  "Umbrella Corporation",
  "Stark Industries",
  "Wayne Enterprises",
  "Oscorp",
  "Cyberdyne Systems",
  "LexCorp"
];

const LoginScreen = () => {
  const [empresa, setEmpresa] = useState('');
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [empresasFiltradas, setEmpresasFiltradas] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const alturaAnimada = useRef(new Animated.Value(0)).current;
  
  const { width } = Dimensions.get('window');
  const inputWidth = width - 60; // Considerando márgenes

  const router = useRouter();

  // Filtrar empresas cuando el usuario escribe
  useEffect(() => {
    if (empresa.length > 0) {
      const filtradas = empresasDummy.filter(
        item => item.toLowerCase().includes(empresa.toLowerCase())
      );
      setEmpresasFiltradas(filtradas);
      setMostrarSugerencias(true);
      
      // Animar la apertura de la lista de sugerencias
      Animated.timing(alturaAnimada, {
        toValue: Math.min(filtradas.length * 44, 200),
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      cerrarSugerencias();
    }
  }, [empresa]);

  const cerrarSugerencias = () => {
    Animated.timing(alturaAnimada, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      setMostrarSugerencias(false);
      setEmpresasFiltradas([]);
    });
  };

  const seleccionarEmpresa = (nombreEmpresa) => {
    setEmpresa(nombreEmpresa);
    cerrarSugerencias();
  };

  const handleLogin = () => {
    
    console.log("Iniciando sesión con:", { empresa, usuario, clave });
    router.replace({
      pathname: '/home',
      params: { usuario }, // Pasar el nombre de usuario como parámetro
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        cerrarSugerencias();
      }}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Inicia sesión</Text>
            
            {/* Input Empresa con autocompletado */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <View style={styles.iconContainer}>
                    <Ionicons name="business-outline" size={27} color="#3b82f6" />
                </View> 
          
                <TextInput
                  style={styles.input}
                  placeholder="Digita tu empresa"
                  value={empresa}
                  onChangeText={setEmpresa}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              {/* Lista de sugerencias */}
              {mostrarSugerencias && (
                <Animated.View 
                  style={[
                    styles.suggestionsContainer,
                    { height: alturaAnimada, width: inputWidth }
                  ]}
                >
                  <ScrollView nestedScrollEnabled>
                    {empresasFiltradas.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.suggestionItem,
                          index === empresasFiltradas.length - 1 ? styles.lastSuggestionItem : null
                        ]}
                        onPress={() => seleccionarEmpresa(item)}
                      >
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              )}
            </View>

            {/* Input Usuario */}
            <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={27} color="#3b82f6" />
                </View>
              <TextInput
                style={styles.input}
                placeholder="Digita tu usuario"
                value={usuario}
                onChangeText={setUsuario}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Input Contraseña */}
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons name="key-outline" size={30} color="#3b82f6" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Digita tu clave"
                secureTextEntry={!mostrarClave}
                value={clave}
                onChangeText={setClave}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setMostrarClave(!mostrarClave)}
              >
                <Ionicons 
                  name={mostrarClave ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#f97316" 
                />
              </TouchableOpacity>
            </View>

            {/* Botón de Ingreso */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Ingresar</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Una solución de Controla Gestión</Text>
            <Text style={styles.footerText}>Todos los derechos reservados</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    backgroundColor: '#1f2937',
    borderRadius: 50,
    padding: 8,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoTextBlack: {
    color: '#1f2937',
  },
  logoTextOrange: {
    color: '#f97316',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',

    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1f2937',
  },
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  iconContainer: {
    padding: 8
  },
  input: {
    flex: 1,
    padding: 12,
    color: '#4b5563',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    color: '#4b5563',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#7e22ce',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default LoginScreen;