import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Logo from '../components/logo';

const CheckList = ({vehicle}) => {
    if (!vehicle) {
      return null; // Manejo de error si no se pasa el vehículo
    }
  // Status options: "Bueno", "Regular", "Malo"
  const [checkItems, setCheckItems] = useState({
    'Parabrisas': "Bueno",
    'Neumáticos': "Bueno",
    'Puertas': "Bueno",
    'Asientos': "Bueno",
    'Luces delanteras': "Bueno",
    'Luces traseras': "Regular"
  });
  
  const [observations, setObservations] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState('');
  
  // Animaciones
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const handleStatusChange = (item, status) => {
    setCheckItems({
      ...checkItems,
      [item]: status
    });
    setModalVisible(false);
  };
  
  const openStatusSelector = (item) => {
    setCurrentItem(item);
    setModalVisible(true);
    
    // Animar la apertura del modal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSend = () => {
    // Implementar lógica de envío aquí
    // Animación de éxito podría agregarse aquí
    alert('Lista de verificación enviada con éxito');
  };

  const handleCancel = () => {
    // Implementar lógica de cancelación aquí
    alert('Operación cancelada');
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case "Bueno":
        return <Ionicons name="checkmark-circle" size={18} color="white" style={{marginRight: 4}} />;
      case "Regular":
        return <Ionicons name="alert-circle" size={18} color="white" style={{marginRight: 4}} />;
      case "Malo":
        return <Ionicons name="close-circle" size={18} color="white" style={{marginRight: 4}} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <FontAwesome5 name="bars" size={18} color="#9333ea" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Vehicle Info Card */}
            <View style={styles.vehicleCard}>
                <Text style={styles.vehicleCardTitle}>CheckList de Vehículo 05-05-2025</Text>
                <View style={styles.vehicleInfo}>
                <FontAwesome5 name="car" size={16} color="white" />
                <Text style={styles.vehicleText}>{vehicle.id}</Text>
                </View>
                <Text style={styles.vehicleDescription}>{`Vehículo: ${'Toyota Corolla'}`}</Text>
            </View>

            {/* Checklist Card */}
            <View style={styles.checklistCard}>
                <View style={styles.infoIcon}>
                <Ionicons name="information-circle" size={26} color="#3b82f6" />
                </View>

                {Object.keys(checkItems).map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.checkItem}
                    onPress={() => openStatusSelector(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.checkItemText}>{item}:</Text>
                    <View
                    style={[
                        styles.statusIndicator,
                        checkItems[item] === "Bueno"
                        ? styles.statusGood
                        : checkItems[item] === "Regular"
                        ? styles.statusRegular
                        : styles.statusBad,
                    ]}
                    >
                    {getStatusIcon(checkItems[item])}
                    <Text style={styles.statusText}>{checkItems[item]}</Text>
                    <MaterialIcons name="arrow-drop-down" size={18} color="white" />
                    </View>
                </TouchableOpacity>
                ))}

                <View style={styles.observations}>
                <Text style={styles.observationsLabel}>Observaciones:</Text>
                <TextInput
                    style={styles.observationsInput}
                    multiline
                    numberOfLines={3}
                    value={observations}
                    onChangeText={setObservations}
                    placeholder="Añadir observaciones..."
                />
                </View>
            </View>

            {/* Upload Images Card */}
            <View style={styles.uploadCard}>
                <View style={styles.uploadContainer}>
                <MaterialIcons name="image" size={24} color="#4ade80" />
                <Text style={styles.uploadText}>Subir imágenes</Text>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <MaterialIcons name="check" size={20} color="white" />
                <Text style={styles.sendButtonText}>Enviar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <MaterialIcons name="close" size={20} color="white" />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Una solución de Controla Gestión</Text>
                <Text style={styles.footerText}>Todos los derechos reservados</Text>
            </View>
            </ScrollView>

      {/* Status Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Estado de {currentItem}</Text>
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.modalOptionGood]}
              onPress={() => handleStatusChange(currentItem, "Bueno")}
            >
              <Text style={styles.modalOptionText}>Bueno</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.modalOptionRegular]}
              onPress={() => handleStatusChange(currentItem, "Regular")}
            >
              <Text style={styles.modalOptionText}>Regular</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.modalOptionBad]}
              onPress={() => handleStatusChange(currentItem, "Malo")}
            >
              <Text style={styles.modalOptionText}>Malo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Color de fondo más claro y moderno
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.95)', // Transparencia sutil
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.8)',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButton: {
    padding: 8,
    backgroundColor: 'rgba(245,247,250,0.6)',
    borderRadius: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoTextContainer: {
    marginLeft: 12,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoTextBlack: {
    color: '#0f172a',
  },
  logoTextOrange: {
    color: '#f97316',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  vehicleCard: {
    backgroundColor: '#8b5cf6', // Un tono morado más atractivo
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    // Gradiente simulado con bordes
    borderLeftWidth: 4,
    borderLeftColor: '#9333ea',
    borderRightWidth: 1,
    borderRightColor: '#a855f7',
  },
  vehicleCardTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  vehicleText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  vehicleDescription: {
    color: 'white',
    fontSize: 15,
    opacity: 0.85,
    marginTop: 4,
    fontWeight: '400',
  },
  checklistCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  infoIcon: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#e0f2fe',
    padding: 6,
    borderRadius: 12,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  checkItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  statusIndicator: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusGood: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    borderLeftWidth: 2,
    borderLeftColor: '#16a34a',
  },
  statusRegular: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    borderLeftWidth: 2,
    borderLeftColor: '#d97706',
  },
  statusBad: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderLeftWidth: 2,
    borderLeftColor: '#dc2626',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginRight: 4,
  },
  observations: {
    marginTop: 20,
  },
  observationsLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#334155',
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    backgroundColor: '#f8fafc',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
    borderStyle: 'dashed',
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#166534',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sendButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: '#f43f5e',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end', // Modal desde abajo
    padding: 0,
    backdropFilter: 'blur(3px)', // Pseudo efecto de blur
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalOptionGood: {
    backgroundColor: '#22c55e',
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
  },
  modalOptionRegular: {
    backgroundColor: '#f59e0b',
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
  },
  modalOptionBad: {
    backgroundColor: '#ef4444',
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  modalOptionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalCancel: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 0,
    backgroundColor: '#f1f5f9',
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  modalCancelText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckList;