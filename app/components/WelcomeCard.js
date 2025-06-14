import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WelcomeCard = ({ name, jobTitle }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Hola, {name}!</Text>
          {jobTitle && <Text style={styles.jobTitleText}>{jobTitle}</Text>}
          <Text style={styles.messageText}>Te damos la bienvenida a Gadve.</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsVisible(false)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close-circle-outline"
            size={26}
            color="#757575"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#17335C",
    marginBottom: 4,
  },
  jobTitleText: {
    fontSize: 14,
    color: "#17335C",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: "#17335C",
  },
  closeButton: {
    paddingLeft: 10,
  },
});

export default WelcomeCard;
