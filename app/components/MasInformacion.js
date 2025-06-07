import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import ActionButton from "./ActionButton";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "./logo";
import { getDetalleAsignacion, postChecklistVehiculo } from "../api/urls";

const materialColors = {
  primary: "#4A6FE3",
  accent: "#FFAB00",
  textPrimary: "rgba(0, 0, 0, 0.87)",
  textSecondary: "rgba(0, 0, 0, 0.54)",
  divider: "rgba(0, 0, 0, 0.12)",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  error: "#B00020",
  success: "#4CAF50",
  warning: "#FF9800",
  infoBlue: "#2196F3",
  lightGreyBackground: "#F5F5F5",
};

const MasInformacion = ({
  vehicle,
  onClose,
  onReturn,
  onApprove,
  onOpenModalCheckList,
  apiBase,
  apiKey,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // State for getVehiculo
  const [fetchedVehicleDetails, setFetchedVehicleDetails] = useState(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [fetchVehicleError, setFetchVehicleError] = useState(null);

  // State for getDetalleAsignacion
  const [fetchedAssignmentDetails, setFetchedAssignmentDetails] =
    useState(null);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);
  const [fetchAssignmentError, setFetchAssignmentError] = useState(null);

  // useEffect for getDetalleAsignacion
  useEffect(() => {
    // Assuming vehicle object has an 'assignmentId' or similar field for ID_ASSIGNMENT
    // Adjust 'vehicle.assignmentId' if your field name is different
    if (vehicle) {
      const loadAssignmentDetails = async () => {
        setIsLoadingAssignment(true);
        setFetchAssignmentError(null);
        try {
          console.log(`Fetching assignment details for ID: ${vehicle.id}`);
          const data = await getDetalleAsignacion({
            apiBase,
            apiKey,
            idAssignment: vehicle.id,
          });
          console.log("Fetched Assignment Details:", data); // Log the fetched data
          setFetchedAssignmentDetails(data);
        } catch (error) {
          console.error("Error fetching assignment details:", error);
          setFetchAssignmentError(
            error.message || "Error al cargar detalles de la asignación."
          );
        } finally {
          setIsLoadingAssignment(false);
        }
      };
      loadAssignmentDetails();
    }
  }, [vehicle, vehicle?.assignmentId, apiBase, apiKey]); // Re-run if these change

  if (!isVisible) {
    return null;
  }

  const displayVehicle = fetchedVehicleDetails || vehicle;

  if (!displayVehicle) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.pageHeader}>
          <Logo style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Más Información</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setIsVisible(false);
              onClose();
            }}
          >
            <MaterialIcons
              name="close"
              size={24}
              color={materialColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredMessage}>
          {(isLoadingVehicle || isLoadingAssignment) && (
            <ActivityIndicator size="large" color={materialColors.primary} />
          )}
          {fetchVehicleError && (
            <Text style={styles.errorText}>{fetchVehicleError}</Text>
          )}
          {fetchAssignmentError && (
            <Text style={styles.errorText}>{fetchAssignmentError}</Text>
          )}
          {!isLoadingVehicle &&
            !isLoadingAssignment &&
            !fetchVehicleError &&
            !fetchAssignmentError && (
              <Text>No hay información disponible.</Text>
            )}
        </View>
      </View>
    );
  }

  const isAssigned = displayVehicle.status === "assigned";
  const isReturn = displayVehicle.status === "return";
  // Use displayVehicle.approvalStatusAssignment for consistency if API returns this
  const isApproval =
    displayVehicle.approvalStatusAssignment === "P" ||
    displayVehicle.status === "approval";
  const isChecklist =
    displayVehicle.approvalStatusAssignment === "A" ||
    displayVehicle.status === "checklist";

  const handleApprove = () => {
    onApprove(displayVehicle.id);
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.pageHeader}>
        <Logo style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Más Información</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setIsVisible(false);
            onClose();
          }}
        >
          <MaterialIcons
            name="close"
            size={24}
            color={materialColors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentArea}>
        <View style={styles.mainContentContainer}>
          {(isLoadingVehicle && !fetchedVehicleDetails) ||
            (isLoadingAssignment && !fetchedAssignmentDetails && (
              <View style={styles.centeredMessage}>
                <ActivityIndicator
                  size="large"
                  color={materialColors.primary}
                />
                <Text
                  style={{ marginTop: 10, color: materialColors.textSecondary }}
                >
                  Cargando detalles...
                </Text>
              </View>
            ))}
          {fetchVehicleError && (
            <View style={styles.centeredMessage}>
              <Text style={styles.errorText}>{fetchVehicleError}</Text>
            </View>
          )}
          {fetchAssignmentError && (
            <View style={styles.centeredMessage}>
              <Text style={styles.errorText}>{fetchAssignmentError}</Text>
            </View>
          )}

          {/* Vehicle Specific Header */}
          <LinearGradient
            colors={["#293e5d", "#17335C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vehicleSpecificHeader}
          >
            <View style={styles.carIcon}>
              <Ionicons name="car-sport" size={40} color="#fff" />
            </View>
            <View>
              <Text style={styles.vehicleId}>
                {displayVehicle.licensePlate}
              </Text>
              <Text style={styles.vehicleType}>{displayVehicle.type}</Text>
              <Text style={styles.vehicleDetails}>
                {displayVehicle.markDescription} {displayVehicle.model}{" "}
                {displayVehicle.year}
              </Text>
            </View>
          </LinearGradient>

          {/* Status Container */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Estado actual:</Text>
            {displayVehicle.approvalStatusAssignment == "P" ? (
              <Text style={[styles.statusValue, styles.statusApproval]}>
                Pendiente
              </Text>
            ) : displayVehicle.approvalStatusAssignment == "A" &&
              displayVehicle.dateReturning == null ? (
              <Text style={[styles.statusValue, styles.statusChecklist]}>
                Aprobado
              </Text>
            ) : displayVehicle.approvalStatusAssignment == "R" ? (
              <Text style={[styles.statusValue, styles.statusReturn]}>
                Rechazado
              </Text>
            ) : displayVehicle.dateReturning != null ? (
              <Text style={[styles.statusValue, styles.statusReturn]}>
                Devuelto el: {displayVehicle.dateReturning}
              </Text>
            ) : (
              <Text style={[styles.statusValue, styles.statusNormal]}>
                {displayVehicle.statusDescription || "Normal"}
              </Text>
            )}
          </View>

          {/* Info Cards */}
          <View style={styles.infoCard}>
            <FontAwesome5
              name="info-circle"
              size={20}
              color={materialColors.primary}
              style={styles.infoCardIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                <Text style={styles.infoTextLabel}>Código:</Text>{" "}
                {displayVehicle.vehicleId}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoTextLabel}>Motor:</Text>{" "}
                {displayVehicle.motorNumber}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoTextLabel}>Chasis:</Text>{" "}
                {displayVehicle.chasisNumber}
              </Text>
              {/* You can display fetchedAssignmentDetails here if needed */}
              {/* Example:
              {fetchedAssignmentDetails && (
                <Text style={styles.infoText}><Text style={styles.infoTextLabel}>Detalle Asignación:</Text> {fetchedAssignmentDetails.someField}</Text>
              )}
              */}
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons
              name="folder"
              size={20}
              color={materialColors.primary}
              style={styles.infoCardIcon}
            />
            <View style={styles.infoContent}>
              {isLoadingAssignment ? (
                <Text style={styles.infoText}>Cargando adjuntos...</Text>
              ) : fetchedAssignmentDetails &&
                fetchedAssignmentDetails.Data &&
                fetchedAssignmentDetails.Data.length > 0 &&
                fetchedAssignmentDetails.Data[0].Attachments &&
                fetchedAssignmentDetails.Data[0].Attachments.length > 0 ? (
                <ScrollView
                  style={styles.attachmentsScrollView}
                  nestedScrollEnabled={true} // Add this prop
                >
                  {fetchedAssignmentDetails.Data[0].Attachments.map(
                    (attachment, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          if (attachment.url) {
                            WebBrowser.openBrowserAsync(attachment.url).catch(
                              () =>
                                Alert.alert(
                                  "Error",
                                  "No se pudo abrir el adjunto."
                                )
                            );
                          } else {
                            Alert.alert(
                              "Información",
                              `Adjunto: ${
                                attachment.File_name ||
                                attachment.Fie_attachment ||
                                "Adjunto " + (index + 1)
                              }`
                            );
                          }
                        }}
                      >
                        <Text style={styles.textLink}>
                          {attachment.File_name ||
                            attachment.Fie_attachment ||
                            `Adjunto ${index + 1}`}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              ) : (
                <Text style={styles.infoText}>
                  No hay adjuntos disponibles.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons
              name="assignment"
              size={20}
              color={materialColors.primary}
              style={styles.infoCardIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                <Text style={styles.infoTextLabel}>Asignado el:</Text>{" "}
                {displayVehicle.dateAssignment || "N/A"}
                <Text style={styles.infoTextLabel}>
                  {"\n"}Posible devolución el día:</Text>{" "}
                {displayVehicle.possibleDateReturn || "N/A"} a las{" "}
                {displayVehicle.possibleTimeReturn || "N/A"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoTextLabel}>Centro de costo:</Text>{" "}
                {displayVehicle.costcenterCode || "N/A"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoTextLabel}>
                  {displayVehicle.rateCode || "Tarifa"} -{" "}
                  {displayVehicle.rateName || "N/A"}
                </Text>{" "}
                precio por hora: {displayVehicle.hourlyPrice || "N/A"} precio
                por día: {displayVehicle.dailyPrice || "N/A"}
              </Text>
            </View>
          </View>

          {/* Action Buttons Section */}
          {!isReturn && (
            <View style={styles.actionButtonsSection}>
              {isApproval && (
                <>
                  <View style={styles.actionButtonContainer}>
                    <ActionButton
                      title={"Aprobar"}
                      iconName="check-circle"
                      colors={[materialColors.success, materialColors.success]}
                      onPress={handleApprove}
                    />
                  </View>
                  <View style={styles.actionButtonContainer}>
                    <ActionButton
                      title={"Rechazar"}
                      iconName="cancel"
                      colors={[materialColors.error, materialColors.error]}
                      onPress={() =>
                        Alert.alert("Rechazar", "Acción de rechazar")
                      }
                    />
                  </View>
                </>
              )}
              {isChecklist && (
                <>
                  {displayVehicle.requiresChecklistDaily === "S" &&
                    displayVehicle.approvalStatusAssignment == "A" &&
                    displayVehicle.dateReturning == null && 
                    displayVehicle.displayChecklistButton && (
                      <View style={styles.actionButtonContainer}>
                        <ActionButton
                          title={"Checklist"}
                          iconName="checklist-rtl"
                          colors={[
                            materialColors.warning,
                            materialColors.warning,
                          ]}
                          onPress={onOpenModalCheckList}
                        />
                      </View>
                    )}
                  {displayVehicle.dateReturning == null && (
                    <View style={styles.actionButtonContainer}>
                      <ActionButton
                        title={"Devolver"}
                        iconName="keyboard-return"
                        colors={[
                          materialColors.infoBlue,
                          materialColors.infoBlue,
                        ]}
                        onPress={() => onReturn(displayVehicle.id)}
                      />
                    </View>
                  )}
                </>
              )}
              {!isApproval && !isChecklist && !isAssigned && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                  >
                    <MaterialIcons name="check-circle" size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>Aprobar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                  >
                    <MaterialIcons name="cancel" size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>Rechazar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: materialColors.background,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    paddingBottom: 16,
    backgroundColor: materialColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: materialColors.divider,
  },
  headerIcon: {
    width: 100,
    height: 32,
  },
  headerTitle: {
    // Added style for the title in the header
    fontSize: 18,
    fontWeight: "500",
    color: materialColors.textPrimary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 24,
  },
  contentArea: {
    flex: 1,
  },
  mainContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: materialColors.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  vehicleSpecificHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  vehicleId: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  vehicleType: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.87)",
  },
  vehicleDetails: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.70)",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: materialColors.lightGreyBackground,
    borderRadius: 4,
    width: "100%",
  },
  statusLabel: {
    fontSize: 14,
    color: materialColors.textSecondary,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusApproval: {
    color: materialColors.error,
  },
  statusChecklist: {
    color: materialColors.success,
  },
  statusReturn: {
    color: materialColors.infoBlue,
  },
  statusNormal: {
    color: materialColors.textPrimary,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: materialColors.surface,
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: materialColors.divider,
    width: "100%",
  },
  infoCardIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: materialColors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  infoTextLabel: {
    fontWeight: "500",
    color: materialColors.textSecondary,
  },
  actionButtonsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: materialColors.divider,
    width: "100%",
  },
  actionButtonContainer: {
    marginLeft: 8,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 88,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
    textTransform: "uppercase",
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: materialColors.success,
  },
  rejectButton: {
    backgroundColor: materialColors.error,
  },
  returnButton: {
    backgroundColor: materialColors.infoBlue,
  },
  checklistButton: {
    backgroundColor: materialColors.warning,
  },
  textLink: {
    color: materialColors.primary,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 6,
  },
  pageFooter: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: materialColors.lightGreyBackground,
    borderTopWidth: 1,
    borderTopColor: materialColors.divider,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
  },
  footerText: {
    fontSize: 12,
    color: materialColors.textSecondary,
  },
  attachmentsScrollView: {
    maxHeight: 100,
  },
  carIcon: {
    width: 50,
    height: 50,
    marginRight: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", 
  },
});

export default MasInformacion;
