export async function getEmpresas() {
  const response = await fetch("https://apiclientes.gadve.cl/A7XK9L2QW8RMZ5TV3YJG/cliente/GetClientes");
  if (!response.ok) throw new Error("Error al obtener empresas");
  const data = await response.json();
  return data.Data; 
}

export async function postLogin({ apiBase, apiKey, usuario, clave }) {
  const url = `${apiBase.replace(/\/$/, "")}/Api/${apiKey}/Account/PostLogin`;
  const body = JSON.stringify({
    Email: usuario,
    Password: clave,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) throw new Error("Error en el login");

  const data = await response.json();
  return data;
}