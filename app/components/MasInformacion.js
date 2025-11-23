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
  Image, 
} from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import ActionButton from "./ActionButton";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "./logo";
import { getDetalleAsignacion, getVehiculo } from "../api/urls";
//import * as FileSystem from "expo-file-system";
//import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";

const DOWNLOADS_URI_KEY = "DOWNLOADS_URI_SAF";

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
  onReject,
  onOpenModalCheckList,
  apiBase,
  apiKey,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [imageError, setImageError] = useState(false); 

  // State for getVehiculo
  const [fetchedVehicleDetails, setFetchedVehicleDetails] = useState(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [fetchVehicleError, setFetchVehicleError] = useState(null);

  // State for getDetalleAsignacion
  const [fetchedAssignmentDetails, setFetchedAssignmentDetails] = useState(null);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);
  const [fetchAssignmentError, setFetchAssignmentError] = useState(null);

  // useEffect for getDetalleAsignacion
  useEffect(() => {
    if (vehicle && vehicle.id) {
      const loadAssignmentDetails = async () => {
        setIsLoadingAssignment(true);
        setFetchAssignmentError(null);
        try {
          const data = await getDetalleAsignacion({
            apiBase,
            apiKey,
            idAssignment: vehicle.id,
          });
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
  }, [vehicle, apiBase, apiKey]);

  // useEffect para obtener detalles del vehículo
  useEffect(() => {
    if (vehicle && vehicle.vehicleId) {
      const loadVehicleDetails = async () => {
        setIsLoadingVehicle(true);
        setFetchVehicleError(null);
        try {
          const data = await getVehiculo({
            apiBase,
            apiKey,
            idVehiculo: vehicle.vehicleId,
          });
          if (data && data.Data && data.Data.length > 0) {
            const apiVehicleData = data.Data[0];
            //Revisar si Attachments está presente en el nivel superior
            setFetchedVehicleDetails({
              ...(vehicle || {}), // emplieza con los datos del vehículo original
              ...apiVehicleData,  // mezcla los datos obtenidos de la API
            });
          } else {
            setFetchedVehicleDetails(null); 
          }
        } catch (error) {
          console.error("Error fetching vehicle details:", error);
          setFetchVehicleError(
            error.message || "Error al cargar detalles del vehículo."
          );
        } finally {
          setIsLoadingVehicle(false);
        }
      };
      loadVehicleDetails();
    }
  }, [vehicle, apiBase, apiKey]);

  //Funciones para manejar la imagen
  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

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
  const isApproval =
    displayVehicle.approvalStatusAssignment === "P" ||
    displayVehicle.status === "approval";
  const isChecklist =
    displayVehicle.approvalStatusAssignment === "A" ||
    displayVehicle.status === "checklist";

  const handleApprove = () => {
    onApprove(displayVehicle.id);
  };

  //**********nuevo codigo
  const requestAndroidDownloadsAccess = async () => {
    try {
      const permissions = await FileSystem.StorageAccessFramework
        .requestDirectoryPermissionsAsync();

      if (!permissions.granted) return null;

      await AsyncStorage.setItem(DOWNLOADS_URI_KEY, permissions.directoryUri);
      return permissions.directoryUri;

    } catch (error) {
      console.log("Error SAF:", error);
      return null;
    }
  };

  //**********nuevo codigo
  const saveToAndroidDownloads = async (fileUrl, fileName) => {
    try {
      let directoryUri = await AsyncStorage.getItem(DOWNLOADS_URI_KEY);

      if (!directoryUri) {
        directoryUri = await requestAndroidDownloadsAccess();
        if (!directoryUri) return null;
      }

      const tempUri = FileSystem.cacheDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(fileUrl, tempUri);

      const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        "application/octet-stream"
      );

      await FileSystem.writeAsStringAsync(newFileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return newFileUri;

    } catch (err) {
      console.log("Error guardando:", err);
      return null;
    }
  };

    //**********nuevo codigo
  const saveFileIOS = async (fileUrl, fileName) => {
    try {
      const tmp = FileSystem.cacheDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(fileUrl, tmp);

      await Sharing.shareAsync(downloadRes.uri);
      return true;

    } catch (err) {
      console.log("Error iOS sharing:", err);
      return null;
    }
  };

  //**********nuevo codigo
  const downloadFileUniversal = async (fileUrl, fileName) => {
    if (!fileUrl) {
      alert("No se encontró archivo para descargar");
      return;
    }

    if (Platform.OS === "android") {
      const uri = await saveToAndroidDownloads(fileUrl, fileName);
      if (uri) alert("Archivo guardado exitosamente");
      return;
    }

    if (Platform.OS === "ios") {
      await saveFileIOS(fileUrl, fileName);
    }
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

          {/*Vehicle Specific Header con imagen real */}
          <LinearGradient
            colors={["#293e5d", "#17335C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vehicleSpecificHeader}
          >
            <View style={styles.carIcon}>
              {displayVehicle.fileUrlVehicleImage && !imageError ? (
                <Image
                  source={{ uri: displayVehicle.fileUrlVehicleImage }}
                  style={styles.vehicleImage}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="car-sport" size={40} color="#fff" />
              )}
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
                En proceso de devolución {displayVehicle.dateReturning}
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
              <Text style={styles.sectionTitle}>Información del Vehículo</Text>
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
               <Text style={styles.sectionTitle}>Adjuntos de la asignación</Text>
              {isLoadingAssignment ? (
                <Text style={styles.infoText}>Cargando adjuntos...</Text>
              ) : fetchedAssignmentDetails &&
                fetchedAssignmentDetails.Data &&
                fetchedAssignmentDetails.Data.length > 0 &&
                fetchedAssignmentDetails.Data[0].Attachments &&
                fetchedAssignmentDetails.Data[0].Attachments.length > 0 ? (
                <ScrollView
                  style={styles.attachmentsScrollView}
                  nestedScrollEnabled={true}
                >
                  {fetchedAssignmentDetails.Data[0].Attachments.map(
                    (attachment, index) => {
                      const fileName =
                        attachment.File_name ||
                        `Adjunto_${Date.now()}_${index + 1}`;
                      const fileUrl = attachment.File_url;

                      const handleDownload = async (fileUrl, fileName) => {
                        try {
                          await downloadFileUniversal(fileUrl, fileName);
                        } catch (e) {
                          console.log("Error al descargar archivo:", e);
                        }

                      };

                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            if (fileUrl) {
                              Alert.alert(
                                "Opciones del Adjunto",
                                `¿Deseas descargar ${fileName}?`,
                                [
                                  {
                                    text: "Si, confirmo",
                                    onPress: () => handleDownload(fileUrl, fileName),
                                  },
                                  {
                                    text: "Cancelar",
                                    style: "cancel",
                                  },
                                ],
                                { cancelable: true }
                              );
                            } else {
                              Alert.alert(
                                "Información",
                                `Adjunto: ${fileName} (No hay URL disponible para este archivo)`
                              );
                            }
                          }}
                        >
                          <Text style={styles.textLink}>{fileName}</Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </ScrollView>
              ) : (
                <Text style={styles.infoText}>
                  No hay adjuntos disponibles.
                </Text>
              )}
            </View>
          </View>
          {/* Adjuntos del Vehículo */}
          <View style={styles.infoCard}>
            <MaterialIcons
              name="attachment"
              size={20}
              color={materialColors.primary}
              style={styles.infoCardIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.sectionTitle}>Adjuntos del Vehículo</Text>
              {isLoadingVehicle ? (
                <Text style={styles.infoText}>Cargando adjuntos del vehículo...</Text>
              ) : fetchedVehicleDetails &&
                fetchedVehicleDetails.Attachments &&
                fetchedVehicleDetails.Attachments.length > 0 ? (
                <ScrollView
                  style={styles.attachmentsScrollView}
                  nestedScrollEnabled={true}
                >
                  {fetchedVehicleDetails.Attachments.map(
                    (attachment, index) => {
                      const fileName =
                        attachment.File_name ||
                        attachment.FileName ||
                        `Adjunto_Vehiculo_${Date.now()}_${index + 1}`;
                      const fileUrl = attachment.File_url || attachment.FileUrl;

                      const handleVehicleDownload = async (fileUrl, fileName) => {
                        try {
                          await downloadFileUniversal(fileUrl, fileName);
                        } catch (e) {
                          console.log("Error al descargar archivo (vehículo):", e);
                        }
                      };

                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            if (fileUrl) {
                              Alert.alert(
                                "Opciones del Adjunto del Vehículo",
                                `¿Deseas descargar ${fileName}?`,
                                [
                                  {
                                    text: "Si, confirmo",
                                    onPress: () => handleVehicleDownload(fileUrl, fileName),
                                  },
                                  {
                                    text: "Cancelar",
                                    style: "cancel",
                                  },
                                ],
                                { cancelable: true }
                              );
                            } else {
                              Alert.alert(
                                "Información",
                                `Adjunto del vehículo: ${fileName} (No hay URL disponible para este archivo)`
                              );
                            }
                          }}
                        >
                          <Text style={styles.textLink}>{fileName}</Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </ScrollView>
              ) : (
                <Text style={styles.infoText}>
                  No hay adjuntos del vehículo disponibles.
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
              <Text style={styles.sectionTitle}>Detalles de la Asignación</Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoTextLabel}>Asignado el:</Text>{" "}
                {displayVehicle.dateAssignment || "N/A"}
                <Text style={styles.infoTextLabel}>
                  {"\n"}Posible devolución el día:
                </Text>{" "}
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
    backgroundColor: "rgba(255, 255, 255, 0.1)", 
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: materialColors.textPrimary,
    marginBottom: 8,
  },
});

export default MasInformacion;
