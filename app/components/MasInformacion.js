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
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

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
          console.log(`Fetching assignment details for ID: ${vehicle.id}`);
          const data = await getDetalleAsignacion({
            apiBase,
            apiKey,
            idAssignment: vehicle.id,
          });

          console.log(
            "Full response from getDetalleAsignacion (data):",
            JSON.stringify(data, null, 2)
          );

          if (
            data &&
            data.Data &&
            data.Data.length > 0 &&
            data.Data[0].Attachments
          ) {
            console.log(
              "Attachments from data.Data[0].Attachments:",
              data.Data[0].Attachments
            );
          } else if (data && data.Attachments) {
            console.log(
              "Attachments from data.Attachments (top level):",
              data.Attachments
            );
          } else {
            console.log(
              "Attachments not found in expected locations. Check 'Full response' log above."
            );
          }
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
          console.log(`Fetching vehicle details for ID: ${vehicle.vehicleId}`);
          const data = await getVehiculo({
            apiBase,
            apiKey,
            idVehiculo: vehicle.vehicleId,
          });
          console.log(
            "Full response from getVehiculo (data):",
            JSON.stringify(data, null, 2)
          );
          if (data && data.Data && data.Data.length > 0) {
            const apiVehicleData = data.Data[0];
            // Merge the initial vehicle prop data with the data fetched from the API.
            // Properties from apiVehicleData will overwrite those in the vehicle prop.
            setFetchedVehicleDetails({
              ...(vehicle || {}), // Start with base properties from the vehicle prop
              ...apiVehicleData,   // Override and add properties from the API response
            });
             // Log attachments if they exist in the API response
            if (apiVehicleData.Attachments) {
              console.log("Attachments from getVehiculo:", apiVehicleData.Attachments);
            }
          } else {
            setFetchedVehicleDetails(null); // If no data, set to null as per original logic
            console.log("No vehicle data found or data format unexpected from getVehiculo.");
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

  // ✅ AGREGAR: Funciones para manejar la imagen
  const handleImageError = () => {
    console.log("Error loading vehicle image:", vehicle.imageUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  if (!isVisible) {
    return null;
  }

  const displayVehicle = fetchedVehicleDetails || vehicle;

  const handleDownloadSimple = async () => {
    try {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileUri = FileSystem.documentDirectory + cleanFileName;

      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);

      if (downloadResult.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: attachment.MimeType || "application/octet-stream",
            dialogTitle: `Guardar/Compartir ${fileName}`,
          });
        }
      } else {
        throw new Error(
          `Error en la descarga. Status: ${downloadResult.status}`
        );
      }
    } catch (error) {
      console.error("Error al descargar:", error);
      Alert.alert(
        "Error de Descarga",
        `No se pudo descargar el archivo: ${
          error.message || "Error desconocido"
        }`
      );
    }
  };

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

          {/* ✅ CAMBIO: Vehicle Specific Header con imagen real */}
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

                      const handleDownload = async () => {
                        try {
                          const fileExtension = fileName.toLowerCase().split('.').pop();
                          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
                          const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', '3gp', 'webm'];
                          const isImage = imageExtensions.includes(fileExtension);
                          const isVideo = videoExtensions.includes(fileExtension);

                          Alert.alert("Descargando...", `Descargando ${fileName}. Por favor espera.`);

                          const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
                          
                          if (isImage || isVideo) {
                            try {
                              const { status } = await MediaLibrary.requestPermissionsAsync();
                              if (status !== 'granted') {
                                Alert.alert(
                                  'Permisos requeridos',
                                  'Se necesitan permisos para guardar archivos multimedia en tu dispositivo.'
                                );
                                return;
                              }

                              const tempUri = FileSystem.documentDirectory + cleanFileName;
                              const downloadResult = await FileSystem.downloadAsync(fileUrl, tempUri);

                              if (downloadResult.status === 200) {
                                const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
                                
                                let album = await MediaLibrary.getAlbumAsync('Gadve Downloads');
                                if (album == null) {
                                  album = await MediaLibrary.createAlbumAsync('Gadve Downloads', asset, false);
                                } else {
                                  await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                                }
                                
                                Alert.alert(
                                  'Descarga exitosa',
                                  `${fileName} se ha guardado en tu galería en el álbum "Gadve Downloads"`
                                );
                              } else {
                                throw new Error(`Error en la descarga. Status: ${downloadResult.status}`);
                              }
                            } catch (mediaError) {
                              console.error('Error guardando archivo multimedia:', mediaError);
                              Alert.alert(
                                'Error al guardar',
                                `No se pudo guardar ${fileName} en la galería.`
                              );
                            }
                          } else {
                            try {
                              const tempUri = FileSystem.documentDirectory + cleanFileName;
                              const downloadResult = await FileSystem.downloadAsync(fileUrl, tempUri);
                              
                              if (downloadResult.status === 200) {
                                if (await Sharing.isAvailableAsync()) {
                                  let mimeType = attachment.MimeType || "application/octet-stream";
                                  
                                  const mimeTypeMap = {
                                    'pdf': 'application/pdf',
                                    'doc': 'application/msword',
                                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                    'xls': 'application/vnd.ms-excel',
                                    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                    'ppt': 'application/vnd.ms-powerpoint',
                                    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                                    'txt': 'text/plain',
                                    'csv': 'text/csv',
                                    'zip': 'application/zip',
                                    'rar': 'application/x-rar-compressed',
                                    '7z': 'application/x-7z-compressed'
                                  };

                                  if (!attachment.MimeType && mimeTypeMap[fileExtension]) {
                                    mimeType = mimeTypeMap[fileExtension];
                                  }

                                  Alert.alert(
                                    'Archivo descargado',
                                    `${fileName} se ha descargado correctamente. En el siguiente panel puedes guardarlo en tu dispositivo seleccionando "Mis archivos" o "Guardar en dispositivo".`,
                                    [
                                      {
                                        text: "Guardar en dispositivo",
                                        onPress: async () => {
                                          await Sharing.shareAsync(downloadResult.uri, {
                                            mimeType: mimeType,
                                            dialogTitle: `Guardar ${fileName}`,
                                          });
                                        }
                                      },
                                      {
                                        text: "Cancelar",
                                        style: "cancel"
                                      }
                                    ]
                                  );
                                } else {
                                  Alert.alert(
                                    'Descarga completa',
                                    `${fileName} se ha descargado en el directorio temporal de la aplicación.`
                                  );
                                }
                              } else {
                                throw new Error(`Error en la descarga. Status: ${downloadResult.status}`);
                              }
                            } catch (documentError) {
                              console.error('Error descargando documento:', documentError);
                              Alert.alert(
                                'Error al descargar',
                                `No se pudo descargar ${fileName}. Motivo: ${documentError.message}`
                              );
                            }
                          }
                        } catch (error) {
                          console.error("Error al descargar:", error);
                          Alert.alert(
                            "Error de Descarga",
                            `No se pudo descargar el archivo "${fileName}". Verifica tu conexión a internet e inténtalo nuevamente.\n\nDetalle: ${error.message || "Error desconocido"}`
                          );
                        }
                      };

                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            if (fileUrl) {
                              Alert.alert(
                                "Opciones del Adjunto",
                                `¿Qué deseas hacer con ${fileName}?`,
                                [
                                  {
                                    text: "Ver",
                                    onPress: () => {
                                      WebBrowser.openBrowserAsync(
                                        fileUrl
                                      ).catch(() =>
                                        Alert.alert(
                                          "Error",
                                          "No se pudo abrir el adjunto."
                                        )
                                      );
                                    },
                                  },
                                  {
                                    text: "Descargar",
                                    onPress: handleDownload,
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

                      const handleVehicleDownload = async () => {
                        try {
                          const fileExtension = fileName.toLowerCase().split('.').pop();
                          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
                          const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', '3gp', 'webm'];
                          const isImage = imageExtensions.includes(fileExtension);
                          const isVideo = videoExtensions.includes(fileExtension);

                          Alert.alert("Descargando...", `Descargando ${fileName}. Por favor espera.`);

                          const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
                          
                          if (isImage || isVideo) {
                            try {
                              const { status } = await MediaLibrary.requestPermissionsAsync();
                              if (status !== 'granted') {
                                Alert.alert(
                                  'Permisos requeridos',
                                  'Se necesitan permisos para guardar archivos multimedia en tu dispositivo.'
                                );
                                return;
                              }

                              const tempUri = FileSystem.documentDirectory + cleanFileName;
                              const downloadResult = await FileSystem.downloadAsync(fileUrl, tempUri);

                              if (downloadResult.status === 200) {
                                const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
                                
                                let album = await MediaLibrary.getAlbumAsync('Gadve Downloads');
                                if (album == null) {
                                  album = await MediaLibrary.createAlbumAsync('Gadve Downloads', asset, false);
                                } else {
                                  await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                                }
                                
                                Alert.alert(
                                  'Descarga exitosa',
                                  `${fileName} se ha guardado en tu galería en el álbum "Gadve Downloads"`
                                );
                              } else {
                                throw new Error(`Error en la descarga. Status: ${downloadResult.status}`);
                              }
                            } catch (mediaError) {
                              console.error('Error guardando archivo multimedia:', mediaError);
                              Alert.alert(
                                'Error al guardar',
                                `No se pudo guardar ${fileName} en la galería.`
                              );
                            }
                          } else {
                            try {
                              const tempUri = FileSystem.documentDirectory + cleanFileName;
                              const downloadResult = await FileSystem.downloadAsync(fileUrl, tempUri);
                              
                              if (downloadResult.status === 200) {
                                if (await Sharing.isAvailableAsync()) {
                                  let mimeType = attachment.MimeType || attachment.mimeType || "application/octet-stream";
                                  
                                  const mimeTypeMap = {
                                    'pdf': 'application/pdf',
                                    'doc': 'application/msword',
                                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                    'xls': 'application/vnd.ms-excel',
                                    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                    'ppt': 'application/vnd.ms-powerpoint',
                                    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                                    'txt': 'text/plain',
                                    'csv': 'text/csv',
                                    'zip': 'application/zip',
                                    'rar': 'application/x-rar-compressed',
                                    '7z': 'application/x-7z-compressed'
                                  };

                                  if ((!attachment.MimeType && !attachment.mimeType) && mimeTypeMap[fileExtension]) {
                                    mimeType = mimeTypeMap[fileExtension];
                                  }

                                  Alert.alert(
                                    'Archivo descargado',
                                    `${fileName} se ha descargado correctamente. En el siguiente panel puedes guardarlo en tu dispositivo seleccionando "Mis archivos" o "Guardar en dispositivo".`,
                                    [
                                      {
                                        text: "Guardar en dispositivo",
                                        onPress: async () => {
                                          await Sharing.shareAsync(downloadResult.uri, {
                                            mimeType: mimeType,
                                            dialogTitle: `Guardar ${fileName}`,
                                          });
                                        }
                                      },
                                      {
                                        text: "Cancelar",
                                        style: "cancel"
                                      }
                                    ]
                                  );
                                } else {
                                  Alert.alert(
                                    'Descarga completa',
                                    `${fileName} se ha descargado en el directorio temporal de la aplicación.`
                                  );
                                }
                              } else {
                                throw new Error(`Error en la descarga. Status: ${downloadResult.status}`);
                              }
                            } catch (documentError) {
                              console.error('Error descargando documento:', documentError);
                              Alert.alert(
                                'Error al descargar',
                                `No se pudo descargar ${fileName}. Motivo: ${documentError.message}`
                              );
                            }
                          }
                        } catch (error) {
                          console.error("Error al descargar:", error);
                          Alert.alert(
                            "Error de Descarga",
                            `No se pudo descargar el archivo "${fileName}". Verifica tu conexión a internet e inténtalo nuevamente.\n\nDetalle: ${error.message || "Error desconocido"}`
                          );
                        }
                      };

                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            if (fileUrl) {
                              Alert.alert(
                                "Opciones del Adjunto del Vehículo",
                                `¿Qué deseas hacer con ${fileName}?`,
                                [
                                  {
                                    text: "Ver",
                                    onPress: () => {
                                      WebBrowser.openBrowserAsync(
                                        fileUrl
                                      ).catch(() =>
                                        Alert.alert(
                                          "Error",
                                          "No se pudo abrir el adjunto del vehículo."
                                        )
                                      );
                                    },
                                  },
                                  {
                                    text: "Descargar",
                                    onPress: handleVehicleDownload,
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
                      onPress={() => onReject(displayVehicle.id)}
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
                          title={displayVehicle.IdChecklistToday ? "Check listo" : "Hacer Check"}
                          iconName={
                            displayVehicle.IdChecklistToday ? "" : "checklist-rtl"
                          }

                          colors={
                            displayVehicle.IdChecklistToday
                              ? ["#10b981", "#059669"] // Verde para completado
                              : ["#FF8800", "#FF6600"] // Naranja para pendiente
                          }
                          onPress={onOpenModalCheckList}
                          disabled={displayVehicle.IdChecklistToday ? true : false}
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
    backgroundColor: "rgba(255, 255, 255, 0.1)", // ✅ AGREGAR: Fondo semi-transparente
  },
  // ✅ AGREGAR: Estilo para la imagen del vehículo
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
