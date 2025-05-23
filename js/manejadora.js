const modificarBoton = document.getElementById("btnModificar");
const btnExportar = document.getElementById("exportarCSVBtn");
const btnModoOscuro = document.getElementById("modoOscuroBtn");
const filtrarBtn = document.getElementById("btnFiltrar");
const btnEstadisticas = document.getElementById("btnEstadisticas");
const btnOrdenar = document.getElementById("btnOrdenar");
const limpiarFiltros = document.getElementById("btnLimpiar");
let pinturas = [];
let ordenInicial = true; // Estado inicial
const body = document.getElementById("body");


//   Al cargar el DOM, se muestra la lista de pinturas.
//   Maneja el reinicio del formulario eliminando clases de validación y mensajes.
//   Agrega funcionalidades para:
//   Agregar y modificar pinturas.
//   Filtrar y ordenar la lista de pinturas.
//   Mostrar estadísticas como total, promedio, más cara y marca más frecuente.
//   Limpiar filtros y restablecer la vista completa.
//   Exportar los datos a un archivo CSV descargable.
//  
document.addEventListener("DOMContentLoaded", () => {
  mostrarPinturas();
  //Utiliza boton reset para limpiar formulario
  document
    .getElementById("frmFormulario")
    .addEventListener("reset", function () {
      const campos = this.querySelectorAll(".form-control");

      campos.forEach((campo) => {
        campo.classList.remove("is-valid", "is-invalid");
      });

      const feedbacks = this.querySelectorAll(
        ".invalid-feedback, .valid-feedback"
      );

      feedbacks.forEach((fb) => {
        fb.innerHTML = "";
      });
    });

  document
    .getElementById("frmFormulario")
    .addEventListener("submit", agregarPintura);

  modificarBoton.addEventListener("click", modificarPintura);

  filtrarBtn.addEventListener("click", filtrar);
  btnEstadisticas.addEventListener("click", totalPinturas);
  btnEstadisticas.addEventListener("click", obtenerMarcaMasFrecuente);
  btnEstadisticas.addEventListener("click", obtenerPinturaMasCara);
  btnEstadisticas.addEventListener("click", obtenerPromedioGeneral);
  btnEstadisticas.addEventListener("click", obtenerPromedioPorMarca);
  limpiarFiltros.addEventListener("click", mostrarPinturas);
  btnOrdenar.addEventListener("click", cambiarOrden);

  btnExportar.addEventListener("click", () => {
    const csv = convertirACSV(pinturas);
    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob); 
    const a = document.createElement("a"); 

    a.href = url;
    a.download = "pinturas.csv";
    a.click();

    URL.revokeObjectURL(url); 
  });

  // Control del modo oscuro:
// Verifica si el modo oscuro está activado en localStorage y lo aplica si es así
  const modoOscuroActivo = localStorage.getItem("modo-oscuro") === "true";
  if (modoOscuroActivo) {
    body.classList.add("dark-mode");
    btnModoOscuro.textContent = "Modo Claro";
    btnModoOscuro.classList.remove("btn-outline-dark");
    btnModoOscuro.classList.add("btn-outline-light");
  }

  // Alterna el modo oscuro al hacer clic en el botón
  btnModoOscuro.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    const activado = body.classList.contains("dark-mode");
    localStorage.setItem("modo-oscuro", activado);

    btnModoOscuro.textContent = activado ? "Modo Claro" : "Modo Oscuro";
    btnModoOscuro.classList.toggle("btn-outline-dark", !activado);
    btnModoOscuro.classList.toggle("btn-outline-light", activado);
  });
});

// Función para obtener y mostrar las pinturas desde la API
// - Realiza una solicitud fetch a la URL indicada.
// - Convierte la respuesta en JSON y la guarda en la variable global 'pinturas'.
// - Luego llama a 'cargarDatos' para mostrarlas en la interfaz.
// - Si ocurre un error, muestra un alert y lo registra en la consola.
async function mostrarPinturas() {
  try {
    const respuesta = await fetch(
      "https://utnfra-api-pinturas.onrender.com/pinturas"
    );
    const datos = await respuesta.json();
    pinturas = datos;

    cargarDatos(pinturas);
  } catch (error) {
    alert("Error al cargar pinturas");
    console.log(error);
  }
}

// Función que carga y muestra la tabla de pinturas en la interfaz
// - Muestra un spinner de carga mientras se procesan los datos.
// - Después de 0.5 segundos, genera una tabla HTML con la información de cada pintura.
// - Cada fila muestra: ID, Marca, Precio, Color, Cantidad y Acciones (eliminar/editar).
// - Los botones tienen iconos, etiquetas de accesibilidad y funcionalidad para eliminar o editar una pintura.
const cargarDatos = (arr) => {
  const spinner = `<div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </div>`;

  const divLista = document.getElementById("divListado");

  // Mostrar el spinner inmediatamente
  divLista.innerHTML = spinner;

  // Retrasar la carga de los datos (medio segundo en este ejemplo)
  setTimeout(() => {
    let tabla = `<div class="table-responsive">`;
    tabla += `<table class="table table-hover table-bordered table-striped align-middle shadow-sm rounded" aria-describedby="descripcionTabla">
                <caption id="descripcionTabla" class="text-start">Listado de pinturas disponibles</caption>
                <thead class="table-primary text-center">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Marca</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Color</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>`;

    arr.forEach((dato) => {
      tabla += `<tr>
                  <td class="text-center">
                    ${dato.id}
                  </td>
                  <td class="text-capitalize text-center">${dato.marca}</td>
                  <td class="text-center">$${dato.precio}</td>
                  <td class="text-center">
                    <input type="color" value="${dato.color}" disabled aria-label="Color: ${dato.color}" style="border: none; background: transparent; width: 40px; height: 30px; cursor: default;">
                  </td>
                  <td class="text-center">${dato.cantidad}</td>
                  <td class="text-center">
                    <button type="button" class="btn btn-danger btn-sm me-1" onclick="eliminarPintura(${dato.id})" title="Eliminar pintura con ID ${dato.id}" aria-label="Eliminar pintura con ID ${dato.id}">
                      <i class="bi bi-trash"></i>
                    </button>
                    <a href="#section-formulario">
                    <button type="button" class="btn btn-primary btn-sm" onclick="seleccionarPintura(${dato.id})" title="Editar pintura con ID ${dato.id}" aria-label="Editar pintura con ID ${dato.id}">
                      <i class="bi bi-pencil-square"></i>
                      </button>
                      </a>
                  </td>
                </tr>`;
    });

    tabla += `</tbody></table></div>`;

    // Reemplazar el spinner con la tabla
    divLista.innerHTML = tabla;
  }, 500); // 500ms = 0.5 segundos
};

//retorna un array con las pinturas
async function cargarPinturas() {
  try {
    const respuesta = await fetch(
      `https://utnfra-api-pinturas.onrender.com/pinturas`
    );
    const datos = respuesta.json();
    if (respuesta.ok) {
      return datos;
    } else {
      alert("Error en pintura");
    }
  } catch (error) {
    alert("Error al eliminar pintura");
    console.log(error);
  }
  return [];
}

// Función que agrega una nueva pintura usando la API
// - Previene el comportamiento por defecto del formulario.
// - Valida el formulario; si no es válido, detiene la ejecución.
// - Obtiene los datos ingresados y los envía en una solicitud POST a la API.
// - Si la respuesta es exitosa, recarga la lista de pinturas y limpia el formulario.
// - Si falla, muestra un mensaje de error al usuario y lo registra en consola.
async function agregarPintura(e) {
  e.preventDefault();

  if (!validarFormulario()) return;

  const pintura = obtenerDatosFormulario();

  try {
    const respuesta = await fetch(
      "https://utnfra-api-pinturas.onrender.com/pinturas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pintura),
      }
    );
    if (respuesta.ok) {
      mostrarPinturas();
      limpiarForm();
    } else {
      alert("Error nashe");
    }
  } catch (error) {
    alert("Error al agregar el pintura");
    console.log(error);
  }
}

// Función que limpia todos los campos del formulario
// - Restablece los valores de los inputs a su estado inicial
// - El color se reinicia a blanco por defecto ("#ffff")
function limpiarForm() {
  document.getElementById("inputID").value = "";
  document.getElementById("inputMarca").value = "";
  document.getElementById("inputPrecio").value = "";
  document.getElementById("inputColor").value = "#ffff";
  document.getElementById("inputCantidad").value = "";
}
// Función que obtiene y devuelve un objeto con los datos del formulario
// - Si el campo ID está vacío, asigna un valor basado en la marca de tiempo actual (Date.now).
// - Convierte precio a número decimal y cantidad a entero para asegurar el tipo correcto.
function obtenerDatosFormulario() {
  const id = document.getElementById("inputID").value || Date.now;
  const marca = document.getElementById("inputMarca").value;
  const precio = parseFloat(document.getElementById("inputPrecio").value);
  const color = document.getElementById("inputColor").value;
  const cantidad = parseInt(document.getElementById("inputCantidad").value);

  return { id, marca, precio, color, cantidad };
}

// Función para validar los campos del formulario antes de enviar:
// - Obtiene referencias a los inputs y sus valores, limpiando espacios en blanco.
// - Inicializa variable 'valido' como true; será false si alguna validación falla.
// - Limpia las clases de error ("is-invalid") de todos los inputs antes de validar.
// - Valida que la marca no esté vacía, mostrando mensajes y aplicando clases CSS.
// - Valida que el precio sea un número entre 50 y 500.
// - Valida que el color tenga algún valor (no esté vacío).
// - Valida que la cantidad sea un número entre 1 y 400.
// - Actualiza los mensajes de feedback según cada caso (válido o inválido).
// - Devuelve true si todas las validaciones pasan, o false si alguna falla.
function validarFormulario() {
  const inputMarca = document.getElementById("inputMarca");
  const inputPrecio = document.getElementById("inputPrecio");
  const inputColor = document.getElementById("inputColor");
  const inputCantidad = document.getElementById("inputCantidad");

  const marca = inputMarca.value.trim();
  const precio = parseFloat(inputPrecio.value);
  const color = inputColor.value.trim();
  const cantidad = parseInt(inputCantidad.value);

  let valido = true;

  // Limpiar clases de error
  [inputMarca, inputPrecio, inputColor, inputCantidad].forEach((element) => {
    element.classList.remove("is-invalid");
  });

  // Validaciones
  if (!marca) {
    inputMarca.classList.add("is-invalid");
    inputMarca.classList.remove("is-valid");
    let error = document.getElementById("feedbackMarca");
    error.innerHTML = "La marca es requerida, no puede estar vacía";
    valido = false;
  } else {
    inputMarca.classList.remove("is-invalid");
    inputMarca.classList.add("is-valid");
    let correcto = document.getElementById("feedbackMarca");
    correcto.innerHTML = "¡Marca válida!";
  }

  if (isNaN(precio) || precio < 50 || precio > 500) {
    inputPrecio.classList.add("is-invalid");
    inputPrecio.classList.remove("is-valid");
    let error = document.getElementById("feedbackPrecio");
    error.innerHTML = "El precio debe ser válido entre 50 y 500";
    valido = false;
  } else {
    inputPrecio.classList.remove("is-invalid");
    inputPrecio.classList.add("is-valid");
    let correcto = document.getElementById("feedbackPrecio");
    correcto.innerHTML = "¡Precio válido!";
  }

  if (!color) {
    inputColor.classList.add("is-invalid");
    valido = false;
  }

  if (isNaN(cantidad) || cantidad < 1 || cantidad > 400) {
    inputCantidad.classList.add("is-invalid");
    inputCantidad.classList.remove("is-valid");
    let error = document.getElementById("feedbackCant");
    error.innerHTML = "La cantidad debe ser entre 1 y 400";
    valido = false;
  } else {
    inputCantidad.classList.remove("is-invalid");
    inputCantidad.classList.add("is-valid");
    let correcto = document.getElementById("feedbackCant");
    correcto.innerHTML = "¡Cantidad válida!";
  }

  return valido;
}

// Función asíncrona para cargar los datos de una pintura específica por ID
// - Realiza una petición GET a la API para obtener la pintura seleccionada
// - Completa los campos del formulario con los datos recibidos
// - Quita el event listener de agregar pintura para evitar conflictos (presumiblemente para luego activar la modificación)

async function seleccionarPintura(id) {
  try {
    const respuesta = await fetch(
      `https://utnfra-api-pinturas.onrender.com/pinturas/${id}`
    );
    const data = await respuesta.json();

    document.getElementById("inputID").value = data.pintura.id;
    document.getElementById("inputMarca").value = data.pintura.marca;
    document.getElementById("inputPrecio").value = data.pintura.precio;
    document.getElementById("inputColor").value = data.pintura.color;
    document.getElementById("inputCantidad").value = data.pintura.cantidad;

    const form = document.getElementById("frmFormulario");
    form.removeEventListener("submit", agregarPintura);
  } catch (error) {
    alert("Error al cargar el usuario");
    console.log(error);
  }
}

// Función asíncrona para modificar una pintura existente
// - Previene el comportamiento por defecto del formulario
// - Valida el formulario y, si no es válido, sale de la función
// - Obtiene los datos del formulario y realiza una petición PUT a la API
// - Si la respuesta es exitosa, actualiza el listado, limpia el formulario y vuelve a activar el event listener para agregar
// - En caso de error, muestra alertas y loguea el error en consola
async function modificarPintura(e) {
  e.preventDefault();

  if (!validarFormulario()) return;

  const Pintura = obtenerDatosFormulario();

  try {
    const respuesta = await fetch(
      `https://utnfra-api-pinturas.onrender.com/pinturas/${Pintura.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Pintura),
      }
    );
    console.log(respuesta);

    if (respuesta.ok) {
      mostrarPinturas();
      limpiarForm();
      const form = document.getElementById("frmFormulario");
      form.addEventListener("submit", agregarPintura);
    } else {
      alert("Error Al modificar el Pintura");
    }
  } catch (error) {
    alert("Error al modificar Pintura");
    console.log(error);
  }
}

// Función asíncrona para eliminar una pintura por su ID
// - Solicita confirmación al usuario antes de eliminar
// - Si el usuario acepta, realiza una petición DELETE a la API
// - Si la respuesta es exitosa, actualiza la lista de pinturas
// - Si hay un error, muestra una alerta y loguea el error en consola
async function eliminarPintura(id) {
  if (!confirm(`Seguro que quiere eliminar pintura\nID: ${id}`)) return;

  try {
    const respuesta = await fetch(
      `https://utnfra-api-pinturas.onrender.com/pinturas/${id}`,
      {
        method: "DELETE",
      }
    );

    if (respuesta.ok) {
      mostrarPinturas();
    } else {
      alert("Error en pintura");
    }
  } catch (error) {
    alert("Error al eliminar pintura");
    console.log(error);
  }
}

// Función para filtrar las pinturas según el texto ingresado por el usuario
// - Toma el valor del input de filtro, lo transforma a minúsculas y elimina espacios extra
// - Si el filtro está vacío, vuelve a mostrar toda la lista
// - Si hay un valor, utiliza la función `filtrarGeneral` para obtener los elementos filtrados
// - Luego, actualiza la tabla con los datos filtrados
function filtrar() {
  const filtro = document
    .getElementById("inputFiltro")
    .value.toLowerCase()
    .trim();

  if (filtro === "") {
    cargarDatos(pinturas);
    return;
  }

  const filtrados = filtrarGeneral(filtro);

  cargarDatos(filtrados);
}

// Función que filtra el array global de pinturas según el nombre de marca
// - Recorre cada pintura y verifica si su marca contiene el texto del filtro
// - Se asegura de que la marca sea una cadena válida y no vacía
// - Retorna un nuevo array con las pinturas que coinciden parcialmente con el texto buscado
function filtrarGeneral(nombreFiltro) {
  const filtrados = pinturas.filter((pintura) => {
    const marca = pintura?.marca;
    return (
      typeof marca === "string" &&
      marca.trim() !== "" &&
      marca.toLowerCase().includes(nombreFiltro)
    );
  });

  return filtrados;
}

// Función que suma los precios de un array de pinturas
// - Utiliza reduce para acumular los precios válidos
// - Solo suma si el precio es un número y no es NaN
// - Retorna la suma total
function sumarPrecios(pinturas) {
  return pinturas.reduce((acumulador, pintura) => {
    const precio = pintura?.precio;
    if (typeof precio === "number" && !isNaN(precio)) {
      return acumulador + precio;
    }
    return acumulador;
  }, 0);
}

// Función que muestra el total de pinturas cargadas
// - Accede al elemento con ID "totalPinturas"
// - Inserta en el HTML la cantidad total de pinturas del array global
function totalPinturas() {
  const total = document.getElementById("totalPinturas");
  total.innerHTML = pinturas.length;
}
// Función que determina la marca más frecuente en el array de pinturas
// - Crea un objeto para contar cuántas veces aparece cada marca (normalizada)
// - Recorre todas las pinturas y acumula los conteos por marca
// - Luego identifica cuál fue la marca con mayor cantidad de apariciones
// - Muestra la marca más frecuente en el HTML y también la devuelve como objeto

function obtenerMarcaMasFrecuente() {
  const conteoMarcas = {};
  const masFrecuente = document.getElementById("marcaComun");
  pinturas.forEach((pintura) => {
    const marca = pintura?.marca;
    if (typeof marca === "string" && marca.trim() !== "") {
      const marcaNormalizada = marca.toLowerCase().trim();
      conteoMarcas[marcaNormalizada] =
        (conteoMarcas[marcaNormalizada] || 0) + 1;
    }
  });

  let marcaMasFrecuente = null;
  let maxCantidad = 0;

  for (const marca in conteoMarcas) {
    if (conteoMarcas[marca] > maxCantidad) {
      maxCantidad = conteoMarcas[marca];
      marcaMasFrecuente = marca;
    }
  }

  masFrecuente.innerHTML = marcaMasFrecuente;

  console.log(marcaMasFrecuente);
  console.log(maxCantidad);
  return {
    marca: marcaMasFrecuente,
    cantidad: maxCantidad,
  };
}

// Función que busca y muestra la pintura más cara
// - Filtra las pinturas para quedarse solo con las que tienen un precio válido
// - Usa reduce para encontrar la pintura con el mayor precio
// - Muestra la marca y precio en el HTML (elemento con id "pinturaCara")
// - Devuelve el elemento HTML actualizado
function obtenerPinturaMasCara() {
  const masCara = document.getElementById("pinturaCara");

  const pinturaMasCara = pinturas
    .filter((p) => typeof p?.precio === "number" && p.precio > 0)
    .reduce((max, p) => (p.precio > max.precio ? p : max));

  console.log(pinturaMasCara);

  masCara.innerHTML = `${pinturaMasCara.marca} $${pinturaMasCara.precio}`;

  return masCara;
}



// Función que calcula y muestra el precio promedio de todas las pinturas
function obtenerPromedioGeneral() {
  const promedioGeneral = document.getElementById("promedioGeneral");

  // Filtra los precios válidos (números mayores a 0)
  const precios = pinturas
    .filter((p) => typeof p?.precio === "number" && p.precio > 0)
    .map((p) => p.precio);
    // Si no hay precios válidos, termina la función devolviendo 0
  if (precios.length === 0) return 0;
  // Suma todos los precios
  const total = precios.reduce((sum, precio) => sum + precio, 0);

// Calcula el promedio
  promedio = total / precios.length;
// Muestra el promedio (redondeado hacia abajo) en el HTML
  promedioGeneral.innerHTML = Math.floor(promedio);

}


// Calcula y muestra en el panel el promedio de precios para cada marca disponible en la lista de pinturas,
// filtrando marcas válidas y únicas, y creando dinámicamente elementos HTML para mostrar cada resultado.


function obtenerPromedioPorMarca() {
  const panelPromedios = document.getElementById("promedioPorMarca");
  panelPromedios.innerHTML = "";

  // Obtenemos todas las marcas únicas (filtradas correctamente)
  const marcasValidas = pinturas
    .map((p) => p.marca)
    .filter((marca) => typeof marca === "string" && marca.trim() !== "");
  const marcasUnicas = [
    ...new Set(marcasValidas.map((m) => m.trim().toLowerCase())),
  ];

  // Para cada marca, filtramos los productos y calculamos el promedio
  marcasUnicas.forEach((nombreMarca) => {
    const pinturasFiltradas = filtrarGeneral(nombreMarca);
    const precios = pinturasFiltradas
      .map((p) => Number(p.precio))
      .filter((precio) => !isNaN(precio) && precio > 0);

    if (precios.length > 0) {
      const promedio =
        precios.reduce((acc, val) => acc + val, 0) / precios.length;

      // Creamos el elemento de la lista
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";

      li.innerHTML = `
  <span class="text-capitalize">${nombreMarca}</span>
  <span class="badge bg-primary rounded-pill">$${promedio.toFixed(2)}</span>
`;
      li.textContent = `${nombreMarca}: $${Math.floor(promedio)}`;
      panelPromedios.appendChild(li);
    }
  });
}
// Ordena el array de pinturas por precio en orden ascendente o descendente según el parámetro 'orden' (por defecto "asc"),
// filtrando solo pinturas con precios válidos, y luego muestra los datos ordenados en la tabla.

function ordenarPorPrecio(orden = "asc") {
  const ordenado = pinturas
    .filter((p) => typeof p?.precio === "number" && p.precio > 0)
    .sort((a, b) => {
      const precioA = Number(a.precio);
      const precioB = Number(b.precio);
      return orden === "asc" ? precioA - precioB : precioB - precioA;
    });

  console.log(ordenado.forEach((p) => console.log(p.precio)));
  cargarDatos(ordenado);
}

// Alterna el orden de la lista de pinturas entre ascendente y descendente por precio cada vez que se ejecuta,
// actualiza el texto e ícono del botón para reflejar el estado actual de ordenación.

function cambiarOrden() {
  const orden = ordenInicial ? "asc" : "desc";
  ordenarPorPrecio(orden); // <-- tu función ya filtra y carga la tabla
  ordenInicial = !ordenInicial;
  const btn = document.getElementById("btnOrdenar");
  btn.innerHTML = ordenInicial
    ? '<i class="bi bi-sort-down"></i> Ordenar por precio'
    : '<i class="bi bi-sort-up"></i> Ordenar por precio';
}


// Convierte el array de pinturas en una cadena CSV con encabezados,
// uniendo las claves como primera fila y luego cada objeto como fila de valores separados por comas.

function convertirACSV() {
  console.log(pinturas);

  const header = Object.keys(pinturas[0]).join(",") + "\n"; // Encabezado del CSV
  const rows = pinturas.map((p) => Object.values(p).join(",")).join("\n"); // Filas del CSV

  return header + rows;
}
