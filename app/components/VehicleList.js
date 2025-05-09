import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from 'react-native-vector-icons';
import MasInformacion from './MasInformacion';
import CheckList from '../checklist/index';
import ActionButton from './ActionButton'; 

// Componente para cada tarjeta de vehículo
const VehicleCard = ({ vehicle, onOpenModal, onApproveVehicle, onReturnVehicle, onRejectVehicle, onOpenModalCheckList }) => {
  // Determinar colores según el estado
  const getStatusData = () => {
    switch(vehicle.status) {
      case 'checklist':
        return {
          color: '#FF8800',
          gradientColors: ['#d79447', '#ff6600'],
          text: 'Checklist'
        };
        case 'approval':
        return {
          color: '#4CAF50',
          gradientColors: ['#4CAF50', '#2E7D32'],
          text: 'Aprobación'
        };
      default:
        return {
          color: '#673AB7',
          gradientColors: ['#673AB7', '#4527A0'],
          text: 'Estándar'
        };
    }
  };

  // Determinar ícono de carro según color
  const getCarIcon = () => {
    switch(vehicle.color) {
      case 'red':
        return require('../../assets/images/car-red.jpg');
      case 'blue':
        return require('../../assets/images/car-blue.png');
      default:
        return require('../../assets/images/car-default.jpg');
    }
  };

  const renderVehicleDetails = () => {
    onOpenModal(vehicle);
  };

  const handleApproveVehicle = () => {
    onApproveVehicle(vehicle.id);
  };

  const handleReturnVehicle = () => {
    onReturnVehicle(vehicle.id);
  };
  
  const handleRejectVehicle = () => {
    onRejectVehicle(vehicle.id);
  };

  const handleCheckList = () => {
    onOpenModalCheckList(vehicle);
  };

  const statusData = getStatusData();

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.carInfoContainer}>
            <View style={styles.carIconWrapper}>
              <Image source={getCarIcon()} style={styles.carIcon} />
            </View>
            <Text style={styles.carId}>{vehicle.id}</Text>
          </View>
          
          <View style={styles.mainInfo}>
            <Text style={styles.vehicleType}>{vehicle.type}</Text>
            <Text style={styles.vehicleModel}>
              {`${vehicle.brand} ${vehicle.model}`}
              <Text style={styles.year}> {vehicle.year}</Text>
            </Text>
            
            {vehicle.assignmentDate && (
              <View style={styles.assignmentContainer}>
                <Text style={styles.assignmentLabel}>Asignado el</Text>
                <Text style={styles.assignmentDate}>{vehicle.assignmentDate}</Text>
              </View>
            )}
          </View>

          {vehicle.status === 'checklist' && (
            <ActionButton
              title="Checklist"
              iconName="checklist-rtl"
              colors={['#FF8800', '#FF6600']}
              onPress={handleCheckList}
            />

          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <ActionButton
            title="Ver más  "
            iconName="info"
            colors={['#4fa3db', '#137ac0']}
            onPress={renderVehicleDetails}
          />

          <View style={styles.actionButtons}>
            {vehicle.actions.includes('return') && (
              <ActionButton 
                title="Devolver"
                iconName="keyboard-return"
                colors={['#673AB7', '#4527A0']}
                onPress={() => onReturnVehicle(vehicle.id)}
              />
            )}
            
            {vehicle.actions.includes('approve') && (
              <ActionButton
                title="Aprobar"
                iconName="check-circle"
                colors={['#4CAF50', '#2E7D32']}
                onPress={handleApproveVehicle}
              />
            )}
            
            {vehicle.actions.includes('reject') && (
              <ActionButton
                title="Rechazar"
                iconName="cancel"
                colors={['#F44336', '#D32F2F']}
                onPress={handleRejectVehicle}
              />
            )}
          </View>
        </View>
        
        {vehicle.status === 'approval' && (
          <View style={styles.approvalFlagContainer}>
            <LinearGradient
              colors={['rgba(244, 67, 54, 0.1)', 'rgba(244, 67, 54, 0.05)']}
              style={styles.approvalFlag}
            >
              <Text style={styles.requiresApproval}>Requiere aprobación</Text>
            </LinearGradient>
          </View>
        )}

        {vehicle.status === 'rejected' && (
          <View style={styles.approvalFlagContainer}>
            <LinearGradient
              colors={['rgba(244, 67, 54, 0.1)', 'rgba(244, 67, 54, 0.05)']}
              style={styles.approvalFlag}
            >
              <Text style={styles.rejected}>Solicitud rechazada</Text>
            </LinearGradient>
          </View>
        )}

        {vehicle.status === 'return' && (
          <View style={styles.approvalFlagContainer}>
            <LinearGradient
              colors={['rgba(93, 142, 255, 0.1)', 'rgba(35, 54, 255, 0.05)']}
              style={styles.approvalFlag}
            >
              <Text style={styles.return}>En proceso de devolución</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
};

// Componente principal
const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalVisibleCheckList, setModalVisibleCheckList] = useState(false);

  useEffect(() => {
    // Simular carga de datos desde API
    const loadData = async () => {
      try {
        // Simulando tiempo de carga
        setTimeout(() => {
          // Utilizamos los datos del archivo local
          const data = require('../../data/vehicles.json');
          setVehicles(data.vehicles);
          setLoading(false);
        }, 500); // Tiempo de espera simulado
      } catch (error) {
        console.error('Error al cargar los vehículos:', error);
        setLoading(false);
      }
    };
  
    loadData();
  }, []);
  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalVisible(true);
  };

  const onOpenModalCheckList = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalVisibleCheckList(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedVehicle(null);
  };

  const closeModalCheckList = () => {
    setModalVisibleCheckList(false);
    setSelectedVehicle(null);
  };

  // Función para rechazar un vehículo
  const rejectVehicle = (vehicleId) => {
    // Buscar y actualizar el vehículo en el estado
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === vehicleId && vehicle.status === 'approval') {
        // Eliminar las acciones de aprobar y rechazar
        let newActions = vehicle.actions.filter(action => action !== 'approve' && action !== 'reject');
        
        return {
          ...vehicle,
          status: 'rejected',
          actions: newActions
        };
      }
      return vehicle;
    });

    // Actualizar el estado con los vehículos modificados
    setVehicles(updatedVehicles);
    
    // Si el vehículo seleccionado es el que se está rechazando, actualizar también ese estado
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      let newActions = selectedVehicle.actions.filter(action => action !== 'approve' && action !== 'reject');
      
      setSelectedVehicle({
        ...selectedVehicle,
        status: 'rejected',
        actions: newActions
      });
    }

    // Mostrar confirmación al usuario
    Alert.alert(
      "Vehículo rechazado",
      `La solicitud para el vehículo ${vehicleId} ha sido rechazada.`,
      [{ text: "OK" }]
    );
  };

  // Función para devolver un vehículo (cambiar su estado a "return")
  const returnVehicle = (vehicleId) => {
    // Buscar y actualizar el vehículo en el estado
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === vehicleId && vehicle.status === 'checklist') {
        // Remover la acción 'return' ya que ahora el vehículo está en proceso de devolución
        let newActions = vehicle.actions.filter(action => action !== 'return');
        
        return {
          ...vehicle,
          status: 'return',
          actions: newActions
        };
      }
      return vehicle;
    });

    // Actualizar el estado con los vehículos modificados
    setVehicles(updatedVehicles);
    
    // Si el vehículo seleccionado es el que se está devolviendo, actualizar también ese estado
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      let newActions = selectedVehicle.actions.filter(action => action !== 'return');
      
      setSelectedVehicle({
        ...selectedVehicle,
        status: 'return',
        actions: newActions
      });
    }

    // Mostrar confirmación al usuario
    Alert.alert(
      "Vehículo en devolución",
      `El vehículo ${vehicleId} ha iniciado el proceso de devolución.`,
      [{ text: "OK" }]
    );
  };

  // Función modificada para aprobar un vehículo y añadir la acción "return"
  const approveVehicle = (vehicleId) => {
    // Buscar y actualizar el vehículo en el estado
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.id === vehicleId && vehicle.status === 'approval') {
        // Crear una copia con el estado actualizado
        // Incluimos explícitamente 'return' en el array de acciones
        // Primero quitamos 'approve' y 'reject', y luego aseguramos que 'return' esté presente
        let newActions = vehicle.actions.filter(action => action !== 'approve' && action !== 'reject');
        
        // Añadir 'return' solo si no existe ya
        if (!newActions.includes('return')) {
          newActions.push('return');
        }
        
        return {
          ...vehicle,
          status: 'checklist',
          actions: newActions
        };
      }
      return vehicle;
    });

    // Actualizar el estado con los vehículos modificados
    setVehicles(updatedVehicles);
    
    // Si el vehículo seleccionado es el que se está aprobando, actualizar también ese estado
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      let newActions = selectedVehicle.actions.filter(action => action !== 'approve' && action !== 'reject');
      
      // Añadir 'return' solo si no existe ya
      if (!newActions.includes('return')) {
        newActions.push('return');
      }
      
      setSelectedVehicle({
        ...selectedVehicle,
        status: 'checklist',
        actions: newActions
      });
    }

    // Mostrar confirmación al usuario
    Alert.alert(
      "Vehículo aprobado",
      `El vehículo ${vehicleId} ha sido aprobado y ahora está en estado de checklist.`,
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#673AB7" />
        <Text style={styles.loadingText}>Cargando vehículos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.header}>
        <Ionicons name="car-sport" size={24} color="#4A6FE3" />
        <Text style={styles.headerTitle}>Mis Vehículos</Text>
      </View>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VehicleCard 
            vehicle={item} 
            onOpenModal={openModal} 
            onOpenModalCheckList={onOpenModalCheckList}
            onApproveVehicle={approveVehicle}
            onReturnVehicle={returnVehicle}
            onRejectVehicle={rejectVehicle}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <MasInformacion 
          vehicle={selectedVehicle} 
          onClose={closeModal} 
          onApprove={approveVehicle}
          onReturn={returnVehicle}
          onReject={rejectVehicle}
        />
      </Modal>
      <Modal 
        visible={modalVisibleCheckList}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModalCheckList}
      >
        <CheckList
          vehicle={selectedVehicle}
          onApprove={approveVehicle}
        />
      </Modal>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Una solución de Controla Gestión</Text>
        <Text style={styles.footerText}>Todos los derechos reservados</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDF2',

  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A3249',
    marginLeft: 12,
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: '#4A6FE3',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#673AB7',
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
  },
  cardContainer: {
    marginBottom: 13,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 10,
  },
  carInfoContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  carIconWrapper: {
    width: 60,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  carIcon: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
  },
  carId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
    marginTop: 4,
  },
  mainInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: 15,
    color: '#424242',
    fontWeight: '500',
    marginBottom: 4,
  },
  year: {
    color: '#757575',
    fontWeight: '400',
  },
  assignmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  assignmentLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 4,
  },
  assignmentDate: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 13,
  },
  viewMoreButton: {
    marginRight: 8,
  },
  viewMoreText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  marginRight: {
    marginRight: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  approvalFlagContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  approvalFlag: {
    borderRadius: 20,
    padding: 8,
  },
  requiresApproval: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  rejected: {
    color: '#326fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: '#e0f7fa',
    fontWeight: '500',
    textAlign: 'center',
  },

  return: {
    color: '#326fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: '#e0f7fa',
  },
  viewMoreButton: {
    backgroundColor: '#3498DB',
    borderRadius: 5,
    padding: 8,
    marginRight: 5,
    flexDirection: 'row',
  },
  checkListContainer: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  checkListText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#EAEDF2',
  },
  footerText: {
    fontSize: 12,
    color: '#60686c',
    textAlign: 'center',
  },
});

export default VehicleList;