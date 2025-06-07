import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Pressable,
  Platform,
  UIManager,
  Image,
  LayoutAnimation,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ActionButton from "../components/ActionButton";
import { getFormularioChecklist, postChecklistVehiculo } from "../api/urls"; // Import your API function
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator'; // Asegúrate de que esté importado
import * as FileSystem from 'expo-file-system'; // Asegúrate de que esté importado

const { height, width } = Dimensions.get("window");

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0 || bytes === null || typeof bytes === 'undefined') return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const Toast = ({ visible, message, type = "success", onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      const timer = setTimeout(() => {
        hideToast();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getToastBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "alert-circle";
      case "error":
        return "close-circle";
      default:
        return "information-circle";
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: getToastBackgroundColor(),
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons
          name={getToastIcon()}
          size={20}
          color="white"
          style={styles.toastIcon}
        />
        <Text style={styles.toastMessage} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <TouchableOpacity style={styles.toastCloseButton} onPress={hideToast}>
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const MAX_BINARY_SIZE_BYTES = 3 * 1024 * 1024; // 3MB en bytes (para que Base64 sea ~4MB)

const CheckList = ({
  vehicle,
  onClose,
  apiBase,
  apiKey,
  idChecklistForm,
  idUser,
  // Ensure Id_assignment and Id_costcenter are available, e.g., via vehicle prop or dedicated props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [checklistForm, setChecklistForm] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [fetchFormError, setFetchFormError] = useState(null);
  const [checkItems, setCheckItems] = useState({}); // Stores { [Id_checklistconcept]: Id_valuechecklistconcept }
  const [observations, setObservations] = useState("");
  const [expandedItem, setExpandedItem] = useState(null); // Stores Id_checklistconcept of expanded item

  const [selectedImages, setSelectedImages] = useState([]); // Nuevo estado para las imágenes
  const [isUploadingImages, setIsUploadingImages] = useState(false); // Estado para loading de upload
  const [isSendingChecklist, setIsSendingChecklist] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const scrollViewRef = useRef(null);
  const animations = useMemo(
    () => ({
      overlayOpacity: new Animated.Value(0),
      slideAnim: new Animated.Value(height),
    }),
    []
  );

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animations.overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(animations.slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
    return () => {
      Animated.timing(animations.overlayOpacity).stop();
      Animated.timing(animations.slideAnim).stop();
    };
  }, []);

  // Fetch checklist form structure
  useEffect(() => {
    if (apiBase && apiKey && idChecklistForm) {
      const fetchForm = async () => {
        setIsLoadingForm(true);
        setFetchFormError(null);
        try {
          const response = await getFormularioChecklist({
            apiBase,
            apiKey,
            idChecklistForm,
          });
          if (response && response.Data && response.Data.length > 0) {
            const form = response.Data[0];
            // Filter concepts based on To_daily_checklist and Status
            form.ChecklistFormConcepts = form.ChecklistFormConcepts.filter(
              (concept) =>
                concept.To_daily_checklist === "S" && concept.Status === "S"
            );

            setChecklistForm(form);
            // Initialize checkItems with the first valid value for each concept
            const initialItems = {};
            form.ChecklistFormConcepts.forEach((concept) => {
              if (concept.Validvalues && concept.Validvalues.length > 0) {
                initialItems[concept.Id_checklistconcept] =
                  concept.Validvalues[0].Id_valuechecklistconcept;
              } else {
                initialItems[concept.Id_checklistconcept] = null; // Or handle as error/no options
              }
            });
            setCheckItems(initialItems);
          } else {
            throw new Error(
              "Formato de respuesta inválido o formulario no encontrado."
            );
          }
        } catch (error) {
          console.error("Error fetching checklist form:", error);
          setFetchFormError(error.message || "Error al cargar el formulario.");
          showToast(error.message || "Error al cargar el formulario.", "error");
        } finally {
          setIsLoadingForm(false);
        }
      };
      fetchForm();
    }
  }, [apiBase, apiKey, idChecklistForm]);

  // Nueva función para seleccionar imágenes
  const selectImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        showToast("Se necesitan permisos para acceder a la galería", "error");
        return;
      }

      const remainingSlots = 3 - selectedImages.length;
      if (remainingSlots <= 0) {
        showToast("Ya has seleccionado el máximo de 3 fotos.", "warning");
        return;
      }

      setIsUploadingImages(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1.0, // Obtener la mejor calidad posible, manipularemos después si es necesario
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets) {
        const newImagesPromises = result.assets
          .slice(0, remainingSlots)
          .map(async (asset, index) => {
            let currentUri = asset.uri;
            let currentFileSize = asset.fileSize;
            let currentWidth = asset.width;
            let currentHeight = asset.height;
            let manipulated = false;

            // 1. Verificar tamaño del archivo y manipular si excede MAX_BINARY_SIZE_BYTES
            if (currentFileSize && currentFileSize > MAX_BINARY_SIZE_BYTES) {
              showToast(
                `Imagen ${asset.fileName || `seleccionada ${index + 1}`} (${formatBytes(currentFileSize)}) excede ${formatBytes(MAX_BINARY_SIZE_BYTES)}. Intentando reducir...`,
                "warning",
                3500 // Duración del toast
              );
              try {
                // Intentar reducir calidad y/o dimensiones.
                // 'compress' (0-1): 0.7 es una compresión moderada.
                // 'resize': Redimensionar si es muy grande, manteniendo aspecto.
                // Puedes ajustar estos valores.
                const manipResult = await ImageManipulator.manipulateAsync(
                  asset.uri,
                  [{ resize: { width: Math.min(currentWidth, 1920) } }], // No agrandar, máx ancho 1920px
                  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                currentUri = manipResult.uri;
                currentWidth = manipResult.width;
                currentHeight = manipResult.height;
                manipulated = true;

                const manipFileInfo = await FileSystem.getInfoAsync(currentUri, { size: true });
                if (manipFileInfo.exists && typeof manipFileInfo.size === 'number') {
                  currentFileSize = manipFileInfo.size;
                  if (currentFileSize > MAX_BINARY_SIZE_BYTES) {
                     showToast(
                       `Aún después de reducir, la imagen ${asset.fileName || `seleccionada ${index + 1}`} (${formatBytes(currentFileSize)}) es muy grande y no será añadida.`,
                       "error",
                       4000
                     );
                     return null; // Omitir si sigue siendo muy grande
                  }
                   showToast(
                    `Imagen ${asset.fileName || `seleccionada ${index + 1}`} reducida a ${formatBytes(currentFileSize)}.`,
                    "success",
                    3000
                  );
                } else {
                  console.warn("No se pudo obtener el tamaño del archivo manipulado para:", asset.fileName);
                  // Si no se puede obtener el nuevo tamaño, y el original era muy grande, omitir.
                  return null;
                }
              } catch (manipError) {
                console.error("Error manipulating image:", asset.fileName, manipError);
                showToast(`Error al reducir la imagen ${asset.fileName || `seleccionada ${index + 1}`}. No será añadida.`, "error");
                return null; // Omitir si la manipulación falla y el original era grande
              }
            }

            // 2. Convertir a Base64 la imagen (original o manipulada)
            let base64Data = null;
            try {
              base64Data = await FileSystem.readAsStringAsync(currentUri, {
                encoding: FileSystem.EncodingType.Base64,
              });
            } catch (e) {
    
              showToast(`Error al procesar la imagen ${asset.fileName || `seleccionada ${index + 1}`}.`, "error");
              return null; // Omitir si hay error en la conversión
            }

            return {
              id: Date.now() + index,
              uri: currentUri,
              type: asset.type || "image/jpeg",
              fileName: asset.fileName || `image_${Date.now()}_${index}.jpg`,
              fileSize: currentFileSize, // Tamaño del archivo (original o manipulado) ANTES de Base64
              width: currentWidth,
              height: currentHeight,
              base64: base64Data,
              manipulated: manipulated,
            };
          });

        const processedImagesResults = await Promise.all(newImagesPromises);
        const validNewImages = processedImagesResults.filter(img => img !== null);

        if (validNewImages.length > 0) {
          setSelectedImages((prev) => [...prev, ...validNewImages]);
          showToast(`${validNewImages.length} foto(s) añadida(s).`, "success");
        }
      }
    } catch (error) {
      console.error("Error selecting images:", error);
      showToast("Error al seleccionar imágenes.", "error");
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Función para eliminar una imagen seleccionada
  const removeImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
    showToast("Foto eliminada", "success");
  };

  // Función para limpiar todas las imágenes
  const clearAllImages = () => {
    setSelectedImages([]);
    showToast("Todas las fotos eliminadas", "success");
  };

  const handleStatusChange = (idConcept, idValue) => {
    setCheckItems((prev) => ({
      ...prev,
      [idConcept]: idValue,
    }));

    const concept = checklistForm?.ChecklistFormConcepts.find(
      (c) => c.Id_checklistconcept === idConcept
    );
    const value = concept?.Validvalues.find(
      (v) => v.Id_valuechecklistconcept === idValue
    );

    if (concept && value) {
      // Simplified toast message, adapt as needed
      showToast(
        `${concept.Description} actualizado a ${value.Description}`,
        "success"
      );
    }

    setTimeout(() => {
      setExpandedItem(null);
    }, 100);
  };

  const toggleDropdown = (idConcept) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem((current) => (current === idConcept ? null : idConcept));
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(animations.overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animations.slideAnim, {
        toValue: height,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onClose) onClose();
    });
  };

  const handleSend = async () => {
    if (!checklistForm || !vehicle || !idUser) {
      showToast("Faltan datos esenciales para enviar el checklist.", "error");
      console.error("Missing data for handleSend:", {
        checklistForm,
        vehicle,
        idUser,
      });
      return;
    }

    const idAssignment = vehicle.id; 
    const idCostcenter = vehicle.rateCode; 

    if (idAssignment == null || idCostcenter == null) {
      showToast("Falta ID de asignación o centro de costo.", "error");
      console.error("Missing Id_assignment or Id_costcenter:", {
        idAssignment,
        idCostcenter,
      });
      return;
    }

    setIsSendingChecklist(true);

    // 1. Prepare CheckListDetail
    const checkListDetailArray = Object.keys(checkItems).map((conceptId) => ({
      Id_checklistconcept: parseInt(conceptId, 10),
      Id_valuechecklistconcept: checkItems[conceptId],
      "Observations ": "NA", 
    }));

    // 2. Prepare Attachments - ASEGURARSE DE ENVIAR BASE64
    const attachmentsArray = selectedImages.map((image) => ({
      Source_subtype: "I",
      File_name: image.fileName || `image_${Date.now()}.jpg`, 
      File_base64: image.base64, 
    }));

    // 3. Format Date_checklist
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); 
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`; 

    // 4. Construct the main payload
    const checklistPayload = {
      apiBase, 
      apiKey, 
      Id_assignment: idAssignment,
      Id_checklistform: checklistForm.Id_checklistform, 
      Id_vehicle: vehicle.vehicleId, 
      Id_costcenter: idCostcenter,
      Date_checklist: formattedDate,
      Id_creator: idUser,
      CheckListDetail: checkListDetailArray,
      Attachments: attachmentsArray,
      Comment: observations || "NA", 
    };

    try {
      console.log("Sending checklist payload:", checklistPayload.Comment);
      console.log("attachments:", checklistPayload.Attachments);
      const result = await postChecklistVehiculo(checklistPayload);

      // console.log("Checklist Payload:", checklistPayload); // Ya se logueó arriba
      console.log("response checklist :", result.Mensaje.Tipo);
      if (result.Mensaje.Tipo == "E") {
        showToast(
          result.message ||
            "Error al enviar el checklist, por favor consulte a su administrador",
          "error"
        );
        // No olvides setIsSendingChecklist(false) en caso de error si no está en un finally
        return; 
      }
      showToast("Checklist enviado exitosamente", "success");
    } catch (error) {
      console.error("Error sending checklist:", error);
      showToast(
        `Error al enviar: ${error.message || "Error desconocido"}`,
        "error"
      );
    } finally {
      setIsSendingChecklist(false);
    }
  };

  const getSelectedValueDescription = (idConcept) => {
    const selectedValueId = checkItems[idConcept];
    if (!selectedValueId || !checklistForm) return "Seleccionar";

    const concept = checklistForm.ChecklistFormConcepts.find(
      (c) => c.Id_checklistconcept === idConcept
    );
    const selectedValue = concept?.Validvalues.find(
      (v) => v.Id_valuechecklistconcept === selectedValueId
    );
    return selectedValue ? selectedValue.Description : "Seleccionar";
  };

  // Adapt getStatusIcon and getStatusColors to use Validvalue.Description
  /*
  const getStatusIcon = (valueDescription) => {
    // Example mapping, adjust based on your actual value descriptions
    if (valueDescription?.toLowerCase().includes("buen")) {
      return (
        <Ionicons
          name="checkmark-circle"
          size={18}
          color="#16a34a"
          style={{ marginRight: 4 }}
        />
      );
    } else if (valueDescription?.toLowerCase().includes("mal")) {
      return (
        <Ionicons
          name="close-circle"
          size={18}
          color="#dc2626"
          style={{ marginRight: 4 }}
        />
      );
    } else if (valueDescription && valueDescription !== "Seleccionar") {
      // For "No posee" or other neutral/regular states
      return (
        <Ionicons
          name="alert-circle"
          size={18}
          color="#d97706"
          style={{ marginRight: 4 }}
        />
      );
    }
    return null;
  };
  */

  if (!isVisible || !vehicle) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.overlay, { opacity: animations.overlayOpacity }]}
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <Pressable style={styles.overlayPressable} onPress={handleClose}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: animations.slideAnim }] },
          ]}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
              removeClippedSubviews={Platform.OS === "android"}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>
                  {checklistForm?.Description || "Estado del Vehículo"}
                </Text>
              </View>

              <LinearGradient
                colors={["#9f64ff", "#7722FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.vehicleCard}
              >
                <View style={styles.vehicleIconContainer}>
                  {vehicle.imageUrl ? (
                    <Image
                      source={vehicle.imageUrl}
                      resizeMethod="resize"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="car-sport" size={40} color="#fff" />
                  )}
                </View>
                <View style={styles.vehicleInfoContent}>
                  <Text style={styles.vehicleCardTitle}>
                    Checklist (
                    {new Date().toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                    )
                  </Text>
                  <Text style={styles.vehicleInfo}>
                    {vehicle.markDescription} {vehicle.model} • {vehicle.year}
                  </Text>
                </View>
              </LinearGradient>

              {isLoadingForm && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text style={styles.loadingText}>Cargando formulario...</Text>
                </View>
              )}
              {fetchFormError && !isLoadingForm && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color="#ef4444"
                  />
                  <Text style={styles.errorTextMsg}>{fetchFormError}</Text>
                </View>
              )}

              {!isLoadingForm && !fetchFormError && checklistForm && (
                <View style={styles.checklistCard}>
                  {checklistForm.ChecklistFormConcepts.map((concept) => (
                    <View
                      key={concept.Id_checklistconcept}
                      style={[
                        styles.checkItemContainer,
                        expandedItem === concept.Id_checklistconcept &&
                          styles.checkItemContainerActive,
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.checkItem,
                          expandedItem === concept.Id_checklistconcept &&
                            styles.checkItemActive,
                        ]}
                        onPress={() =>
                          toggleDropdown(concept.Id_checklistconcept)
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={styles.checkItemText}>
                          {concept.Description}
                        </Text>
                        <View
                          style={[
                            styles.statusIndicator
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getSelectedValueDescription(
                              concept.Id_checklistconcept
                            )}
                          </Text>
                          <Ionicons
                            name={
                              expandedItem === concept.Id_checklistconcept
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={16}
                          />
                        </View>
                      </TouchableOpacity>

                      {expandedItem === concept.Id_checklistconcept && (
                        <View style={styles.dropdownContainer}>
                          {concept.Validvalues.map((value) => {
                            // Only render the TouchableOpacity if value.Description is not null
                            if (value.Description != null) {
                              return (
                                <TouchableOpacity
                                  key={value.Id_valuechecklistconcept}
                                  style={styles.dropdownOption}
                                  onPress={() =>
                                    handleStatusChange(
                                      concept.Id_checklistconcept,
                                      value.Id_valuechecklistconcept
                                    )
                                  }
                                  activeOpacity={0.7}
                                >
                                  {/* You can add icons for each valid value if needed */}
                                  {/* <View style={styles.dropdownIconContainer}>
                                    <Ionicons name="ellipse-outline" size={20} color="#334155" />
                                  </View> */}
                                  <Text style={styles.dropdownTextNeutral}>
                                    {value.Description}
                                  </Text>
                                </TouchableOpacity>
                              );
                            }
                            return null; // Return null if description is null, so nothing is rendered for this item
                          })}
                        </View>
                      )}
                    </View>
                  ))}

                  <View style={styles.observations}>
                    <Text style={styles.observationsLabel}>Observaciones:</Text>
                    <TextInput
                      style={styles.observationsInput}
                      multiline
                      maxLength={500}
                      value={observations}
                      onChangeText={setObservations}
                      placeholder="Añadir observaciones adicionales aquí..."
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>
              )}

              <View style={styles.uploadCard}>
                <View style={styles.uploadHeader}>
                  <Text style={styles.uploadSubtitle}>
                    {selectedImages.length}/3 fotos seleccionadas
                  </Text>
                </View>

                {/* Contenedor de imágenes seleccionadas con FlatList */}
                {selectedImages.length > 0 && (
                  <View style={styles.selectedImagesContainer}>
                    <FlatList
                      data={selectedImages}
                      renderItem={({ item }) => (
                        <View style={styles.imageGridItem}>
                          <Image
                            source={{ uri: item.uri }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => removeImage(item.id)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={24}
                              color="#ef4444"
                            />
                          </TouchableOpacity>
                           {(
                      <View style={styles.imageSizeContainer}>
                        <Text style={styles.imageSizeText}>
                          {formatBytes(item.fileSize)}
                        </Text>
                      </View>
                    )}
                        </View>
                      )}
                      keyExtractor={(item) => item.id.toString()}
                      numColumns={3}
                      scrollEnabled={false} // <--- ADD THIS PROP
                      
                    />

                    {selectedImages.length > 1 && (
                      <TouchableOpacity
                        style={styles.clearAllButton}
                        onPress={clearAllImages}
                      >
                        <Text style={styles.clearAllText}>Limpiar todo</Text>
                      </TouchableOpacity>
                    )}
                   
                  </View>
                )}

                {/* Botón para seleccionar imágenes */}
                <TouchableOpacity
                  style={[
                    styles.uploadContainer,
                    selectedImages.length >= 3 &&
                      styles.uploadContainerDisabled,
                  ]}
                  activeOpacity={0.8}
                  onPress={selectImages}
                  disabled={selectedImages.length >= 3 || isUploadingImages}
                >
                  {isUploadingImages ? (
                    <>
                      <ActivityIndicator size="small" color="#6366f1" />
                      <Text style={styles.uploadText}>Cargando...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="camera"
                        size={28}
                        color={
                          selectedImages.length >= 3 ? "#9ca3af" : "#6366f1"
                        }
                      />
                      <Text
                        style={[
                          styles.uploadText,
                          selectedImages.length >= 3 &&
                            styles.uploadTextDisabled,
                        ]}
                      >
                        {selectedImages.length >= 3
                          ? "Máximo alcanzado"
                          : "Seleccionar fotos"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <ActionButton
                  title="Hacer Check"
                  iconName="done"
                  onPress={handleSend}
                  colors={["#10b981", "#059669"]}
                  style={styles.sendButton}
                  disabled={
                    isLoadingForm || !!fetchFormError || isSendingChecklist
                  }
                  loading={isSendingChecklist} // Assuming your ActionButton supports a loading prop
                />
                <ActionButton
                  title="Cancelar"
                  iconName="close" // Make sure this icon exists or change it
                  onPress={handleClose}
                  colors={["#f43f5e", "#dc2626"]}
                  style={styles.cancelButton}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ... (previous styles)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    zIndex: 1000,
  },
  overlayPressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    height: "92%",
    position: "absolute",
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#f8fafc", // Light gray background for the modal content
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
      },
      android: {
        elevation: 25,
      },
    }),
  },
  modalHeader: {
    paddingTop: 16, // Increased padding for better spacing
    paddingBottom: 8, // Added padding bottom
    alignItems: "center",
    position: "relative", // For absolute positioning of close button
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0", // Lighter border color
    backgroundColor: "white", // Ensure header has a background
    ...Platform.select({
      // Subtle shadow for depth
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
    zIndex: 10, // Keep header above content
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#cbd5e1", // Slightly darker handle
    borderRadius: 3,
    marginBottom: 8, // Space below handle
  },
  closeButton: {
    position: "absolute",
    top: 12, // Adjust for vertical centering
    right: 16,
    width: 36, // Standard touch target size
    height: 36,
    borderRadius: 18, // Circular button
    backgroundColor: "#f1f5f9", // Light background for contrast
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30, // Ensure space for last items
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1", // Primary color for vehicle card
    borderRadius: 8, // More rounded corners
    padding: 16, // Consistent padding
    marginBottom: 16, // Space below card
    ...Platform.select({
      // Enhanced shadow
      ios: {
        shadowColor: "#4338ca", // Darker shadow color
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  vehicleInfoContent: {
    flex: 1, // Take remaining space
  },
  vehicleCardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700", // Bold title
  },
  vehicleInfo: {
    color: "rgba(255,255,255,0.8)", // Slightly transparent white for sub-info
    fontSize: 14,
    marginTop: 2,
  },
  checklistCard: {
    backgroundColor: "white",
    borderRadius: 10, // Consistent border radius
    padding: 10, // Reduced padding for a tighter look if many items
    marginBottom: 24,
    ...Platform.select({
      // Standard shadow for cards
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 18, // Prominent title
    fontWeight: "700",
    color: "#1e293b", // Dark text color
  },
  // Removed infoIcon as it wasn't used in the provided JSX for this card
  checkItemContainer: {
    marginBottom: 8,
    borderRadius: 12, // Rounded corners for each item
    overflow: "hidden", // Important for borderRadius on children
    backgroundColor: "white", // Default background
    borderWidth: 1,
    borderColor: "#e2e8f0", // Light border
  },
  checkItemContainerActive: {
    borderColor: "#c7d2fe", // Highlight when active/expanded
    // elevation: 1, // Subtle elevation if desired
  },
  checkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15, // Comfortable touch area
    paddingHorizontal: 16,
    backgroundColor: "white", // Ensure background for touch feedback
  },
  checkItemActive: {
    backgroundColor: "#f8fafc", // Slightly different background when active
  },
  checkItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155", // Readable text color
    flexShrink: 1, // Allow text to shrink if too long
    marginRight: 8, // Space before status indicator
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110, // Ensure enough width for text and icon
    backgroundColor: "#f1f5f9", // Default light gray background
    borderWidth: 1, // Border for definition
    // borderColor will be set by getStatusColors
  },
  statusDefault: {
    // Added default style for status indicator
    borderColor: "#cbd5e1", // Neutral border
  },
  statusGood: {
    borderColor: "#16a34a", // Green border for "Good"
  },
  statusRegular: {
    borderColor: "#d97706", // Orange border for "Regular"
  },
  statusBad: {
    borderColor: "#dc2626", // Red border for "Bad"
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4, // Space before chevron
    color: "#334155", // Consistent text color
  },
  dropdownContainer: {
    backgroundColor: "#f8fafc", // Light background for dropdown area
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0", // Separator line
    padding: 8, // Padding around options
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16, // Consistent padding
    borderRadius: 10, // Rounded options
    marginBottom: 4, // Space between options
    backgroundColor: "#ffffff", // White background for options
    borderWidth: 1,
    borderColor: "#e2e8f0", // Light border for each option
  },
  // dropdownIconContainer can be used if you add icons to each option
  // dropdownIconContainer: {
  //   width: 28,
  //   height: 28,
  //   borderRadius: 10,
  //   backgroundColor: "#f8fafc",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginRight: 12,
  // },
  dropdownTextNeutral: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "500",
  },
  observations: {
    marginTop: 10, // Space above observations section
  },
  observationsLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
    color: "#334155",
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1", // Standard border color
    borderRadius: 10,
    padding: 10,
    height: 90, // Fixed height for multiline input
    textAlignVertical: "top", // Start text from the top
    fontSize: 15,
    backgroundColor: "#f8fafc", // Light background for input
    color: "#334155", // Text color
  },
  uploadCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  uploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#f1f5f9", // Light background for upload area
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0", // Light border
    borderStyle: "dashed", // Dashed border for visual cue
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#6366f1", // Primary color for text
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Space buttons evenly
    width: "100%",
    marginTop: 10, // Add some margin above buttons
  },
  sendButton: {
    // Style for ActionButton wrapper if needed, or apply directly
    flex: 1, // Make buttons take equal width
    marginRight: 8, // Space between buttons
  },
  cancelButton: {
    // Style for ActionButton wrapper
    flex: 1, // Make buttons take equal width
    marginLeft: 8, // Space between buttons
  },
  // Removed sendButtonText and cancelButtonText as ActionButton handles its own text styling
  loadingContainer: {
    // For centering loading indicator
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4b5563", // Gray text for loading
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2", // Light red background for error
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorTextMsg: {
    // Renamed from errorText to avoid conflict
    marginLeft: 10,
    color: "#b91c1c", // Darker red text for error
    fontSize: 15,
    flexShrink: 1,
  },
  toast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30, // Adjust for status bar
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3b82f6", // Default blue, will be overridden by type
    borderRadius: 12, // More rounded
    paddingVertical: 10, // Vertical padding
    paddingHorizontal: 16, // Horizontal padding
    zIndex: 9999, // Ensure toast is on top
    ...Platform.select({
      // Platform-specific shadow for toast
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastContent: {
    flex: 1, // Allow message to take available space
    flexDirection: "row",
    alignItems: "center",
  },
  toastIcon: {
    marginRight: 10,
  },
  toastMessage: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1, // Allow message to wrap if long
  },
  toastCloseButton: {
    padding: 4, // Make close icon easier to tap
  },
  uploadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    // Añadido para el título de la sección de carga
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  selectedImagesContainer: {
    marginBottom: 16,
  },

  // NUEVOS ESTILOS PARA FLATLIST GRID
  imageGridItem: {
    flex: 1, // Para que las columnas se distribuyan
    margin: 4, // Espacio alrededor de cada imagen
    aspectRatio: 1, // Para hacer las imágenes cuadradas
    position: "relative", // Para el posicionamiento absoluto del botón de eliminar
    borderRadius: 8,
    overflow: "hidden", // Para que el borderRadius afecte a la imagen
    backgroundColor: "#f3f4f6", // Fondo mientras carga
  },
  removeImageButton: {
    position: "absolute",
    top: 4, // Ajusta la posición del botón
    right: 4, // Ajusta la posición del botón
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo semitransparente
    borderRadius: 12, // Botón circular
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  clearAllButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    marginTop: 10, // Espacio sobre el botón "Limpiar todo"
  },
  clearAllText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "500",
  },
  uploadContainerDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  uploadTextDisabled: {
    color: "#9ca3af",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageSizeContainer: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center', // Centrar el texto si es corto
  },
  imageSizeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CheckList;
