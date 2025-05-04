import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Logo() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
        //assets\images\gear.png
          source={require('../../assets/images/gear.png')}
          style={styles.gearImage} 
        />
        <View style={styles.colorSections}>
          <View style={[styles.section, { backgroundColor: '#4CAF50' }]} />
          <View style={[styles.section, { backgroundColor: '#2196F3' }]} />
          <View style={[styles.section, { backgroundColor: '#FFEB3B' }]} />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>G</Text>
        <Text style={styles.text}>A</Text>
        <Text style={styles.text}>D</Text>
        <Text style={[styles.text, { color: '#FF9800' }]}>V</Text>
        <Text style={[styles.text, { color: '#FF9800' }]}>E</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
  },
  gearImage: {
    width: 32,
    height: 32,
    tintColor: '#333',
  },
  colorSections: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  section: {
    flex: 1,
    height: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    marginLeft: 5,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
});