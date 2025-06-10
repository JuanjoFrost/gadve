import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

const ActionButton = ({
  title,
  iconName,
  iconType = "MaterialIcons",
  colors,
  onPress,
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
}) => {
  const getIconComponent = () => {
    switch (iconType) {
      case "MaterialIcons":
        return MaterialIcons;
      case "FontAwesome":
        return FontAwesome;
      case "Ionicons":
        return Ionicons;
      default:
        return MaterialIcons;
    }
  };

  const IconComponent = getIconComponent();

  const buttonColors = colors;
  
  // Función de manejo de presión
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={disabled || loading ? 1 : 0.8}
      onPress={handlePress}
      style={[
        style,
        disabled && styles.disabledTouchable // ✅ CAMBIO: Aplicar opacidad al TouchableOpacity
      ]}
      disabled={disabled || loading}
      pointerEvents={disabled || loading ? "none" : "auto"}
    >
      <LinearGradient
        colors={buttonColors} // ✅ CAMBIO: Usar colores originales
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.buttonContainer,
          // ✅ CAMBIO: Remover disabledContainer del LinearGradient
        ]}
      >
        <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" style={styles.loadingIcon} />
          ) : (
            iconName && (
              <IconComponent 
                name={iconName} 
                size={20} 
                color="#fff" // ✅ CAMBIO: Mantener color blanco del icono
              />
            )
          )}
          <Text 
            style={[
              styles.buttonText, 
              // ✅ CAMBIO: Remover disabledText
              textStyle
            ]}
          >
            {loading ? "Cargando..." : title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 5,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    height: "auto",
    maxHeight: 30,
    marginHorizontal: 5,
  },
  // ✅ CAMBIO: Nueva clase para aplicar opacidad solo al TouchableOpacity
  disabledTouchable: {
    opacity: 0.9,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    marginHorizontal: 5,
    fontWeight: "bold",
  },
  loadingIcon: {
    marginRight: 5,
  },
});

export default ActionButton;
