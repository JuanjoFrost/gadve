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

export async function postChecklistVehiculo({
  apiBase,
  apiKey,
  Id_assignment,
  Id_checklistform,
  Id_vehicle,
  Id_costcenter,
  Date_checklist,
  Id_creator,
  CheckListDetail,
  Comment,
  Attachments
}) {
  // Construye la URL
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/ChecklistVehiculo/PostChecklistVehiculo`;

  const payload = {
    Id_assignment,
    Id_checklistform,
    Id_vehicle,
    Id_costcenter,
    Date_checklist,
    Id_creator,
    CheckListDetail,
    Attachments,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any other necessary headers, like an Authorization token if required
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch (e) {
      // Ignore if error response is not JSON
    }
    console.error("Error Body PostChecklistVehiculo:", errorBody);
    throw new Error(
      `Error al enviar el checklist del vehículo: ${response.status} ${response.statusText}${errorBody ? ` - ${JSON.stringify(errorBody)}` : ''}`
    );
  }

  // Handle cases where the response might be empty (e.g., 204 No Content)
  if (response.status === 204) {
    return null; 
  }

  const data = await response.json();
  return data;
}

