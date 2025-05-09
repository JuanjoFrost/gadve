import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const MasInformacion = ({ vehicle, onClose, onApprove }) => {
  if (!vehicle) return null;

  // Determinar si el vehículo está asignado
  const isAssigned = vehicle.status === 'assigned';
  const isReturn = vehicle.status === 'return';
  const isApproval = vehicle.status === 'approval';
  const isChecklist = vehicle.status === 'checklist';

  const openPermisoCirculacion = () => {
    Linking.openURL('https://res.cloudinary.com/safelemon/image/upload/w_1440/blog/mfujcvc1signwubopcm7'); // URL del documento de permiso de circulación
  };

  const openRevisionTecnica = () => {
    Linking.openURL('https://static.retail.autofact.cl/blog/c_url_original.9n8loyqvqs3.jpg'); // URL del documento de revisión técnica
  };

  const openRevisionGases = () => {
    Linking.openURL('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuCdAq4UBR2P6yqLQJDavk0E-8irc1Fvr_oQ&s'); // URL del documento de revisión de gases
  };

  // Función para manejar la aprobación desde el modal
  const handleApprove = () => {
    if (onApprove) {
      onApprove(vehicle.id);
      
      // Puedes mostrar una alerta aquí también o dejar que el componente padre la maneje
      Alert.alert(
        "Vehículo aprobado",
        `El vehículo ${vehicle.id} ha sido aprobado y ahora está en estado de checklist.`,
        [
          { 
            text: "OK", 
            onPress: onClose // Cerrar el modal después de la aprobación
          }
        ]
      );
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {/* Encabezado con ícono y título */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/car-red.jpg')} // Cambia según el color del vehículo
            style={styles.carIcon}
          />
          <View>
            <Text style={styles.vehicleId}>{vehicle.id}</Text>
            <Text style={styles.vehicleType}>{vehicle.type}</Text>
            <Text style={styles.vehicleDetails}>
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </Text>
          </View>
        </View>

        {/* Estado actual del vehículo */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Estado actual:</Text>
          <Text style={[
            styles.statusValue,
            isApproval ? styles.statusApproval : 
            isChecklist ? styles.statusChecklist : 
            isReturn ? styles.statusReturn : styles.statusNormal
          ]}>
            {isApproval ? 'Requiere aprobación' : 
             isChecklist ? 'Checklist pendiente' : 
             isReturn ? 'En devolución' : 'Normal'}
          </Text>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <FontAwesome5 name="info-circle" size={20} color="#4A6FE3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>Código: {vehicle.id}</Text>
            <Text style={styles.infoText}>Motor: {vehicle.engine}</Text>
            <Text style={styles.infoText}>Chasis: {vehicle.chassis}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="folder" size={20} color="#4A6FE3" />
          <View style={styles.infoContent}>
            <TouchableOpacity onPress={openPermisoCirculacion}>
              <Text style={styles.textLink}>Permiso circulación: 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openRevisionTecnica}>
              <Text style={styles.textLink}>Revisión técnica: 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openRevisionGases}>
              <Text style={styles.textLink}>Revisión gases: 2025</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="assignment" size={20} color="#4A6FE3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>Asignado el: 05-03-2025 15:31</Text>
            <Text style={styles.infoText}>Centro costo: 02 - área central</Text>
            <Text style={styles.infoText}>Tarifa: 01 - bronce, 500 hora 8.000 día</Text>
          </View>
        </View>

        {!isReturn && (
          <View style={styles.actionButtons}>
            {isApproval && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={handleApprove}
                >
                  <MaterialIcons name="check-circle" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
                  <MaterialIcons name="cancel" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>
              </>
            )}
            {isChecklist && (
              <>
                <TouchableOpacity style={[styles.actionButton, styles.returnButton]}>
                  <MaterialIcons name="keyboard-return" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Devolver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.checklistButton]}>
                  <FontAwesome5 name="clipboard-check" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Checklist</Text>
                </TouchableOpacity>
              </>
            )}
            {!isApproval && !isChecklist && !isAssigned && (
              <>
                <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
                  <MaterialIcons name="check-circle" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
                  <MaterialIcons name="cancel" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>
              </>
            )}
            {!isApproval && !isChecklist && (
              <>
                <TouchableOpacity style={[styles.actionButton, styles.returnButton]}>
                  <MaterialIcons name="keyboard-return" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Devolver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.checklistButton]}>
                  <FontAwesome5 name="clipboard-check" size={16} color="#FFF" />
                  <Text style={styles.buttonText}>Checklist</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Botón para cerrar */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={16} color="#FFF" />
            <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#4A6FE3',
    padding: 10,
    borderRadius: 10,
    width: '100%',
  },
  carIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  vehicleId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  vehicleType: {
    fontSize: 16,
    color: '#FFF',
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#FFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusApproval: {
    color: '#F44336',
  },
  statusChecklist: {
    color: '#FF8800',
  },
  statusReturn: {
    color: '#326fff',
  },
  statusNormal: {
    color: '#4A4A4A',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  infoContent: {
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '48%',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  returnButton: {
    backgroundColor: '#673AB7',
  },
  checklistButton: {
    backgroundColor: '#FF8800',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4A6FE3',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  textLink: {
    color: '#4A6FE3',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
});

export default MasInformacion;