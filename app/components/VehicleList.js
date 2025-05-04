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
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from 'react-native-vector-icons';
// Componente para cada tarjeta de vehículo
const VehicleCard = ({ vehicle }) => {
  // Determinar colores según el estado
  const getStatusData = () => {
    switch(vehicle.status) {
      case 'checklist':
        return {
          color: '#FF8800',
          gradientColors: ['#FF8800', '#FF6600'],
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
            <LinearGradient
              colors={statusData.gradientColors}
              style={styles.statusBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              
              <Text style={styles.statusText}>{statusData.text}</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.viewMoreButton}>
            <MaterialIcons name="info" size={16} color="#FFF" />
            <Text style={[styles.viewMoreText]}> Información</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            {vehicle.actions.includes('return') && (
              <LinearGradient
                colors={['#673AB7', '#4527A0']}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity style={styles.buttonContent}>
                  <MaterialIcons name="keyboard-return" size={16} color="#FFF" />
                  <Text style={styles.buttonText}> Devolver</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            
            {vehicle.actions.includes('approve') && (
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={[styles.actionButton, styles.marginRight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity style={styles.buttonContent}>
                  <MaterialIcons name="check-circle" size={16} color="#FFF" />
                  <Text style={styles.buttonText}> Aprobar</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
            
            {vehicle.actions.includes('reject') && (
              <LinearGradient
                colors={['#F44336', '#C62828']}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity style={styles.buttonContent}>
                  <MaterialIcons name="cancel" size={16} color="#FFF" />
                  <Text style={styles.buttonText}> Rechazar</Text>
                </TouchableOpacity>
              </LinearGradient>
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

        {vehicle.status === 'return' && (
          <View style={styles.approvalFlagContainer}>
            <LinearGradient
              colors={['rgba(244, 67, 54, 0.1)', 'rgba(244, 67, 54, 0.05)']}
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
        }, 500);
      } catch (error) {
        console.error('Error al cargar los vehículos:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        renderItem={({ item }) => <VehicleCard vehicle={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    padding: 16,
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
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
    padding: 16,
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
    paddingHorizontal: 16,
    paddingBottom: 12,
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
});

export default VehicleList;