import React from "react";

import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";

const ActionButton = ({
  title,
  iconName,
  iconType = "MaterialIcons",
  colors,
  onPress,
  style = {},
}) => {
  const IconComponent =
    iconType === "MaterialIcons" ? MaterialIcons : FontAwesome;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[style]} // Mezclamos los estilos por defecto con los personalizados
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonContainer}
      >
        <View style={styles.buttonContent}>
          <IconComponent name={iconName} size={20} color="#fff" />
          <Text style={styles.buttonText}>{title}</Text>
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
});

export default ActionButton;
