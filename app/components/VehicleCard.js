import React, { use } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ActionButton from "./ActionButton";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const VehicleCard = ({
  vehicle,
  onOpenModal,
  onApproveVehicle,
  onReturnVehicle,
  onRejectVehicle,
  onOpenModalCheckList,
}) => {

  useEffect(() => {
    // Aquí puedes realizar cualquier acción adicional cuando el componente se monta
    // Por ejemplo, puedes hacer una llamada a la API o configurar un temporizador
    console.log("VehicleCard mounted");
    return () => {
      // Aquí puedes limpiar cualquier recurso o cancelar suscripciones
      // cuando el componente se desmonta
      console.log("VehicleCard unmounted");
    };
  }, []);


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

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.carInfoContainer}>
            <View style={styles.carIconWrapper}>
              <Ionicons name="car-sport" size={30} color="#4527A0" />
            </View>
            <Text style={styles.carId}>{vehicle.licensePlate}</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.vehicleType}>{vehicle.type}</Text>
            <Text style={styles.vehicleModel}>
              {`${vehicle.markDescription} ${vehicle.model}`}
              <Text style={styles.year}> {vehicle.year}</Text>
            </Text>

            <View style={styles.assignmentContainer}>
              <Text style={styles.assignmentLabel}>Asignado el</Text>
              <Text style={styles.dateAssignment}>
                {vehicle.dateAssignment ? vehicle.dateAssignment : "sin fecha de asignación"}
              </Text>
            </View>
          </View>

          {vehicle.requiresChecklistDaily == "S" &&
            vehicle.approvalStatusAssignment=='A' && 
            vehicle.dateReturning == null && (
            //vehicle.displayChecklistButton && (
            <ActionButton
              title="Checklist"
              iconName="checklist-rtl"
              colors={["#FF8800", "#FF6600"]}
              onPress={handleCheckList}
            />
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <ActionButton
            title="Ver más "
            iconName="info"
            colors={["#4fa3db", "#137ac0"]}
            onPress={renderVehicleDetails}
          />

          <View style={styles.actionButtons}>
            {vehicle.approvalStatusAssignment =="A" && 
             vehicle.dateReturning == null && (
              <ActionButton
                title="Devolver"
                iconName="keyboard-return"
                colors={["#293e5d", "#17335C"]}
                onPress={() => onReturnVehicle(vehicle.id)}
              />
            )}

            {vehicle.approvalStatusAssignment=="P" && (
              <ActionButton
                title="Aprobar"
                iconName="check-circle"
                colors={["#4CAF50", "#2E7D32"]}
                onPress={handleApproveVehicle}
              />
            )}

            {vehicle.approvalStatusAssignment=="P" && (
              <ActionButton
                title="Rechazar"
                iconName="cancel"
                colors={["#F44336", "#D32F2F"]}
                onPress={handleRejectVehicle}
              />
            )}
          </View>
          
        </View>

        {vehicle.approvalStatusAssignment=="P" && (
          <View style={styles.approvalFlagContainer}>
            <LinearGradient
              colors={["rgba(244, 67, 54, 0.1)", "rgba(244, 67, 54, 0.05)"]}
              style={styles.approvalFlag}
            >
              <Text style={styles.requiresApproval}>Requiere aprobación</Text>
            </LinearGradient>
          </View>
        )}
        {vehicle.dateReturning && vehicle.dateReturning.trim() !== "" && (
          <View style={styles.returnInfoContainer}>
            <Ionicons name="sync-circle-outline" size={20} color={styles.returnInfoText.color} />
            <Text style={styles.returnInfoText}>
              Devuelto el: {vehicle.dateReturning} a las {vehicle.timeReturning || ''}
            </Text>
          </View>
        )}
        {vehicle.approvalStatusAssignment == "R" && (
          <View style={styles.approvalFlagContainer}>
            <LinearGradient
              colors={["rgba(244, 67, 54, 0.1)", "rgba(244, 67, 54, 0.05)"]}
              style={styles.approvalFlag}
            >
              <Text style={styles.rejected}>Solicitud rechazada</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEDF2",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2A3249",
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#673AB7",
    fontWeight: "500",
  },
  listContainer: {
    padding: 10,
  },
  cardContainer: {
    marginBottom: 13,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    padding: 10,
  },
  carInfoContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  carIconWrapper: {
    width: 60,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  carIcon: {
    width: 50,
    height: 30,
    resizeMode: "contain",
  },
  carId: {
    fontSize: 12,
    fontWeight: "700",
    color: "#424242",
    marginTop: 4,
  },
  mainInfo: {
    flex: 1,
    justifyContent: "center",
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: 15,
    color: "#424242",
    fontWeight: "500",
    marginBottom: 4,
  },
  year: {
    color: "#757575",
    fontWeight: "400",
  },
  assignmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  assignmentLabel: {
    fontSize: 12,
    color: "#757575",
    marginRight: 4,
  },
  assignmentDate: {
    fontSize: 12,
    color: "#424242",
    fontWeight: "600",
  },
  statusBadge: {
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 28,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 16,
  },

  viewMoreButton: {
    marginRight: 8,
  },
  viewMoreText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#FFFFFF",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

  },
    cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 13,
  },
  actionButton: {
    borderRadius: 5,
    overflow: "hidden",
    flex: 1,
  },
  marginRight: {
    marginRight: 8,
  },
  buttonContent: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
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
    color: "#F44336",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  rejected: {
    color: "#326fff",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    backgroundColor: "#e0f7fa",
    fontWeight: "500",
    textAlign: "center",
  },

  return: {
    color: "#326fff",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    backgroundColor: "#e0f7fa",
  },
  viewMoreButton: {
    backgroundColor: "#3498DB",
    borderRadius: 5,
    padding: 8,
    marginRight: 5,
    flexDirection: "row",
  },
  checkListContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkListText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#EAEDF2",
  },
  footerText: {
    fontSize: 12,
    color: "#60686c",
    textAlign: "center",
  },
  carIconWrapper: {
    width: 60,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  returnInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff', // Un verde pálido y moderno para "completado" o "información positiva"
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#c8e6c9', // Un borde verde más claro
    marginTop: -1, // Para solapar el divider si es necesario o ajustar espaciado
    marginBottom: 0, // Ajustar según sea necesario antes del footer
  },
   returnInfoText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#326fff', // Un verde oscuro para el texto, buena legibilidad
    fontWeight: '500',
  },
});

export default VehicleCard;