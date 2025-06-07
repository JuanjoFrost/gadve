import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

/**
 * Componente Toast reutilizable
 * @param {object} props - Propiedades del componente
 * @param {boolean} props.visible - Controla si el toast es visible
 * @param {string} props.message - Mensaje a mostrar en el toast
 * @param {string} props.type - Tipo de toast: 'success', 'warning', 'error', 'info'
 * @param {function} props.onHide - Callback que se ejecuta cuando el toast se oculta
 * @param {number} props.duration - Duración en ms antes de ocultarse (default: 3000ms)
 * @param {object} props.style - Estilos adicionales para el contenedor del toast
 */
const Toast = ({
  visible,
  message,
  type = "success",
  onHide,
  duration = 3000,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    let hideTimeout;
    
    if (visible) {
      // Mostrar toast con animación
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto ocultar después de duración especificada
      hideTimeout = setTimeout(() => {
        hideToast();
      }, duration);
    }

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getToastBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      case "info":
      default:
        return "#3b82f6";
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "alert-circle";
      case "error":
        return "close-circle";
      case "info":
      default:
        return "information-circle";
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: getToastBackgroundColor(),
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={getToastIcon()}
          size={20}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    right: 20,
    maxWidth: width - 40,
    minHeight: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  message: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
    flexShrink: 1,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;