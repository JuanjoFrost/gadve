import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ActionButton from "./ActionButton";
import { Ionicons } from "@expo/vector-icons";

const VehicleCard = ({
  vehicle,
  onOpenModal,
  onApproveVehicle,
  onReturnVehicle,
  onRejectVehicle,
  onOpenModalCheckList,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log("VehicleCard mounted for vehicle:", vehicle.licensePlate);
    console.log("Vehicle image URL:", vehicle.fileUrlVehicleImage); // ✅ Debug log
    return () => {
      console.log("VehicleCard unmounted for vehicle:", vehicle.licensePlate);
    };
  }, [vehicle.licensePlate]);

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

  // ✅ AGREGAR: Función para manejar errores de imagen
  const handleImageError = () => {
    console.log("Error loading vehicle image:", vehicle.fileUrlVehicleImage);
    setImageError(true);
  };

  // ✅ AGREGAR: Función para cuando la imagen se carga exitosamente
  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {/* ✅ CAMBIO: Reemplazar ícono con imagen real del vehículo */}
          <View style={styles.carInfoContainer}>
            <View style={styles.vehicleImageWrapper}>
              {vehicle.fileUrlVehicleImage && !imageError ? (
                <Image
                  source={{ uri: vehicle.fileUrlVehicleImage }}
                  style={styles.vehicleImage}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  resizeMode="cover"
                />
              ) : (
                // ✅ Fallback: Mostrar ícono si no hay imagen o hay error
                <View style={styles.carIconWrapper}>
                  <Ionicons name="car-sport" size={30} color="#4527A0" />
                </View>
              )}
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
                {vehicle.dateAssignment
                  ? vehicle.dateAssignment
                  : "sin fecha de asignación"}
              </Text>
            </View>
          </View>

          {vehicle.requiresChecklistDaily == "S" &&
            vehicle.approvalStatusAssignment == "A" &&
            vehicle.dateReturning == null &&
            vehicle.displayChecklistButton && (
              <ActionButton
                title={vehicle.IdChecklistToday ? "Check listo" : "Hacer Check"}
                iconName={
                  vehicle.IdChecklistToday ? "" : "checklist-rtl"
                }
                
                colors={
                  vehicle.IdChecklistToday
                    ? ["#10b981", "#059669"] // Verde para completado
                    : ["#FF8800", "#FF6600"] // Naranja para pendiente
                }
                onPress={handleCheckList}
                disabled={vehicle.IdChecklistToday ? true : false}
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
            {vehicle.approvalStatusAssignment == "A" &&
              vehicle.dateReturning == null && (
                <ActionButton
                  title="Devolver"
                  iconName="keyboard-return"

                  colors={["#293e5d", "#17335C"]}
                  onPress={() => onReturnVehicle(vehicle.id)}
                />
              )}

            {vehicle.approvalStatusAssignment == "P" && (
              <ActionButton
                title="Aprobar"
                iconName="checkmark-circle"
                iconType="Ionicons"
                colors={["#4CAF50", "#2E7D32"]}
                onPress={handleApproveVehicle}
              />
            )}

            {vehicle.approvalStatusAssignment == "P" && (
              <ActionButton
                title="Rechazar"
                iconName="close-circle"
                iconType="Ionicons"
                colors={["#F44336", "#D32F2F"]}
                onPress={handleRejectVehicle}
              />
            )}
          </View>
        </View>

        {vehicle.approvalStatusAssignment == "P" && (
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
            <Ionicons
              name="sync-circle-outline"
              size={20}
              color="#326fff"
            />
            <Text style={styles.returnInfoText}>
              En proceso de devolución {vehicle.dateReturning} a las{" "}
              {vehicle.timeReturning || ""}
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
  dateAssignment: { // ✅ CORREGIDO: Nombre del estilo
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
    color: "#F44336",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  returnInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#c8e6c9",
    marginTop: -1,
    marginBottom: 0,
  },
  returnInfoText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#326fff",
    fontWeight: "500",
  },

  // ✅ AGREGAR: Estilos para la imagen del vehículo
  vehicleImageWrapper: {
    width: 60,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5", // Color de fondo mientras carga
  },
});

export default VehicleCard;
