export async function getMisAsignaciones({ apiBase, apiKey, idUsuario }) {
  // Construye la URL, asegurándose de que apiBase no tenga una barra al final
  // y que idUsuario se concatene correctamente.
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/AsignacionVehiculo/GetMisAsignaciones/${idUsuario}`;

  const response = await fetch(url, {
    method: "GET", 
    headers: {
        // Corrected: headers should be a flat object
        "Content-Type": "application/json"
    },
  });


  if (!response.ok) {
    throw new Error(`Error al obtener asignaciones: ${response.status}`);
  }

  const data = await response.json();
  return data; 
}

export async function getVehiculo({ apiBase, apiKey, idVehiculo }) {
  // Construye la URL, asegurándose de que apiBase no tenga una barra al final
  // y que idVehiculo se concatene correctamente.
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/Vehiculo/GetVehiculo/${idVehiculo}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("URL GetVehiculo:", url);

  if (!response.ok) {
    throw new Error(`Error al obtener el vehículo: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function getDetalleAsignacion({ apiBase, apiKey, idAssignment }) {
  // Construye la URL, asegurándose de que apiBase no tenga una barra al final
  // y que idAssignment se concatene correctamente.
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/AsignacionVehiculo/GetDetalleAsignacion/${idAssignment}`;


  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el detalle de la asignación: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function getFormularioChecklist({ apiBase, apiKey, idChecklistForm }) {
  // Construye la URL
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/FormularioCheckList/GetFormularioChecklist/${idChecklistForm}`;

  console.log("URL GetFormularioChecklist:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });


  if (!response.ok) {
    throw new Error(`Error al obtener el formulario de checklist: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function postAprobacionAsignacion({
  apiBase,
  apiKey,
  Id_assignment,
  Approval_status_assignment,
  Approval_comments_assignment
}) {
  // Construye la URL
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/AsignacionVehiculo/PostAprobacionAsignacion`;

  const payload = {
    Id_assignment,
    Approval_status_assignment,
    Approval_comments_assignment,
  };


  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any other necessary headers, like an Authorization token if required
    },
    body: JSON.stringify(payload), // Send the structured payload
  });

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch (e) {
      // Ignore if error response is not JSON
    }
    console.error("Error Body PostAprobacionAsignacion:", errorBody);
    throw new Error(
      `Error al enviar la aprobación/rechazo de la asignación: ${response.status} ${response.statusText}${errorBody ? ` - ${JSON.stringify(errorBody)}` : ''}`
    );
  }

  if (response.status === 204) {
    return null; 
  }

  const data = await response.json();
  return data;
}

export async function postDevolucionAsignacion({
  apiBase,
  apiKey,
  Id_assignment,
  Date_returning,
  Time_returning
}) {
  // Construye la URL
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/AsignacionVehiculo/PostDevolucionAsignacion`;

  const payload = {
    Id_assignment,
    Date_returning,
    Time_returning,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any other necessary headers, like an Authorization token if required
    },
    body: JSON.stringify(payload),
  });

  console.log("Response PostDevolucionAsignacion Status:", response.status);

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch (e) {
      // Ignore if error response is not JSON
    }
    console.error("Error Body PostDevolucionAsignacion:", errorBody);
    throw new Error(
      `Error al enviar la devolución de la asignación: ${response.status} ${response.statusText}${errorBody ? ` - ${JSON.stringify(errorBody)}` : ''}`
    );
  }

  // Handle cases where the response might be empty (e.g., 204 No Content)
  if (response.status === 204) {
    return null; 
  }

  const data = await response.json();
  return data;
}

export async function postChecklistVehiculo(payload, apiBase, apiKey) {
  // Construye la URL
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/ChecklistVehiculo/PostChecklistVehiculo`;

  console.log("URL PostChecklistVehiculo:", url);
  console.log("Payload being sent:", JSON.stringify(payload, null, 2));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any other necessary headers, like an Authorization token if required
    },
    body: JSON.stringify(payload),
  });

  console.log("Response PostChecklistVehiculo Status:", response.status);
  console.log("Response PostChecklistVehiculo Headers:", Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    let errorBody = null;
    let rawErrorText = null;
    
    try {
      // Primero intenta obtener el texto plano
      rawErrorText = await response.text();
      console.log("Raw error response:", rawErrorText);
      
      // Luego intenta parsearlo como JSON
      if (rawErrorText.trim().startsWith('{')) {
        errorBody = JSON.parse(rawErrorText);
      }
    } catch (e) {
      console.error("Error parsing response body:", e);
      console.log("Raw response was:", rawErrorText);
    }
    
    console.error("Error Body PostChecklistVehiculo:", errorBody);
    throw new Error(
      `Error al enviar el checklist del vehículo: ${response.status} ${response.statusText}${rawErrorText ? ` - ${rawErrorText.substring(0, 500)}` : ''}`
    );
  }

  // Handle cases where the response might be empty (e.g., 204 No Content)
  if (response.status === 204) {
    return { success: true, message: "Checklist enviado exitosamente" };
  }

  const data = await response.json();
  console.log("Response Data PostChecklistVehiculo:", data);
  
  // Log individual payload fields for debugging
  console.log("Payload details:", {
    Id_assignment: payload.Id_assignment,
    Id_checklistform: payload.Id_checklistform,
    Id_vehicle: payload.Id_vehicle,
    Id_costcenter: payload.Id_costcenter,
    Date_checklist: payload.Date_checklist,
    Id_creator: payload.Id_creator,
    CheckListDetail: payload.CheckListDetail,
    Comments: payload.Comments,
    AttachmentsCount: payload.Attachments ? payload.Attachments.length : 0
  });

  return data;
}

