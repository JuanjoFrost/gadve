import { useState, useEffect, useRef, useMemo } from "react";
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
import { getFormularioChecklist, postChecklistVehiculo } from "../api/urls";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";

const { height } = Dimensions.get("window");

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

const MAX_BINARY_SIZE_BYTES = 3 * 1024 * 1024; // 3MB en bytes (para que Base64 sea ~4MB)

const CheckList = ({
  vehicle,
  onClose,
  apiBase,
  apiKey,
  idChecklistForm,
  idUser,
  onChecklistComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [checklistForm, setChecklistForm] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [fetchFormError, setFetchFormError] = useState(null);
  const [checkItems, setCheckItems] = useState({});
  const [observations, setObservations] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSendingChecklist, setIsSendingChecklist] = useState(false);
  const [imageError, setImageError] = useState(false); 

  const { toast, showToast, hideToast } = useToast();

  //nuevo
  const [inputValue1, setInputValue1] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);
  const [isUploadExpanded, setIsUploadExpanded] = useState(true);

  const scrollViewRef = useRef(null);
  const animations = useMemo(
    () => ({
      overlayOpacity: new Animated.Value(0),
      slideAnim: new Animated.Value(height),
    }),
    []
  );

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

  // Fetch checklist
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
            form.ChecklistFormConcepts = form.ChecklistFormConcepts.filter(
              (concept) =>
                concept.To_daily_checklist === "S" && concept.Status === "S"
            );

            setChecklistForm(form);
            const initialItems = {};
            form.ChecklistFormConcepts.forEach((concept) => {
              if (concept.Validvalues && concept.Validvalues.length > 0) {
                initialItems[concept.Id_checklistconcept] =
                  concept.Validvalues[0].Id_valuechecklistconcept;
              } else {
                initialItems[concept.Id_checklistconcept] = null;
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

  // para manejar la imagen del vehículo
  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

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

      //Actualizacion
      setIsUploadingImages(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 1,
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

            if (currentFileSize && currentFileSize > MAX_BINARY_SIZE_BYTES) {
              try {
                const manipResult = await ImageManipulator.manipulateAsync(
                  asset.uri,
                  [{ resize: { width: Math.min(currentWidth, 1920) } }],
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
                     return null;
                  }
                   showToast(
                    `Imagen ${asset.fileName || `seleccionada ${index + 1}`} reducida a ${formatBytes(currentFileSize)}.`,
                    "success",
                    3000
                  );
                } else {
                  console.warn("No se pudo obtener el tamaño del archivo manipulado para:", asset.fileName);
                  return null;
                }
              } catch (manipError) {
                console.error("Error manipulating image:", asset.fileName, manipError);
                showToast(`Error al reducir la imagen ${asset.fileName || `seleccionada ${index + 1}`}. No será añadida.`, "error");
                return null;
              }
            }

            //Actualizacion
            let base64Data = null;
            try {
              base64Data = await FileSystem.readAsStringAsync(currentUri, {
                encoding: FileSystem.EncodingType.Base64,
              });
            } catch (e) {
              console.log("ERROR BASE64:", e);
              showToast(
                `Error al procesar la imagen ${asset.fileName || `seleccionada ${index + 1}`}.`,
                "error"
              );
              return null;
            }

            return {
              id: Date.now() + index,
              uri: currentUri,
              type: asset.type || "image/jpeg",
              fileName: asset.fileName || `image_${Date.now()}_${index}.jpg`,
              fileSize: currentFileSize,
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

  const removeImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
    showToast("Foto eliminada", "success");
  };

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
    const idCostcenter = vehicle.idCostcenter; 

    if (idAssignment == null || idCostcenter == null) {
      showToast("Falta ID de asignación o centro de costo.", "error");
      console.error("Missing Id_assignment or Id_costcenter:", {
        idAssignment,
        idCostcenter,
      });
      return;
    }

    // -------- VALIDACIÓN SEGÚN Inputs_requires --------
    if (checklistForm.Inputs_requires === 1) {
      if (!inputValue1 || isNaN(inputValue1)) {
        showToast("Debe ingresar un valor numérico.", "error");
        return;
      }
    }

    if (checklistForm.Inputs_requires === 2) {
      if (!inputValue1 || !inputValue2) {
        showToast("Debe ingresar el valor inicial y el valor final.", "error");
        return;
      }

      const v1 = Number(inputValue1);
      const v2 = Number(inputValue2);

      if (isNaN(v1) || isNaN(v2)) {
        showToast("Ambos valores deben ser numéricos.", "error");
        return;
      }

      if (v2 < v1) {
        showToast("El valor final debe ser mayor o igual al inicial.", "error");
        return;
      }
    }

    setIsSendingChecklist(true);
    
    const checkListDetailArray = Object.keys(checkItems).map((conceptId) => ({
      Id_checklistconcept: parseInt(conceptId, 10),
      Id_valuechecklistconcept: checkItems[conceptId],
      "Observations ": "NA", 
    }));

    const attachmentsArray = selectedImages.map((image) => ({
      Source_subtype: "I",
      File_name: image.fileName || `image_${Date.now()}.jpg`, 
      File_base64: image.base64, 
    }));

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); 
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`; 

    const checklistPayload = {
      Id_assignment: parseInt(idAssignment, 10), 
      Id_checklistform: parseInt(checklistForm.Id_checklistform, 10), 
      Id_vehicle: parseInt(vehicle.vehicleId, 10), 
      Id_costcenter: parseInt(idCostcenter, 10), 
      Date_checklist: formattedDate,
      Id_creator: parseInt(idUser, 10), 
      Comments: observations || "NA",
      CheckListDetail: checkListDetailArray,
      Attachments: attachmentsArray,
      Kilometer: inputValue1 ? Number(inputValue1) : null,
      Kilometer_end: inputValue2 ? Number(inputValue2) : null,
      Inputs_requires: checklistForm.Inputs_requires,
    };

    try {
      const result = await postChecklistVehiculo(checklistPayload, apiBase, apiKey);
      // Verificar que result.Mensaje existe antes de acceder a .Tipo
      if (result.Mensaje && result.Mensaje.Tipo == "E") {
        console.error("Error sending checklist:", result.Mensaje);
        showToast(
          result.Mensaje.Description || 
          result.message ||
          "Error al enviar el checklist, por favor consulte a su administrador",
          "error"
        );
        return; 
      }
      
      // Mostrar toast y actualizar lista
      showToast("✅ Checklist enviado exitosamente", "success", 3000);
      
      // Llamar callback para refrescar vehículos
      if (onChecklistComplete) {
        onChecklistComplete();
      }
      
      setCheckItems({});
      setObservations("");
      setSelectedImages([]);
      setExpandedItem(null);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      
      // Cerrar modal después de mostrar toast
      setTimeout(() => {
        handleClose();
      }, 2000); 
      
    } catch (error) {
      console.error("Error sending checklist:", error);
      showToast(
        `❌ Error al enviar: ${error.message || "Error desconocido"}`,
        "error",
        4000
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
        duration={toast.duration}
        onHide={hideToast}
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
              {/*
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>
                  {checklistForm?.Description || "Estado del Vehículo"}
                </Text>
              </View>
              */}
              {/* LinearGradient con imagen real del vehículo */}
              <LinearGradient
                colors={["#293e5d", "#17335C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.vehicleCard}
              >
                <View style={styles.vehicleIconContainer}>
                  {vehicle.fileUrlVehicleImage && !imageError ? (
                    <Image
                      source={{ uri: vehicle.fileUrlVehicleImage }}
                      style={styles.vehicleImage}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
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
                {/* Header con botón */}
                <View style={styles.cardCollapseHeader}>
                  <Text style={styles.uploadSubtitle}>
                    {(checklistForm?.Description?.length > 40
                    ? checklistForm.Description.substring(0, 40) + "..."
                    : checklistForm?.Description) || "Detalle formulario"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsChecklistExpanded(prev => !prev)}
                    style={styles.collapseButton}
                  >
                    <Ionicons
                      name={isChecklistExpanded ? "chevron-up" : "chevron-down"}
                      size={22}
                      color="#334155"
                    />
                  </TouchableOpacity>
                </View>

                {/* Contenido colapsable */}
                {isChecklistExpanded && (
                  <>
                    {checklistForm.ChecklistFormConcepts.map((concept) => (
                      <View
                        key={concept.Id_checklistconcept}
                        style={[
                          styles.checkItemContainer,
                          expandedItem === concept.Id_checklistconcept &&
                            styles.checkItemContainerActive
                        ]}
                      >
                        <Text style={styles.checkItemLabel}>{concept.Description}</Text>

                        <TouchableOpacity
                          style={[
                            styles.selectButton,
                            expandedItem === concept.Id_checklistconcept &&
                              styles.selectButtonActive
                          ]}
                          onPress={() => toggleDropdown(concept.Id_checklistconcept)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.statusText}>
                            {getSelectedValueDescription(concept.Id_checklistconcept)}
                          </Text>

                          <Ionicons
                            name={
                              expandedItem === concept.Id_checklistconcept
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={16}
                          />
                        </TouchableOpacity>

                        {expandedItem === concept.Id_checklistconcept && (
                          <View style={styles.dropdownContainer}>
                            {concept.Validvalues.map((value) =>
                              value.Description ? (
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
                                  <Text style={styles.dropdownTextNeutral}>
                                    {value.Description}
                                  </Text>
                                </TouchableOpacity>
                              ) : null
                            )}
                          </View>
                        )}
                      </View>
                    ))}

                    {/* Inputs_requires */}
                    {checklistForm.Inputs_requires === 1 && (
                      <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>
                          {checklistForm.Control_method === "H"
                            ? "Horómetro"
                            : "Kilómetros"}
                        </Text>
                        <TextInput
                          style={styles.numericInput}
                          keyboardType="numeric"
                          placeholder="Ingrese valor"
                          placeholderTextColor="#94a3b8"
                          value={inputValue1}
                          onChangeText={(text) =>
                            setInputValue1(text.replace(/[^0-9]/g, ""))
                          }
                        />
                      </View>
                    )}

                    {checklistForm.Inputs_requires === 2 && (
                      <View style={styles.doubleInputSection}>
                        <View style={styles.inputColumn}>
                          <Text style={styles.inputLabel}>
                            {checklistForm.Control_method === "H"
                              ? "Horómetro inicial"
                              : "Kilómetro inicial"}
                          </Text>
                          <TextInput
                            style={styles.numericInput}
                            keyboardType="numeric"
                            placeholder="Valor inicial"
                            placeholderTextColor="#94a3b8"
                            value={inputValue1}
                            onChangeText={(text) =>
                              setInputValue1(text.replace(/[^0-9]/g, ""))
                            }
                          />
                        </View>

                        <View style={styles.inputColumn}>
                          <Text style={styles.inputLabel}>
                            {checklistForm.Control_method === "H"
                              ? "Horómetro final"
                              : "Kilómetro final"}
                          </Text>
                          <TextInput
                            style={styles.numericInput}
                            keyboardType="numeric"
                            placeholder="Valor final"
                            placeholderTextColor="#94a3b8"
                            value={inputValue2}
                            onChangeText={(text) =>
                              setInputValue2(text.replace(/[^0-9]/g, ""))
                            }
                          />
                        </View>
                      </View>
                    )}

                    {/* Observaciones */}
                    <View style={styles.observations}>
                      <Text style={styles.observationsLabel}>Observaciones:</Text>
                      <TextInput
                        style={styles.observationsInput}
                        multiline
                        maxLength={500}
                        value={observations}
                        onChangeText={setObservations}
                        placeholder="Añadir observaciones..."
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </>
                )}
              </View>

              )}

              <View style={styles.uploadCard}>
                {/*<View style={styles.uploadHeader}>*/}
                <View style={styles.cardCollapseHeader}>
                  <Text style={styles.uploadSubtitle}>
                    {selectedImages.length}/3 fotos seleccionadas
                  </Text>

                  <TouchableOpacity
                    onPress={() => setIsUploadExpanded(prev => !prev)}
                    style={styles.collapseButton}
                  >
                    <Ionicons
                      name={isUploadExpanded ? "chevron-up" : "chevron-down"}
                      size={22}
                      color="#334155"
                    />
                  </TouchableOpacity>

                </View>

                {isUploadExpanded && (
                  <>

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
                      scrollEnabled={false}
                      
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
                    
                  </>
                )}



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
                  loading={isSendingChecklist}
                />
                <ActionButton
                  title="Cancelar"
                  iconName="close"
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
    backgroundColor: "#f8fafc", 
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
    paddingTop: 16, 
    paddingBottom: 8, 
    alignItems: "center",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "white", 
    ...Platform.select({
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
    zIndex: 10, 
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#cbd5e1", 
    borderRadius: 3,
    marginBottom: 8, 
  },
  closeButton: {
    position: "absolute",
    top: 12, 
    right: 16,
    width: 36, 
    height: 36,
    borderRadius: 18, 
    backgroundColor: "#f1f5f9", 
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30, 
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1", 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#4338ca", 
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
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Fondo semi-transparente
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  vehicleInfoContent: {
    flex: 1,
  },
  vehicleCardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  vehicleInfo: {
    color: "rgba(255,255,255,0.8)", 
    fontSize: 14,
    marginTop: 2,
  },
  checklistCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 18, 
    fontWeight: "700",
    color: "#1e293b", 
  },
  checkItemContainer: {
    marginBottom: 8,
    borderRadius: 12, 
    overflow: "hidden", 
    backgroundColor: "white", 
    borderWidth: 1,
    borderColor: "#e2e8f0", 
  },
  checkItemContainerActive: {
    borderColor: "#c7d2fe", 
  },
  checkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15, 
    paddingHorizontal: 16,
    backgroundColor: "white", 
  },
  checkItemActive: {
    backgroundColor: "#f8fafc", 
  },
  checkItemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
  },
  selectButtonActive: {
    borderColor: "#6366f1",
  },
  inputSection: {
    marginTop: 10,
  },
  doubleInputSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  inputColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  numericInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f8fafc",
    color: "#334155",
    fontSize: 15,
  },
  checkItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155", 
    flexShrink: 1, 
    marginRight: 8, 
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110, 
    backgroundColor: "#f1f5f9", 
    borderWidth: 1,
  },
  statusDefault: {
    borderColor: "#cbd5e1", 
  },
  statusGood: {
    borderColor: "#16a34a", 
  },
  statusRegular: {
    borderColor: "#d97706", 
  },
  statusBad: {
    borderColor: "#dc2626", 
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4, 
    color: "#334155", 
  },
  dropdownContainer: {
    backgroundColor: "#f8fafc", 
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 8, 
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16, 
    borderRadius: 10, 
    marginBottom: 4, 
    backgroundColor: "#ffffff", 
    borderWidth: 1,
    borderColor: "#e2e8f0", 
  },
  dropdownTextNeutral: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "500",
  },
  observations: {
    marginTop: 10, 
  },
  observationsLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
    color: "#334155",
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1", 
    borderRadius: 10,
    padding: 10,
    height: 90, 
    textAlignVertical: "top", 
    fontSize: 15,
    backgroundColor: "#f8fafc", 
    color: "#334155", 
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
    backgroundColor: "#f1f5f9", 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0", 
    borderStyle: "dashed", 
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#6366f1", 
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", 
    width: "100%",
    marginTop: 5, 
  },
  sendButton: {
    flex: 1, 
    marginRight: 8, 
  },
  cancelButton: {
    flex: 1, 
    marginLeft: 8, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4b5563", 
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2", 
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorTextMsg: {
    marginLeft: 10,
    color: "#b91c1c", 
    fontSize: 15,
    flexShrink: 1,
  },
  uploadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadTitle: {
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
  imageGridItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
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
    marginTop: 10, 
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
    alignItems: 'center',
  },
  imageSizeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardCollapseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  collapseButton: {
    padding: 6,
    borderRadius: 6,
  },
});

export default CheckList;
