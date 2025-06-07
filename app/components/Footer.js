import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const Footer = () => {
  return (
    <LinearGradient
      colors={["#7722ff00", "#f9741600"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.footerContainer}
    >
      <View style={styles.footerContent}>
        <Text style={styles.footerText}>Una solución de Controla Gestión </Text>
        <MaterialIcons name="copyright" size={20} color="#fff" />
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
    color: "#fff",
    backgroundColor: "#7722FF",
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default Footer;
