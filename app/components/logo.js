import { View, Text, StyleSheet, Image } from 'react-native';

export default function Logo() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/gadve-icon-2.png')}
          style={styles.logoImage} 
        />
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
  logoImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain', 
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