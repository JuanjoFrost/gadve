import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  TextInput, // Added TextInput
  KeyboardAvoidingView, // Added KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MasInformacion from "./MasInformacion";
import CheckList from "../checklist/index";
import VehicleCard from "./VehicleCard";
import Toast from "./Toast";
// Import ActionButton - Asegúrate que la ruta sea correcta si está en otra carpeta
import ActionButton from "./ActionButton";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getMisAsignaciones,
  postAprobacionAsignacion,
  postDevolucionAsignacion,
} from "../api/urls";
import Footer from "./Footer";

const VehicleList = ({ userId, apiBase, apiKey }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true); // Para la carga inicial
  const [refreshing, setRefreshing] = useState(false); // Para "Pull to Refresh"
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalVisibleCheckList, setModalVisibleCheckList] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  // State for the rejection comment modal
  const [isRejectionCommentModalVisible, setIsRejectionCommentModalVisible] =
    useState(false);
  const [rejectionComment, setRejectionComment] = useState("");
  const [currentRejectionData, setCurrentRejectionData] = useState({
    id: null,
    licensePlate: null,
  });

  const mapApiDataToVehicle = (apiItem) => {
    let status = "available";
    // let actions = ["viewMore"]; // Ignorando 'actions' según la instrucción

    // Helper function to determine if checklist is required for the current day
    const isChecklistRequiredToday = (item) => {
      // Regla 1: Si Requires_checklist_daily es "N", el botón nunca aparece.
      if (item.Requires_checklist_daily === "N") {
        return false;
      }

      // Si llegamos aquí, Requires_checklist_daily es "S".
      // Ahora verificamos el flag del día específico.
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6

      switch (dayOfWeek) {
        case 0: // Sunday
          return item.Requires_checklist_sunday === "S";
        case 1: // Monday
          return item.Requires_checklist_monday === "S";
        case 2: // Tuesday
          return item.Requires_checklist_tuesday === "S";
        case 3: // Wednesday
          return item.Requires_checklist_wednesday === "S";
        case 4: // Thursday
          return item.Requires_checklist_thursday === "S";
        case 5: // Friday
          return item.Requires_checklist_friday === "S";
        case 6: // Saturday
          return item.Requires_checklist_saturday === "S";
        default:
          // Este caso no debería alcanzarse si getDay() siempre devuelve 0-6
          return false;
      }
    };

    const displayChecklistButton = isChecklistRequiredToday(apiItem);

    if (apiItem.Requires_approval === "S") {
      if (apiItem.Approval_status_assignment === "P") {
        status = "approval";
        // actions.push("approve", "reject"); // Ignorando 'actions'
      } else if (apiItem.Approval_status_assignment === "A") {
        status = "checklist"; // Or a more descriptive status like "approved_ready"
        // actions.push("return"); // Ignorando 'actions'
        // if (displayChecklistButton) { // Lógica de 'actions' ignorada
        //   actions.push("doChecklist");
        // }
      } else if (apiItem.Approval_status_assignment === "R") {
        status = "rejected";
      }
    } else { // No approval required
      status = "checklist"; // Or a more descriptive status
      // actions.push("return"); // Ignorando 'actions'
      // if (displayChecklistButton) { // Lógica de 'actions' ignorada
      //   actions.push("doChecklist");
      // }
    }

    // Mantener el array 'actions' original si es necesario para otras funcionalidades
    // o definirlo según la lógica que no se debe tocar.
    // Por ahora, lo dejaré como estaba antes de tu instrucción de ignorarlo,
    // pero la lógica de 'doChecklist' no se añadirá aquí.
    let originalActions = ["viewMore"];
     if (apiItem.Requires_approval === "S") {
      if (apiItem.Approval_status_assignment === "P") {
        originalActions.push("approve", "reject");
      } else if (apiItem.Approval_status_assignment === "A") {
        originalActions.push("return");
        // No se añade 'doChecklist' aquí basado en la instrucción de ignorar 'actions'
        // para esta lógica específica.
      }
    } else {
      originalActions.push("return");
       // No se añade 'doChecklist' aquí.
    }


    return {
      id: apiItem.Id_assignment.toString(),
      vehicleId: apiItem.Id_vehicle,
      licensePlate: apiItem.License_plate,
      type: apiItem.Description,
      chasisNumber: apiItem.Chasis_number,
      motorNumber: apiItem.Motor_number,
      model: apiItem.Model_description,
      year: apiItem.Year_model,
      idCostcenter: apiItem.Id_costcenter,
      costcenterCode: apiItem.Costcenter_code,
      status: status,
      actions: originalActions, // Usando el array 'actions' original o modificado según otras reglas
      requiresApproval: apiItem.Requires_approval,
      approvalStatusAssignment: apiItem.Approval_status_assignment,
      
      // Campos de la API para determinar la visibilidad del botón de checklist
      requiresChecklistDaily: apiItem.Requires_checklist_daily,
      requiresChecklistMonday: apiItem.Requires_checklist_monday,
      requiresChecklistTuesday: apiItem.Requires_checklist_tuesday,
      requiresChecklistWednesday: apiItem.Requires_checklist_wednesday,
      requiresChecklistThursday: apiItem.Requires_checklist_thursday,
      requiresChecklistFriday: apiItem.Requires_checklist_friday,
      requiresChecklistSaturday: apiItem.Requires_checklist_saturday,
      requiresChecklistSunday: apiItem.Requires_checklist_sunday,
      
      // Nueva propiedad para controlar la visibilidad del botón de checklist
      displayChecklistButton: displayChecklistButton,

      checklistBeginDate: apiItem.Checklist_begin_date,
      idChecklistForm: apiItem.Id_checklistform,
      markDescription: apiItem.Mark_description,
      dateAssignment: apiItem.Date_assignment,
      colorDescription: apiItem.Color_description,
      rateCode: apiItem.Rate_code,
      rateName: apiItem.Rate_name,
      hourlyPrice: apiItem.Hourly_price,
      dailyPrice: apiItem.Daily_price,
      dateReturning: apiItem.Date_returning,
      timeReturning: apiItem.Time_returning,
      possibleDateReturn: apiItem.Possible_date_return,
      possibleTimeReturn: apiItem.Possible_time_return,
    };
  };

  const loadData = async () => {
    // setLoading(true); // Esto es para la carga inicial, no para el refresh
    try {
      const apiResponse = await getMisAsignaciones({
        apiBase: apiBase,
        apiKey: apiKey,
        idUsuario: userId,
      });

      const dataToMap = apiResponse.Data || apiResponse;

      if (Array.isArray(dataToMap)) {
        const mappedVehicles = dataToMap.map(mapApiDataToVehicle);
        setVehicles(mappedVehicles);
      } else {
        console.error("La respuesta de la API no es un array:", dataToMap);
        setVehicles([]);
        Alert.alert(
          "Error de Datos",
          "No se pudo procesar la información de vehículos."
        );
      }
    } catch (error) {
      console.error("Error al cargar los vehículos desde la API:", error);
      Alert.alert(
        "Error de Carga",
        "No se pudieron cargar los vehículos. Intenta de nuevo más tarde."
      );
      setVehicles([]);
    } finally {
      // setLoading(false); // Esto es para la carga inicial
      // setRefreshing(false); // Asegurarse de que refreshing se maneje en onRefresh
    }
  };

  // Función para la carga inicial de datos
  const initialLoadData = async () => {
    setLoading(true);
    await loadData(); // Llama a la función de carga común
    setLoading(false);
  };

  useEffect(() => {
    if (userId && apiBase && apiKey) {
      initialLoadData(); // Llama a la función de carga inicial
    } else {
      Alert.alert(
        "Error",
        "Faltan datos para cargar vehículos (usuario, apiBase o apiKey)."
      );
      setLoading(false);
    }
  }, [userId, apiBase, apiKey]);


  // Función para manejar el "Pull to Refresh"
  const onRefresh = async () => {
    setRefreshing(true); // Activa el indicador de carga del refresh
    await loadData(); // Llama a la función que carga los datos
    setRefreshing(false); // Desactiva el indicador una vez que los datos se han cargado
  };

  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalVisible(true);
  };

  const onOpenModalCheckList = (vehicle) => {
    if (modalVisible) {
      setModalVisible(false);
    }
    setTimeout(
      () => {
        setSelectedVehicle(vehicle);
        setModalVisibleCheckList(true);
      },
      Platform.OS === "ios" ? 300 : 100
    );
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const closeModalCheckList = () => {
    setModalVisibleCheckList(false);
    setSelectedVehicle(null);
  };

  const _performRejection = async (idAssignment, comments, licensePlate) => {
    try {
      await postAprobacionAsignacion({
        apiBase,
        apiKey,
        Id_assignment: idAssignment,
        Approval_status_assignment: "R", // R for Reject
        Approval_comments_assignment: comments,
      });

      setToast({
        visible: true,
        message: `Vehículo ${licensePlate} rechazado correctamente.`,
        type: "success",
      });

      await loadData();
      closeModal();
    } catch (error) {
      console.error("Error al rechazar el vehículo:", error);
      setToast({
        visible: true,
        message: `Error al rechazar: ${error.message || "Error desconocido."}`,
        type: "error",
      });
    }
  };

  const openRejectionCommentModal = (idAssignment, licensePlate) => {
    setCurrentRejectionData({ id: idAssignment, licensePlate });
    setIsRejectionCommentModalVisible(true);
  };

  const closeRejectionCommentModal = () => {
    setIsRejectionCommentModalVisible(false);
    setRejectionComment(""); // Clear comment
    setCurrentRejectionData({ id: null, licensePlate: null });
  };

  const handleRejectionCommentSubmit = () => {
    if (!rejectionComment || rejectionComment.trim() === "") {
      Alert.alert(
        "Comentario Requerido",
        "Debes ingresar un motivo para rechazar la entrega del vehículo."
      );
      return;
    }
    _performRejection(
      currentRejectionData.id,
      rejectionComment,
      currentRejectionData.licensePlate
    );
    closeRejectionCommentModal();
  };

  const rejectVehicle = (idAssignment) => {
    const vehicleToRejectDetails = vehicles.find((v) => v.id === idAssignment);
    const licensePlateForAlert = vehicleToRejectDetails
      ? vehicleToRejectDetails.licensePlate
      : idAssignment;

    Alert.alert(
      "Confirmar Rechazo",
      `¿Estás seguro de que deseas rechazar el vehículo ${licensePlateForAlert}?`,
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Rechazo cancelado por el usuario."),
          style: "cancel",
        },
        {
          text: "Rechazar",
          onPress: () => {
            // Open the custom modal to get comments for all platforms
            openRejectionCommentModal(idAssignment, licensePlateForAlert);
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const returnVehicle = async (idAssignment) => {
    // vehicleId es en realidad idAssignment
    const vehicleToReturnDetails = vehicles.find((v) => v.id === idAssignment);
    const licensePlateForAlert = vehicleToReturnDetails
      ? vehicleToReturnDetails.licensePlate
      : "este vehículo";

    Alert.alert(
      "Confirmar Devolución",
      `¿Estás seguro de que deseas devolver ${licensePlateForAlert}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Devolver",
          onPress: async () => {
            try {
              const now = new Date();
              const day = String(now.getDate()).padStart(2, "0");
              const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
              const year = now.getFullYear();
              const hours = String(now.getHours()).padStart(2, "0");
              const minutes = String(now.getMinutes()).padStart(2, "0");

              const dateReturning = `${day}-${month}-${year}`;
              const timeReturning = `${hours}:${minutes}`;

              await postDevolucionAsignacion({
                apiBase,
                apiKey,
                Id_assignment: parseInt(idAssignment, 10), // Asegurarse que sea número si la API lo espera así
                Date_returning: dateReturning,
                Time_returning: timeReturning,
              });

              setToast({
                visible: true,
                message: `Vehículo ${licensePlateForAlert} devuelto correctamente.`,
                type: "success",
              });

              await loadData(); // Recargar la lista de vehículos
              closeModal(); // Cerrar el modal de MasInformacion si estaba abierto
            } catch (error) {
              console.error("Error al devolver el vehículo:", error);
              setToast({
                visible: true,
                message: `Error al devolver: ${
                  error.message || "Error desconocido."
                }`,
                type: "error",
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const approveVehicle = async (idAssignment) => {
    const vehicleToApproveDetails = vehicles.find((v) => v.id === idAssignment);
    const licensePlateForAlert = vehicleToApproveDetails
      ? vehicleToApproveDetails.licensePlate
      : idAssignment;
    console.log(
      `--- VEHICLELIST: approveVehicle INVOCADA con vehicleToApproveDetails: ${JSON.stringify(
        vehicleToApproveDetails
      )} ---`
    );
    console.log(
      `--- VEHICLELIST: approveVehicle INVOCADA con idAssignment: ${idAssignment} ---`
    );

    if (typeof idAssignment === "undefined" || idAssignment === null) {
      Alert.alert("Error de Datos", "ID de asignación inválido para aprobar.");
      return;
    }

    Alert.alert(
      "Confirmar Aprobación",
      `¿Estás seguro de que deseas aprobar el vehículo ${licensePlateForAlert}?`,
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Aprobación cancelada por el usuario."),
          style: "cancel",
        },
        {
          text: "Aprobar",
          onPress: async () => {
            console.log(`Usuario confirmó aprobación para ID: ${idAssignment}`);
            try {
              console.log(
                `Intentando aprobar asignación con ID: ${idAssignment}`
              );
              await postAprobacionAsignacion({
                apiBase,
                apiKey,
                Id_assignment: idAssignment,
                Approval_status_assignment: "A",
                Approval_comments_assignment: "",
              });
              setToast({
                visible: true,
                message: `Vehículo ${licensePlateForAlert} aprobado correctamente.`,
                type: "success",
              });
              await loadData();
              closeModal();
            } catch (error) {
              console.error("Error al aprobar el vehículo:", error);
              setToast({
                visible: true,
                message: `Error al aprobar: ${
                  error.message || "Error desconocido."
                }`,
                type: "error",
              });
            }
          },
          style: "default",
        },
      ],
      { cancelable: true }
    );
  };

  if (loading && !vehicles.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#673AB7" />
        <Text style={styles.loadingText}>Cargando vehículos...</Text>
      </View>
    );
  }

  if (!vehicles.length && !loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="information-circle-outline" size={48} color="#673AB7" />
        <Text style={styles.loadingText}>No tienes vehículos asignados.</Text>
      </View>
    );
  }

  // Filter vehicles to exclude those with approvalStatusAssignment === "R"
  const displayVehicles = vehicles.filter(
    (vehicle) => vehicle.approvalStatusAssignment !== "R"
  );

  if (!displayVehicles.length && !loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.carIcon}>
          <Ionicons name="car-sport" size={30} color="#fff" />
        </View>
        <Text style={styles.loadingText}>
          No hay vehículos disponibles para mostrar.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.header}>
        <Ionicons name="car-sport" size={24} color="#4A6FE3" />
        <Text style={styles.headerTitle}>Mis Vehículos</Text>
      </View>
      <FlatList
        data={displayVehicles} 
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
        // Props para Pull to Refresh
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        {selectedVehicle && (
          <MasInformacion
            vehicle={selectedVehicle}
            onClose={closeModal}
            onApprove={approveVehicle}
            onReturn={returnVehicle}
            onReject={rejectVehicle}
            apiBase={apiBase}
            apiKey={apiKey}
            onOpenModalCheckList={() => {
              closeModal();
              setTimeout(
                () => {
                  onOpenModalCheckList(selectedVehicle);
                },
                Platform.OS === "ios" ? 300 : 100
              );
            }}
          />
        )}
      </Modal>
      <Modal
        visible={modalVisibleCheckList}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModalCheckList}
      >
        {selectedVehicle && (
          <CheckList
            apiBase={apiBase}
            apiKey={apiKey}
            idChecklistForm={selectedVehicle.idChecklistForm}
            vehicle={selectedVehicle}
            onClose={closeModalCheckList}
            idUser={userId}
          />
        )}
      </Modal>

      {/* Rejection Comment Modal */}
      <Modal
        visible={isRejectionCommentModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeRejectionCommentModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.commentModalContainer}>
            <Text style={styles.commentModalTitle}>Motivo de Rechazo</Text>
            <Text style={styles.commentModalSubtitle}>
              Vehículo: {currentRejectionData.licensePlate || "N/A"}
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Ingresa el motivo (obligatorio)..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={rejectionComment}
              onChangeText={setRejectionComment}
              autoFocus={true}
              maxLength={250}
            />
            <View style={styles.commentModalButtons}>
              <ActionButton
                title="Cancelar"
                iconName="cancel" // MaterialIcons
                colors={["#868e96", "#52585D"]} // Shades of grey
                onPress={closeRejectionCommentModal}
                style={styles.commentModalActionButton} // Apply flex style
              />
              <ActionButton
                title="Rechazar"
                iconName="send" // MaterialIcons
                colors={["#e03131", "#c92a2a"]} // Shades of red
                onPress={handleRejectionCommentSubmit}
                style={styles.commentModalActionButton} // Apply flex style
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  carIcon: {
    // Style for the new empty state icon background
    width: 70,
    height: 70,
    borderRadius: 35, // Makes it a circle
    backgroundColor: "#673AB7", // App's purple color
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16, // Space before the text
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3, // Elevation for Android shadow
  },
  listContainer: {
    paddingBottom: 60,

  },
  // Estilos para el Modal de Comentario de Rechazo
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  commentModalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  commentModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  commentModalSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  commentInput: {
    width: "100%",
    minHeight: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top", // Para Android
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  commentModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between", // This will space out the ActionButtons
    width: "100%",
    marginTop: 10, // Added some margin top for spacing
  },
  commentModalActionButton: {
    // New style for ActionButton wrapper if needed, or apply directly
    flex: 1, // This will make buttons take equal width
    // ActionButton has internal marginHorizontal: 5, so they will have space between them
    // Adjust if ActionButton's internal styles conflict or don't provide enough spacing
  },
  // Remove or comment out old button styles if no longer used elsewhere
  // commentModalButton: {
  //   flex: 1,
  //   paddingVertical: 12,
  //   borderRadius: 8,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   marginHorizontal: 5,
  // },
  // cancelButton: {
  //   backgroundColor: '#6c757d',
  // },
  // submitButton: {
  //   backgroundColor: '#dc3545',
  // },
  // commentModalButtonText: {
  //   color: 'white',
  //   fontWeight: 'bold',
  //   fontSize: 16,
  // },
  // ... (resto de tus estilos)
});

export default VehicleList;
