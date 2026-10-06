// ======================================================
// CONTROL ESCOLAR
// Aplicación web - Cherry Academy / Control Escolar
// ======================================================

// ======================================================
// PIN DE ACCESO
// ======================================================

const PIN_CORRECTO = "1234";

const USUARIOS = {
    administrador: {
        id: "ADM001",
        pin: "1234",
        nombre: "Administrador",
        acceso: "total"
    },
    profesor: {
        id: "PROF001",
        pin: "2345",
        nombre: "Profesor",
        acceso: "profesor"
    },
    alumno: {
        id: "ALU001",
        pin: "3456",
        nombre: "Alumno",
        acceso: "alumno"
    }
};

let usuarioActual = null;

// ======================================================
// DATOS
// ======================================================

let datos;

try {
    datos = JSON.parse(
        localStorage.getItem("controlEscolarDatos")
    ) || {
        alumnos: [],
        profesores: [],
        grupos: [],
        materias: [],
        calificaciones: [],
        asistencias: [],
        tareas: []
    };
} catch (error) {
    datos = {
        alumnos: [],
        profesores: [],
        grupos: [],
        materias: [],
        calificaciones: [],
        asistencias: [],
        tareas: []
    };
}

// Asegurar que existan todos los apartados
datos.alumnos = Array.isArray(datos.alumnos) ? datos.alumnos : [];
datos.profesores = Array.isArray(datos.profesores) ? datos.profesores : [];
datos.grupos = Array.isArray(datos.grupos) ? datos.grupos : [];
datos.materias = Array.isArray(datos.materias) ? datos.materias : [];
datos.calificaciones = Array.isArray(datos.calificaciones) ? datos.calificaciones : [];
datos.asistencias = Array.isArray(datos.asistencias) ? datos.asistencias : [];
datos.tareas = Array.isArray(datos.tareas) ? datos.tareas : [];

// ======================================================
// GUARDAR DATOS
// ======================================================

function guardarDatos() {
    localStorage.setItem(
        "controlEscolarDatos",
        JSON.stringify(datos)
    );
}

// ======================================================
// PANTALLAS
// ======================================================

function mostrarPantalla(id) {

    document.querySelectorAll(".pantalla").forEach(pantalla => {
        pantalla.classList.remove("activa");
    });

    const pantalla = document.getElementById(id);

    if (pantalla) {
        pantalla.classList.add("activa");
    }
}

// ======================================================
// INICIO
// ======================================================

function mostrarInicio() {
    mostrarPantalla("pantalla-inicio");
}

// ======================================================
// LOGIN
// ======================================================

function mostrarLogin() {

    mostrarPantalla("pantalla-login");

    const pin = document.getElementById("campo-pin");
    const id = document.getElementById("campo-id");
    const tipo = document.getElementById("tipo-usuario");

    if (pin) pin.value = "";
    if (id) id.value = "";
    if (tipo) tipo.value = "administrador";

    setTimeout(() => {
        if (id) id.focus();
    }, 100);

    const mensaje = document.getElementById("mensaje-login");
    if (mensaje) mensaje.textContent = "";
}


function validarAcceso() {

    const campoPin = document.getElementById("campo-pin");
    const campoId = document.getElementById("campo-id");
    const tipo = document.getElementById("tipo-usuario");

    if (!campoPin || !campoId || !tipo) {
        mostrarMensaje("No se pudo cargar el acceso al sistema.", "error");
        return;
    }

    const id = campoId.value.trim().toUpperCase();
    const pin = campoPin.value.trim();
    const rol = tipo.value;
    const usuario = USUARIOS[rol];

    if (
        usuario &&
        id === usuario.id &&
        pin === usuario.pin
    ) {
        usuarioActual = {
            rol,
            id: usuario.id,
            nombre: usuario.nombre
        };

        campoPin.value = "";
        campoId.value = "";

        actualizarUsuarioSesion();
        aplicarPermisosMenu();
        mostrarPantalla("pantalla-menu");
        return;
    }

    campoPin.value = "";
    campoPin.focus();

    mostrarMensaje(
        "ID o PIN incorrectos para el tipo de usuario seleccionado.",
        "error"
    );
}


function actualizarUsuarioSesion() {
    const etiqueta = document.getElementById("usuario-sesion");

    if (!etiqueta || !usuarioActual) return;

    const nombres = {
        administrador: "Administrador",
        profesor: "Profesor",
        alumno: "Alumno"
    };

    etiqueta.textContent =
        `Sesión: ${nombres[usuarioActual.rol]} · ID ${usuarioActual.id}`;
}


function tienePermisoModulo(modulo) {

    if (!usuarioActual) return false;

    if (usuarioActual.rol === "administrador") {
        return true;
    }

    if (usuarioActual.rol === "profesor") {
        return [
            "alumnos",
            "grupos",
            "materias",
            "calificaciones",
            "asistencias",
            "tareas",
            "reportes"
        ].includes(modulo);
    }

    if (usuarioActual.rol === "alumno") {
        return [
            "calificaciones",
            "asistencias",
            "tareas",
            "reportes"
        ].includes(modulo);
    }

    return false;
}


function aplicarPermisosMenu() {

    document.querySelectorAll(".tarjeta-menu").forEach(tarjeta => {

        const onclick = tarjeta.getAttribute("onclick") || "";
        const coincidencia = onclick.match(/abrirModulo\('([^']+)'\)/);

        if (!coincidencia) return;

        const modulo = coincidencia[1];
        const permitido = tienePermisoModulo(modulo);

        tarjeta.style.display = permitido ? "" : "none";
        tarjeta.classList.toggle("bloqueada", !permitido);
    });
}


function aplicarPermisosModulo() {

    if (!usuarioActual) return;

    const botones =
        document.querySelectorAll("#contenido-modulo .botones-grid button");

    botones.forEach(boton => {

        const texto = boton.textContent.trim().toUpperCase();

        if (usuarioActual.rol === "alumno") {

            const permitidos = [
                "CONSULTAR",
                "DIRECTORIO",
                "ESTRUCTURA",
                "CATÁLOGO",
                "BUSCAR",
                "VER EVALUACIONES",
                "VER ASISTENCIAS",
                "VER TAREAS",
                "LIMPIAR"
            ];

            boton.style.display =
                permitidos.some(nombre => texto.includes(nombre))
                    ? ""
                    : "none";
        }

        if (usuarioActual.rol === "profesor") {

            const restringidos = [
                "DAR DE BAJA",
                "ELIMINAR",
                "RETIRAR"
            ];

            boton.style.display =
                restringidos.some(nombre => texto.includes(nombre))
                    ? "none"
                    : "";
        }
    });
}

// Permitir ENTER para iniciar sesión
document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            const login =
                document.getElementById("pantalla-login");

            if (
                login &&
                login.classList.contains("activa")
            ) {
                validarAcceso();
            }
        }
    }
);

// ======================================================
// SALIR
// ======================================================

function salirSistema() {

    cerrarModal();

    const pin = document.getElementById("campo-pin");
    const id = document.getElementById("campo-id");

    if (pin) pin.value = "";
    if (id) id.value = "";

    usuarioActual = null;
    mostrarInicio();
}


// ======================================================
// UTILIDADES
// ======================================================

function escaparHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function obtenerValor(id) {

    const elemento =
        document.getElementById(id);

    if (!elemento) {
        return "";
    }

    return elemento.value.trim();
}


function limpiarModulo() {

    const formulario =
        document.querySelector(
            "#contenido-modulo form"
        );

    if (formulario) {
        formulario.reset();
        return;
    }

    const contenedor =
        document.getElementById(
            "contenido-modulo"
        );

    if (!contenedor) {
        return;
    }

    contenedor
        .querySelectorAll(
            "input, select, textarea"
        )
        .forEach(elemento => {

            if (
                elemento.type === "button" ||
                elemento.type === "submit"
            ) {
                return;
            }

            elemento.value = "";
        });
}


// ======================================================
// MODAL
// ======================================================

function mostrarMensaje(
    texto,
    tipo = "normal"
) {

    const modal =
        document.getElementById("modal");

    if (!modal) {
        alert(texto);
        return;
    }

    const titulo =
        document.getElementById(
            "modal-titulo"
        );

    const contenido =
        document.getElementById(
            "modal-contenido"
        );

    if (titulo) {

        titulo.textContent =
            tipo === "error"
                ? "Aviso"
                : "Control Escolar";
    }

    if (contenido) {
        contenido.textContent = texto;
    }

    // El modal comienza oculto
    // y se muestra quitando "oculto"
    modal.classList.remove("oculto");
}


function cerrarModal() {

    const modal =
        document.getElementById("modal");

    if (modal) {
        modal.classList.add("oculto");
    }
}


// ======================================================
// ABRIR MÓDULOS
// ======================================================

function abrirModulo(modulo) {

    if (!tienePermisoModulo(modulo)) {
        mostrarMensaje(
            "Tu tipo de usuario no tiene permiso para entrar a este módulo.",
            "error"
        );
        return;
    }

    const contenedor =
        document.getElementById(
            "contenido-modulo"
        );

    if (!contenedor) {
        return;
    }

    let contenido = "";

    switch (modulo) {

        case "alumnos":
            contenido = moduloAlumnos();
            break;

        case "profesores":
            contenido = moduloProfesores();
            break;

        case "grupos":
            contenido = moduloGrupos();
            break;

        case "materias":
            contenido = moduloMaterias();
            break;

        case "calificaciones":
            contenido = moduloCalificaciones();
            break;

        case "asistencias":
            contenido = moduloAsistencias();
            break;

        case "tareas":
            contenido = moduloTareas();
            break;

        case "reportes":
            contenido = moduloReportes();
            break;

        default:

            contenido = `
                <div class="tarjeta">

                    <h2>
                        Módulo no encontrado
                    </h2>

                    <button
                        class="boton-secundario"
                        onclick="volverMenu()">
                        VOLVER AL MENÚ
                    </button>

                </div>
            `;
    }

    contenedor.innerHTML = contenido;

    cerrarModal();

    mostrarPantalla(
        "pantalla-modulo"
    );

    aplicarPermisosModulo();
}


function volverMenu() {

    cerrarModal();

    mostrarPantalla(
        "pantalla-menu"
    );
}


// ======================================================
// MÓDULO ALUMNOS
// ======================================================

function moduloAlumnos() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    01 · ESTUDIANTES
                </h1>

                <p>
                    Registro y control de alumnos
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="formulario-grid">

            <input
                id="alumno-matricula"
                type="text"
                placeholder="Matrícula">

            <input
                id="alumno-nombre"
                type="text"
                placeholder="Nombre">

            <input
                id="alumno-apellido"
                type="text"
                placeholder="Apellido">

            <input
                id="alumno-grupo"
                type="text"
                placeholder="Grupo">

            <input
                id="alumno-telefono"
                type="text"
                placeholder="Teléfono">

            <input
                id="alumno-correo"
                type="email"
                placeholder="Correo">

            <input
                id="alumno-fecha"
                type="date">

        </div>


        <div class="botones-grid">

            <button onclick="guardarAlumno()">
                REGISTRAR
            </button>

            <button onclick="buscarAlumno()">
                CONSULTAR
            </button>

            <button onclick="editarAlumno()">
                MODIFICAR
            </button>

            <button onclick="eliminarAlumno()">
                DAR DE BAJA
            </button>

            <button onclick="mostrarDirectorioAlumnos()">
                DIRECTORIO
            </button>

            <button onclick="limpiarModulo()">
                LIMPIAR
            </button>

        </div>


        <div id="resultado-modulo"></div>
    `;
}


function guardarAlumno() {

    const matricula =
        obtenerValor("alumno-matricula");

    const nombre =
        obtenerValor("alumno-nombre");

    const apellido =
        obtenerValor("alumno-apellido");

    if (
        !matricula ||
        !nombre ||
        !apellido
    ) {

        mostrarMensaje(
            "La matrícula, el nombre y el apellido son obligatorios.",
            "error"
        );

        return;
    }

    const existe =
        datos.alumnos.some(
            alumno =>
                alumno.matricula === matricula
        );

    if (existe) {

        mostrarMensaje(
            "Ya existe un alumno con esa matrícula.",
            "error"
        );

        return;
    }

    datos.alumnos.push({

        matricula,

        nombre,

        apellido,

        grupo:
            obtenerValor("alumno-grupo"),

        telefono:
            obtenerValor("alumno-telefono"),

        correo:
            obtenerValor("alumno-correo"),

        fecha:
            obtenerValor("alumno-fecha")
    });

    guardarDatos();

    mostrarMensaje(
        "Alumno registrado correctamente."
    );

    limpiarModulo();
}


function buscarAlumno() {

    const matricula =
        obtenerValor(
            "alumno-matricula"
        );

    if (!matricula) {

        mostrarMensaje(
            "Escribe una matrícula para consultar.",
            "error"
        );

        return;
    }

    const alumno =
        datos.alumnos.find(
            alumno =>
                alumno.matricula === matricula
        );

    if (!alumno) {

        mostrarMensaje(
            "No se encontró el alumno.",
            "error"
        );

        return;
    }

    document.getElementById(
        "alumno-nombre"
    ).value = alumno.nombre;

    document.getElementById(
        "alumno-apellido"
    ).value = alumno.apellido;

    document.getElementById(
        "alumno-grupo"
    ).value = alumno.grupo || "";

    document.getElementById(
        "alumno-telefono"
    ).value = alumno.telefono || "";

    document.getElementById(
        "alumno-correo"
    ).value = alumno.correo || "";

    document.getElementById(
        "alumno-fecha"
    ).value = alumno.fecha || "";

    mostrarMensaje(
        "Alumno encontrado."
    );
}


function editarAlumno() {

    const matricula =
        obtenerValor(
            "alumno-matricula"
        );

    const alumno =
        datos.alumnos.find(
            alumno =>
                alumno.matricula === matricula
        );

    if (!alumno) {

        mostrarMensaje(
            "No se encontró el alumno.",
            "error"
        );

        return;
    }

    const nombre =
        obtenerValor("alumno-nombre");

    const apellido =
        obtenerValor("alumno-apellido");

    if (!nombre || !apellido) {

        mostrarMensaje(
            "El nombre y apellido son obligatorios.",
            "error"
        );

        return;
    }

    alumno.nombre = nombre;
    alumno.apellido = apellido;

    alumno.grupo =
        obtenerValor("alumno-grupo");

    alumno.telefono =
        obtenerValor("alumno-telefono");

    alumno.correo =
        obtenerValor("alumno-correo");

    alumno.fecha =
        obtenerValor("alumno-fecha");

    guardarDatos();

    mostrarMensaje(
        "Alumno modificado correctamente."
    );
}


function eliminarAlumno() {

    const matricula =
        obtenerValor(
            "alumno-matricula"
        );

    if (!matricula) {

        mostrarMensaje(
            "Escribe la matrícula del alumno.",
            "error"
        );

        return;
    }

    const posicion =
        datos.alumnos.findIndex(
            alumno =>
                alumno.matricula === matricula
        );

    if (posicion === -1) {

        mostrarMensaje(
            "No se encontró el alumno.",
            "error"
        );

        return;
    }

    if (
        confirm(
            "¿Estás seguro de que deseas dar de baja a este alumno?"
        )
    ) {

        datos.alumnos.splice(
            posicion,
            1
        );

        guardarDatos();

        mostrarMensaje(
            "Alumno dado de baja correctamente."
        );

        limpiarModulo();
    }
}


function mostrarDirectorioAlumnos() {

    const resultado =
        document.getElementById(
            "resultado-modulo"
        );

    if (!resultado) {
        return;
    }

    if (datos.alumnos.length === 0) {

        resultado.innerHTML = `

            <div class="tarjeta">

                <p>
                    No hay alumnos registrados.
                </p>

            </div>
        `;

        return;
    }

    resultado.innerHTML = `

        <div class="tabla-contenedor">

            <h2>
                DIRECTORIO DE ESTUDIANTES
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Matrícula</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Grupo</th>

                    </tr>

                </thead>

                <tbody>

                    ${datos.alumnos.map(
                        alumno => `

                        <tr>

                            <td>
                                ${escaparHTML(
                                    alumno.matricula
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    alumno.nombre
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    alumno.apellido
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    alumno.grupo
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ======================================================
// PROFESORES
// ======================================================

function moduloProfesores() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    02 · DOCENTES
                </h1>

                <p>
                    Registro y control de profesores
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="formulario-grid">

            <input
                id="profesor-nombre"
                type="text"
                placeholder="Nombre">

            <input
                id="profesor-apellido"
                type="text"
                placeholder="Apellido">

            <input
                id="profesor-especialidad"
                type="text"
                placeholder="Especialidad">

            <input
                id="profesor-telefono"
                type="text"
                placeholder="Teléfono">

            <input
                id="profesor-correo"
                type="email"
                placeholder="Correo">

        </div>


        <div class="botones-grid">

            <button onclick="guardarProfesor()">
                REGISTRAR
            </button>

            <button onclick="buscarProfesor()">
                CONSULTAR
            </button>

            <button onclick="editarProfesor()">
                MODIFICAR
            </button>

            <button onclick="eliminarProfesor()">
                DAR DE BAJA
            </button>

            <button onclick="mostrarDirectorioProfesores()">
                DIRECTORIO
            </button>

            <button onclick="limpiarModulo()">
                LIMPIAR
            </button>

        </div>


        <div id="resultado-modulo"></div>
    `;
}


function guardarProfesor() {

    const nombre =
        obtenerValor("profesor-nombre");

    const apellido =
        obtenerValor("profesor-apellido");

    if (!nombre || !apellido) {

        mostrarMensaje(
            "El nombre y apellido son obligatorios.",
            "error"
        );

        return;
    }

    datos.profesores.push({

        nombre,

        apellido,

        especialidad:
            obtenerValor(
                "profesor-especialidad"
            ),

        telefono:
            obtenerValor(
                "profesor-telefono"
            ),

        correo:
            obtenerValor(
                "profesor-correo"
            )
    });

    guardarDatos();

    mostrarMensaje(
        "Profesor registrado correctamente."
    );

    limpiarModulo();
}


function buscarProfesor() {

    const nombre =
        obtenerValor("profesor-nombre");

    const apellido =
        obtenerValor("profesor-apellido");

    const profesor =
        datos.profesores.find(
            profesor =>
                profesor.nombre.toLowerCase() ===
                    nombre.toLowerCase() &&
                profesor.apellido.toLowerCase() ===
                    apellido.toLowerCase()
        );

    if (!profesor) {

        mostrarMensaje(
            "No se encontró el profesor.",
            "error"
        );

        return;
    }

    document.getElementById(
        "profesor-especialidad"
    ).value =
        profesor.especialidad || "";

    document.getElementById(
        "profesor-telefono"
    ).value =
        profesor.telefono || "";

    document.getElementById(
        "profesor-correo"
    ).value =
        profesor.correo || "";

    mostrarMensaje(
        "Profesor encontrado."
    );
}


function editarProfesor() {

    const nombre =
        obtenerValor("profesor-nombre");

    const apellido =
        obtenerValor("profesor-apellido");

    const profesor =
        datos.profesores.find(
            profesor =>
                profesor.nombre.toLowerCase() ===
                    nombre.toLowerCase() &&
                profesor.apellido.toLowerCase() ===
                    apellido.toLowerCase()
        );

    if (!profesor) {

        mostrarMensaje(
            "No se encontró el profesor.",
            "error"
        );

        return;
    }

    profesor.especialidad =
        obtenerValor(
            "profesor-especialidad"
        );

    profesor.telefono =
        obtenerValor(
            "profesor-telefono"
        );

    profesor.correo =
        obtenerValor(
            "profesor-correo"
        );

    guardarDatos();

    mostrarMensaje(
        "Profesor modificado correctamente."
    );
}


function eliminarProfesor() {

    const nombre =
        obtenerValor("profesor-nombre");

    const apellido =
        obtenerValor("profesor-apellido");

    const posicion =
        datos.profesores.findIndex(
            profesor =>
                profesor.nombre.toLowerCase() ===
                    nombre.toLowerCase() &&
                profesor.apellido.toLowerCase() ===
                    apellido.toLowerCase()
        );

    if (posicion === -1) {

        mostrarMensaje(
            "No se encontró el profesor.",
            "error"
        );

        return;
    }

    if (
        confirm(
            "¿Estás seguro de que deseas dar de baja a este profesor?"
        )
    ) {

        datos.profesores.splice(
            posicion,
            1
        );

        guardarDatos();

        mostrarMensaje(
            "Profesor dado de baja correctamente."
        );

        limpiarModulo();
    }
}


function mostrarDirectorioProfesores() {

    const resultado =
        document.getElementById(
            "resultado-modulo"
        );

    if (!resultado) {
        return;
    }

    if (datos.profesores.length === 0) {

        resultado.innerHTML = `

            <div class="tarjeta">

                <p>
                    No hay profesores registrados.
                </p>

            </div>
        `;

        return;
    }

    resultado.innerHTML = `

        <div class="tabla-contenedor">

            <h2>
                DIRECTORIO DE DOCENTES
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Especialidad</th>
                        <th>Teléfono</th>
                        <th>Correo</th>

                    </tr>

                </thead>

                <tbody>

                    ${datos.profesores.map(
                        profesor => `

                        <tr>

                            <td>
                                ${escaparHTML(
                                    profesor.nombre
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    profesor.apellido
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    profesor.especialidad
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    profesor.telefono
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    profesor.correo
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ======================================================
// GRUPOS
// ======================================================

function moduloGrupos() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    03 · GRUPOS
                </h1>

                <p>
                    Administración de grupos escolares
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="formulario-grid">

            <input
                id="grupo-nombre"
                type="text"
                placeholder="Nombre del grupo">

            <input
                id="grupo-grado"
                type="text"
                placeholder="Grado">

            <input
                id="grupo-especialidad"
                type="text"
                placeholder="Especialidad">

            <input
                id="grupo-turno"
                type="text"
                placeholder="Turno">

        </div>


        <div class="botones-grid">

            <button onclick="guardarGrupo()">
                CREAR GRUPO
            </button>

            <button onclick="buscarGrupo()">
                CONSULTAR
            </button>

            <button onclick="editarGrupo()">
                MODIFICAR
            </button>

            <button onclick="eliminarGrupo()">
                ELIMINAR
            </button>

            <button onclick="mostrarGrupos()">
                ESTRUCTURA
            </button>

            <button onclick="limpiarModulo()">
                LIMPIAR
            </button>

        </div>


        <div id="resultado-modulo"></div>
    `;
}


function guardarGrupo() {

    const nombre =
        obtenerValor("grupo-nombre");

    if (!nombre) {

        mostrarMensaje(
            "El nombre del grupo es obligatorio.",
            "error"
        );

        return;
    }

    if (
        datos.grupos.some(
            grupo =>
                grupo.nombre.toLowerCase() ===
                nombre.toLowerCase()
        )
    ) {

        mostrarMensaje(
            "Ese grupo ya existe.",
            "error"
        );

        return;
    }

    datos.grupos.push({

        nombre,

        grado:
            obtenerValor("grupo-grado"),

        especialidad:
            obtenerValor(
                "grupo-especialidad"
            ),

        turno:
            obtenerValor("grupo-turno")
    });

    guardarDatos();

    mostrarMensaje(
        "Grupo creado correctamente."
    );

    limpiarModulo();
}


function buscarGrupo() {

    const nombre =
        obtenerValor("grupo-nombre");

    const grupo =
        datos.grupos.find(
            grupo =>
                grupo.nombre.toLowerCase() ===
                nombre.toLowerCase()
        );

    if (!grupo) {

        mostrarMensaje(
            "No se encontró el grupo.",
            "error"
        );

        return;
    }

    document.getElementById(
        "grupo-grado"
    ).value =
        grupo.grado || "";

    document.getElementById(
        "grupo-especialidad"
    ).value =
        grupo.especialidad || "";

    document.getElementById(
        "grupo-turno"
    ).value =
        grupo.turno || "";

    mostrarMensaje(
        "Grupo encontrado."
    );
}


function editarGrupo() {

    const nombre =
        obtenerValor("grupo-nombre");

    const grupo =
        datos.grupos.find(
            grupo =>
                grupo.nombre.toLowerCase() ===
                nombre.toLowerCase()
        );

    if (!grupo) {

        mostrarMensaje(
            "No se encontró el grupo.",
            "error"
        );

        return;
    }

    grupo.grado =
        obtenerValor("grupo-grado");

    grupo.especialidad =
        obtenerValor(
            "grupo-especialidad"
        );

    grupo.turno =
        obtenerValor("grupo-turno");

    guardarDatos();

    mostrarMensaje(
        "Grupo modificado correctamente."
    );
}


function eliminarGrupo() {

    const nombre =
        obtenerValor("grupo-nombre");

    const posicion =
        datos.grupos.findIndex(
            grupo =>
                grupo.nombre.toLowerCase() ===
                nombre.toLowerCase()
        );

    if (posicion === -1) {

        mostrarMensaje(
            "No se encontró el grupo.",
            "error"
        );

        return;
    }

    if (
        confirm(
            "¿Estás seguro de que deseas eliminar este grupo?"
        )
    ) {

        datos.grupos.splice(
            posicion,
            1
        );

        guardarDatos();

        mostrarMensaje(
            "Grupo eliminado correctamente."
        );

        limpiarModulo();
    }
}


function mostrarGrupos() {

    const resultado =
        document.getElementById(
            "resultado-modulo"
        );

    if (!resultado) {
        return;
    }

    resultado.innerHTML = `

        <div class="tabla-contenedor">

            <h2>
                ESTRUCTURA DE GRUPOS
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Grupo</th>
                        <th>Grado</th>
                        <th>Especialidad</th>
                        <th>Turno</th>

                    </tr>

                </thead>

                <tbody>

                    ${datos.grupos.map(
                        grupo => `

                        <tr>

                            <td>
                                ${escaparHTML(
                                    grupo.nombre
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    grupo.grado
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    grupo.especialidad
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    grupo.turno
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ======================================================
// MATERIAS
// ======================================================

function moduloMaterias() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    04 · MATERIAS
                </h1>

                <p>
                    Catálogo de materias escolares
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="formulario-grid">

            <input
                id="materia-nombre"
                type="text"
                placeholder="Nombre de la materia">

            <input
                id="materia-clave"
                type="text"
                placeholder="Clave">

            <input
                id="materia-semestre"
                type="text"
                placeholder="Semestre">

            <input
                id="materia-docente"
                type="text"
                placeholder="Docente">

            <input
                id="materia-horas"
                type="text"
                placeholder="Horas por semana">

        </div>


        <div class="botones-grid">

            <button onclick="guardarMateria()">
                AÑADIR
            </button>

            <button onclick="buscarMateria()">
                CONSULTAR
            </button>

            <button onclick="editarMateria()">
                MODIFICAR
            </button>

            <button onclick="eliminarMateria()">
                RETIRAR
            </button>

            <button onclick="mostrarMaterias()">
                CATÁLOGO
            </button>

            <button onclick="limpiarModulo()">
                LIMPIAR
            </button>

        </div>


        <div id="resultado-modulo"></div>
    `;
}


function guardarMateria() {

    const nombre =
        obtenerValor("materia-nombre");

    if (!nombre) {

        mostrarMensaje(
            "El nombre de la materia es obligatorio.",
            "error"
        );

        return;
    }

    if (
        datos.materias.some(
            materia =>
                materia.nombre.toLowerCase() ===
                nombre.toLowerCase()
        )
    ) {

        mostrarMensaje(
            "Esa materia ya existe.",
            "error"
        );

        return;
    }

    datos.materias.push({

        nombre,

        clave:
            obtenerValor("materia-clave"),

        semestre:
            obtenerValor(
                "materia-semestre"
            ),

        docente:
            obtenerValor(
                "materia-docente"
            ),

        horas:
            obtenerValor("materia-horas")
    });

    guardarDatos();

    mostrarMensaje(
        "Materia añadida correctamente."
    );

    limpiarModulo();
}


function buscarMateria() {

    const nombre =
        obtenerValor("materia-nombre");

    const materia =
        datos.materias.find(
            materia =>
                materia.nombre.toLowerCase() ===
                nombre.toLowerCase()
        );

    if (!materia) {

        mostrarMensaje(
            "No se encontró la materia.",
            "error"
        );

        return;
    }

    document.getElementById(
        "materia-clave"
    ).value =
        materia.clave || "";

    document.getElementById(
        "materia-semestre"
    ).value =
        materia.semestre || "";

    document.getElementById(
        "materia-docente"
    ).value =
        materia.docente || "";

    document.getElementById(
        "materia-horas"
    ).value =
        materia.horas || "";

    mostrarMensaje(
        "Materia encontrada."
    );
}


function editarMateria() {

    const nombre =
        obtenerValor("materia-nombre");

    const materia =
        datos.materias.find(
            materia =>
                materia.nombre.toLowerCase() ===
                nombre.toLowerCase()
        );

    if (!materia) {

        mostrarMensaje(
            "No se encontró la materia.",
            "error"
        );

        return;
    }

    materia.clave =
        obtenerValor(
            "materia-clave"
        );

    materia.semestre =
        obtenerValor(
            "materia-semestre"
        );

    materia.docente =
        obtenerValor(
            "materia-docente"
        );

    materia.horas =
        obtenerValor(
            "materia-horas"
        );

    guardarDatos();

    mostrarMensaje(
        "Materia modificada correctamente."
    );
}


function eliminarMateria() {

    const nombre =
        obtenerValor("materia-nombre");

    const posicion =
        datos.materias.findIndex(
            materia =>
                materia.nombre.toLowerCase() ===
                nombre.toLowerCase()
        );

    if (posicion === -1) {

        mostrarMensaje(
            "No se encontró la materia.",
            "error"
        );

        return;
    }

    if (
        confirm(
            "¿Estás seguro de que deseas retirar esta materia?"
        )
    ) {

        datos.materias.splice(
            posicion,
            1
        );

        guardarDatos();

        mostrarMensaje(
            "Materia retirada correctamente."
        );

        limpiarModulo();
    }
}


function mostrarMaterias() {

    const resultado =
        document.getElementById(
            "resultado-modulo"
        );

    if (!resultado) {
        return;
    }

    resultado.innerHTML = `

        <div class="tabla-contenedor">

            <h2>
                CATÁLOGO DE MATERIAS
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Materia</th>
                        <th>Clave</th>
                        <th>Semestre</th>
                        <th>Docente</th>
                        <th>Horas</th>

                    </tr>

                </thead>

                <tbody>

                    ${datos.materias.map(
                        materia => `

                        <tr>

                            <td>
                                ${escaparHTML(
                                    materia.nombre
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    materia.clave
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    materia.semestre
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    materia.docente
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    materia.horas
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ======================================================
// CALIFICACIONES
// ======================================================

function moduloCalificaciones() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    05 · EVALUACIONES
                </h1>

                <p>
                    Registro de calificaciones
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="formulario-grid">

            <input
                id="cal-matricula"
                type="text"
                placeholder="Matrícula">

            <input
                id="cal-alumno"
                type="text"
                placeholder="Alumno">

            <input
                id="cal-materia"
                type="text"
                placeholder="Materia">

            <input
                id="cal-parcial1"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="Parcial 1">

            <input
                id="cal-parcial2"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="Parcial 2">

            <input
                id="cal-parcial3"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="Parcial 3">

            <input
                id="cal-promedio"
                type="text"
                placeholder="Promedio"
                readonly>

        </div>


        <div class="botones-grid">

            <button onclick="guardarCalificacion()">
                GUARDAR
            </button>

            <button onclick="buscarCalificacion()">
                BUSCAR
            </button>

            <button onclick="editarCalificacion()">
                EDITAR
            </button>

            <button onclick="eliminarCalificacion()">
                ELIMINAR
            </button>

            <button onclick="mostrarCalificaciones()">
                VER EVALUACIONES
            </button>

            <button onclick="limpiarModulo()">
                LIMPIAR
            </button>

        </div>


        <div id="resultado-modulo"></div>
    `;
}


function calcularPromedioCalificacion() {

    const p1 =
        parseFloat(
            obtenerValor("cal-parcial1")
        );

    const p2 =
        parseFloat(
            obtenerValor("cal-parcial2")
        );

    const p3 =
        parseFloat(
            obtenerValor("cal-parcial3")
        );

    if (
        Number.isNaN(p1) ||
        Number.isNaN(p2) ||
        Number.isNaN(p3)
    ) {
        return null;
    }

    if (
        p1 < 0 || p1 > 10 ||
        p2 < 0 || p2 > 10 ||
        p3 < 0 || p3 > 10
    ) {
        return null;
    }

    return (
        (p1 + p2 + p3) / 3
    ).toFixed(2);
}


function guardarCalificacion() {

    const matricula =
        obtenerValor("cal-matricula");

    const alumno =
        obtenerValor("cal-alumno");

    const materia =
        obtenerValor("cal-materia");

    if (
        !matricula ||
        !alumno ||
        !materia
    ) {

        mostrarMensaje(
            "Matrícula, alumno y materia son obligatorios.",
            "error"
        );

        return;
    }

    const promedio =
        calcularPromedioCalificacion();

    if (promedio === null) {

        mostrarMensaje(
            "Los tres parciales deben estar entre 0 y 10.",
            "error"
        );

        return;
    }

    const existe =
        datos.calificaciones.some(
            cal =>
                cal.matricula === matricula &&
                cal.materia.toLowerCase() ===
                    materia.toLowerCase()
        );

    if (existe) {

        mostrarMensaje(
            "Ya existe una evaluación para esa matrícula y materia.",
            "error"
        );

        return;
    }

    datos.calificaciones.push({

        matricula,

        alumno,

        materia,

        parcial1:
            obtenerValor("cal-parcial1"),

        parcial2:
            obtenerValor("cal-parcial2"),

        parcial3:
            obtenerValor("cal-parcial3"),

        promedio
    });

    document.getElementById(
        "cal-promedio"
    ).value = promedio;

    guardarDatos();

    mostrarMensaje(
        "Calificación guardada correctamente."
    );
}


function buscarCalificacion() {

    const matricula =
        obtenerValor("cal-matricula");

    const materia =
        obtenerValor("cal-materia");

    const cal =
        datos.calificaciones.find(
            cal =>
                cal.matricula === matricula &&
                cal.materia.toLowerCase() ===
                    materia.toLowerCase()
        );

    if (!cal) {

        mostrarMensaje(
            "No se encontró la evaluación.",
            "error"
        );

        return;
    }

    document.getElementById(
        "cal-alumno"
    ).value = cal.alumno;

    document.getElementById(
        "cal-parcial1"
    ).value = cal.parcial1;

    document.getElementById(
        "cal-parcial2"
    ).value = cal.parcial2;

    document.getElementById(
        "cal-parcial3"
    ).value = cal.parcial3;

    document.getElementById(
        "cal-promedio"
    ).value = cal.promedio;

    mostrarMensaje(
        `Evaluación encontrada. Promedio: ${cal.promedio}`
    );
}


function editarCalificacion() {

    const matricula =
        obtenerValor("cal-matricula");

    const materia =
        obtenerValor("cal-materia");

    const cal =
        datos.calificaciones.find(
            cal =>
                cal.matricula === matricula &&
                cal.materia.toLowerCase() ===
                    materia.toLowerCase()
        );

    if (!cal) {

        mostrarMensaje(
            "No se encontró la evaluación.",
            "error"
        );

        return;
    }

    const promedio =
        calcularPromedioCalificacion();

    if (promedio === null) {

        mostrarMensaje(
            "Los parciales deben estar entre 0 y 10.",
            "error"
        );

        return;
    }

    cal.alumno =
        obtenerValor("cal-alumno");

    cal.parcial1 =
        obtenerValor("cal-parcial1");

    cal.parcial2 =
        obtenerValor("cal-parcial2");

    cal.parcial3 =
        obtenerValor("cal-parcial3");

    cal.promedio = promedio;

    document.getElementById(
        "cal-promedio"
    ).value = promedio;

    guardarDatos();

    mostrarMensaje(
        "Evaluación modificada correctamente."
    );
}


function eliminarCalificacion() {

    const matricula =
        obtenerValor("cal-matricula");

    const materia =
        obtenerValor("cal-materia");

    const posicion =
        datos.calificaciones.findIndex(
            cal =>
                cal.matricula === matricula &&
                cal.materia.toLowerCase() ===
                    materia.toLowerCase()
        );

    if (posicion === -1) {

        mostrarMensaje(
            "No se encontró la evaluación.",
            "error"
        );

        return;
    }

    if (
        confirm(
            "¿Estás seguro de que deseas eliminar esta evaluación?"
        )
    ) {

        datos.calificaciones.splice(
            posicion,
            1
        );

        guardarDatos();

        mostrarMensaje(
            "Evaluación eliminada correctamente."
        );

        limpiarModulo();
    }
}


function mostrarCalificaciones() {

    const resultado =
        document.getElementById(
            "resultado-modulo"
        );

    if (!resultado) {
        return;
    }

    resultado.innerHTML = `

        <div class="tabla-contenedor">

            <h2>
                EVALUACIONES
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Matrícula</th>
                        <th>Alumno</th>
                        <th>Materia</th>
                        <th>P1</th>
                        <th>P2</th>
                        <th>P3</th>
                        <th>Prom.</th>

                    </tr>

                </thead>

                <tbody>

                    ${datos.calificaciones.map(
                        cal => `

                        <tr>

                            <td>
                                ${escaparHTML(
                                    cal.matricula
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    cal.alumno
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    cal.materia
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    cal.parcial1
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    cal.parcial2
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    cal.parcial3
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    cal.promedio
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ======================================================
// ASISTENCIAS
// ======================================================

function moduloAsistencias() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    06 · ASISTENCIA
                </h1>

                <p>
                    Control de asistencia de estudiantes
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="formulario-grid">

            <input
                id="asis-matricula"
                type="text"
                placeholder="Matrícula">

            <input
                id="asis-fecha"
                type="date">

            <select id="asis-estado">

                <option value="">
                    Selecciona estado
                </option>

                <option value="Presente">
                    Presente
                </option>

                <option value="Ausente">
                    Ausente
                </option>

                <option value="Justificada">
                    Justificada
                </option>

                <option value="Retardo">
                    Retardo
                </option>

            </select>

            <input
                id="asis-observaciones"
                type="text"
                placeholder="Observaciones">

        </div>


        <div class="botones-grid">

            <button onclick="guardarAsistencia()">
                GUARDAR
            </button>

            <button onclick="buscarAsistencia()">
                BUSCAR
            </button>

            <button onclick="editarAsistencia()">
                EDITAR
            </button>

            <button onclick="eliminarAsistencia()">
                ELIMINAR
            </button>

            <button onclick="mostrarAsistencias()">
                VER ASISTENCIAS
            </button>

            <button onclick="limpiarModulo()">
                LIMPIAR
            </button>

        </div>


        <div id="resultado-modulo"></div>
    `;
}


function guardarAsistencia() {

    const matricula =
        obtenerValor("asis-matricula");

    const fecha =
        obtenerValor("asis-fecha");

    const estado =
        obtenerValor("asis-estado");

    if (
        !matricula ||
        !fecha ||
        !estado
    ) {

        mostrarMensaje(
            "Matrícula, fecha y estado son obligatorios.",
            "error"
        );

        return;
    }

    const existe =
        datos.asistencias.some(
            asistencia =>
                asistencia.matricula === matricula &&
                asistencia.fecha === fecha
        );

    if (existe) {

        mostrarMensaje(
            "Ya existe una asistencia para esa matrícula y fecha.",
            "error"
        );

        return;
    }

    datos.asistencias.push({

        matricula,

        fecha,

        estado,

        observaciones:
            obtenerValor(
                "asis-observaciones"
            )
    });

    guardarDatos();

    mostrarMensaje(
        "Asistencia guardada correctamente."
    );

    limpiarModulo();
}


function buscarAsistencia() {

    const matricula =
        obtenerValor("asis-matricula");

    const lista =
        datos.asistencias
            .filter(
                asistencia =>
                    asistencia.matricula ===
                    matricula
            )
            .sort(
                (a, b) =>
                    b.fecha.localeCompare(
                        a.fecha
                    )
            );

    if (lista.length === 0) {

        mostrarMensaje(
            "No se encontraron asistencias.",
            "error"
        );

        return;
    }

    const asistencia = lista[0];

    document.getElementById(
        "asis-fecha"
    ).value = asistencia.fecha;

    document.getElementById(
        "asis-estado"
    ).value = asistencia.estado;

    document.getElementById(
        "asis-observaciones"
    ).value =
        asistencia.observaciones || "";

    mostrarMensaje(
        "Asistencia encontrada."
    );
}


function editarAsistencia() {

    const matricula =
        obtenerValor("asis-matricula");

    const fecha =
        obtenerValor("asis-fecha");

    const asistencia =
        datos.asistencias.find(
            asistencia =>
                asistencia.matricula === matricula &&
                asistencia.fecha === fecha
        );

    if (!asistencia) {

        mostrarMensaje(
            "No se encontró la asistencia.",
            "error"
        );

        return;
    }

    const estado =
        obtenerValor("asis-estado");

    if (!estado) {

        mostrarMensaje(
            "Selecciona un estado.",
            "error"
        );

        return;
    }

    asistencia.estado = estado;

    asistencia.observaciones =
        obtenerValor(
            "asis-observaciones"
        );

    guardarDatos();

    mostrarMensaje(
        "Asistencia modificada correctamente."
    );
}


function eliminarAsistencia() {

    const matricula =
        obtenerValor("asis-matricula");

    const fecha =
        obtenerValor("asis-fecha");

    const posicion =
        datos.asistencias.findIndex(
            asistencia =>
                asistencia.matricula === matricula &&
                asistencia.fecha === fecha
        );

    if (posicion === -1) {

        mostrarMensaje(
            "No se encontró la asistencia.",
            "error"
        );

        return;
    }

    if (
        confirm(
            "¿Estás seguro de que deseas eliminar esta asistencia?"
        )
    ) {

        datos.asistencias.splice(
            posicion,
            1
        );

        guardarDatos();

        mostrarMensaje(
            "Asistencia eliminada correctamente."
        );

        limpiarModulo();
    }
}


function mostrarAsistencias() {

    const resultado =
        document.getElementById(
            "resultado-modulo"
        );

    if (!resultado) {
        return;
    }

    const lista =
        [...datos.asistencias].sort(
            (a, b) =>
                b.fecha.localeCompare(
                    a.fecha
                )
        );

    resultado.innerHTML = `

        <div class="tabla-contenedor">

            <h2>
                REGISTRO DE ASISTENCIAS
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Matrícula</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Observaciones</th>

                    </tr>

                </thead>

                <tbody>

                    ${lista.map(
                        asistencia => `

                        <tr>

                            <td>
                                ${escaparHTML(
                                    asistencia.matricula
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    asistencia.fecha
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    asistencia.estado
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    asistencia.observaciones
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ======================================================
// TAREAS
// ======================================================

function moduloTareas() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    07 · TAREAS
                </h1>

                <p>
                    Control y seguimiento de tareas
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="formulario-grid">

            <input
                id="tarea-matricula"
                type="text"
                placeholder="Matrícula">

            <input
                id="tarea-materia"
                type="text"
                placeholder="Materia">

            <input
                id="tarea-nombre"
                type="text"
                placeholder="Tarea">

            <input
                id="tarea-fecha"
                type="date">

            <select id="tarea-estado">

                <option value="">
                    Selecciona estado
                </option>

                <option value="Pendiente">
                    Pendiente
                </option>

                <option value="Entregada">
                    Entregada
                </option>

                <option value="Vencida">
                    Vencida
                </option>

            </select>

            <input
                id="tarea-descripcion"
                type="text"
                placeholder="Descripción">

        </div>


        <div class="botones-grid">

            <button onclick="guardarTarea()">
                GUARDAR
            </button>

            <button onclick="buscarTarea()">
                BUSCAR
            </button>

            <button onclick="editarTarea()">
                EDITAR
            </button>

            <button onclick="eliminarTarea()">
                ELIMINAR
            </button>

            <button onclick="mostrarTareas()">
                VER TAREAS
            </button>

            <button onclick="limpiarModulo()">
                LIMPIAR
            </button>

        </div>


        <div id="resultado-modulo"></div>
    `;
}


function guardarTarea() {

    const matricula =
        obtenerValor("tarea-matricula");

    const materia =
        obtenerValor("tarea-materia");

    const tarea =
        obtenerValor("tarea-nombre");

    const fecha =
        obtenerValor("tarea-fecha");

    const estado =
        obtenerValor("tarea-estado");

    if (
        !matricula ||
        !materia ||
        !tarea ||
        !fecha ||
        !estado
    ) {

        mostrarMensaje(
            "Matrícula, materia, tarea, fecha y estado son obligatorios.",
            "error"
        );

        return;
    }

    const existe =
        datos.tareas.some(
            registro =>
                registro.matricula === matricula &&
                registro.materia.toLowerCase() ===
                    materia.toLowerCase() &&
                registro.tarea.toLowerCase() ===
                    tarea.toLowerCase()
        );

    if (existe) {

        mostrarMensaje(
            "Esa tarea ya está registrada para el alumno.",
            "error"
        );

        return;
    }

    datos.tareas.push({

        matricula,

        materia,

        tarea,

        descripcion:
            obtenerValor(
                "tarea-descripcion"
            ),

        fecha,

        estado
    });

    guardarDatos();

    mostrarMensaje(
        "Tarea guardada correctamente."
    );

    limpiarModulo();
}


function buscarTarea() {

    const matricula =
        obtenerValor(
            "tarea-matricula"
        );

    const tarea =
        obtenerValor(
            "tarea-nombre"
        );

    const registro =
        datos.tareas.find(
            registro =>
                registro.matricula ===
                    matricula &&
                registro.tarea.toLowerCase() ===
                    tarea.toLowerCase()
        );

    if (!registro) {

        mostrarMensaje(
            "No se encontró la tarea.",
            "error"
        );

        return;
    }

    document.getElementById(
        "tarea-materia"
    ).value = registro.materia;

    document.getElementById(
        "tarea-fecha"
    ).value = registro.fecha;

    document.getElementById(
        "tarea-estado"
    ).value = registro.estado;

    document.getElementById(
        "tarea-descripcion"
    ).value =
        registro.descripcion || "";

    mostrarMensaje(
        "Tarea encontrada."
    );
}


function editarTarea() {

    const matricula =
        obtenerValor(
            "tarea-matricula"
        );

    const tarea =
        obtenerValor(
            "tarea-nombre"
        );

    const registro =
        datos.tareas.find(
            registro =>
                registro.matricula ===
                    matricula &&
                registro.tarea.toLowerCase() ===
                    tarea.toLowerCase()
        );

    if (!registro) {

        mostrarMensaje(
            "No se encontró la tarea.",
            "error"
        );

        return;
    }

    const materia =
        obtenerValor(
            "tarea-materia"
        );

    const fecha =
        obtenerValor(
            "tarea-fecha"
        );

    const estado =
        obtenerValor(
            "tarea-estado"
        );

    if (
        !materia ||
        !fecha ||
        !estado
    ) {

        mostrarMensaje(
            "Completa los datos obligatorios.",
            "error"
        );

        return;
    }

    registro.materia = materia;
    registro.fecha = fecha;
    registro.estado = estado;

    registro.descripcion =
        obtenerValor(
            "tarea-descripcion"
        );

    guardarDatos();

    mostrarMensaje(
        "Tarea modificada correctamente."
    );
}


function eliminarTarea() {

    const matricula =
        obtenerValor(
            "tarea-matricula"
        );

    const tarea =
        obtenerValor(
            "tarea-nombre"
        );

    const posicion =
        datos.tareas.findIndex(
            registro =>
                registro.matricula ===
                    matricula &&
                registro.tarea.toLowerCase() ===
                    tarea.toLowerCase()
        );

    if (posicion === -1) {

        mostrarMensaje(
            "No se encontró la tarea.",
            "error"
        );

        return;
    }

    if (
        confirm(
            "¿Estás seguro de que deseas eliminar esta tarea?"
        )
    ) {

        datos.tareas.splice(
            posicion,
            1
        );

        guardarDatos();

        mostrarMensaje(
            "Tarea eliminada correctamente."
        );

        limpiarModulo();
    }
}


function mostrarTareas() {

    const resultado =
        document.getElementById(
            "resultado-modulo"
        );

    if (!resultado) {
        return;
    }

    const lista =
        [...datos.tareas].sort(
            (a, b) =>
                a.fecha.localeCompare(
                    b.fecha
                ) ||
                a.tarea.localeCompare(
                    b.tarea
                )
        );

    resultado.innerHTML = `

        <div class="tabla-contenedor">

            <h2>
                REGISTRO DE TAREAS
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Matrícula</th>
                        <th>Materia</th>
                        <th>Tarea</th>
                        <th>Entrega</th>
                        <th>Estado</th>

                    </tr>

                </thead>

                <tbody>

                    ${lista.map(
                        registro => `

                        <tr>

                            <td>
                                ${escaparHTML(
                                    registro.matricula
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    registro.materia
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    registro.tarea
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    registro.fecha
                                )}
                            </td>

                            <td>
                                ${escaparHTML(
                                    registro.estado
                                )}
                            </td>

                        </tr>

                    `
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ======================================================
// REPORTES
// ======================================================

function contar(tabla) {

    if (!datos[tabla]) {
        return 0;
    }

    return datos[tabla].length;
}


function moduloReportes() {

    return `

        <div class="encabezado">

            <div>

                <h1>
                    08 · CENTRO DE REPORTES
                </h1>

                <p>
                    Indicadores y consultas rápidas del sistema
                </p>

            </div>

            <button onclick="volverMenu()">
                MENÚ PRINCIPAL
            </button>

        </div>


        <div class="tarjetas-reportes">

            <div class="reporte-card">

                <span>👩‍🎓</span>

                <h3>
                    ESTUDIANTES
                </h3>

                <strong>
                    ${contar("alumnos")}
                </strong>

            </div>


            <div class="reporte-card">

                <span>👨‍🏫</span>

                <h3>
                    DOCENTES
                </h3>

                <strong>
                    ${contar("profesores")}
                </strong>

            </div>


            <div class="reporte-card">

                <span>👥</span>

                <h3>
                    GRUPOS
                </h3>

                <strong>
                    ${contar("grupos")}
                </strong>

            </div>


            <div class="reporte-card">

                <span>📚</span>

                <h3>
                    MATERIAS
                </h3>

                <strong>
                    ${contar("materias")}
                </strong>

            </div>

        </div>


        <div class="tarjeta reporte-detalle">

            <h2>
                PANEL DE INDICADORES
            </h2>

            <div class="indicadores">

                <div>

                    <span>
                        Calificaciones
                    </span>

                    <strong>
                        ${contar("calificaciones")}
                    </strong>

                </div>


                <div>

                    <span>
                        Asistencias
                    </span>

                    <strong>
                        ${contar("asistencias")}
                    </strong>

                </div>


                <div>

                    <span>
                        Tareas
                    </span>

                    <strong>
                        ${contar("tareas")}
                    </strong>

                </div>

            </div>

        </div>


        <div class="tarjeta">

            <h2>
                RESUMEN DEL SISTEMA
            </h2>

            <p>

                El sistema cuenta actualmente con

                <strong>
                    ${contar("alumnos")}
                </strong>

                estudiantes,

                <strong>
                    ${contar("profesores")}
                </strong>

                docentes,

                <strong>
                    ${contar("grupos")}
                </strong>

                grupos y

                <strong>
                    ${contar("materias")}
                </strong>

                materias registradas.

            </p>

        </div>
    `;
}


// ======================================================
// ACTUALIZAR REPORTES
// ======================================================

function actualizarReportes() {

    const pantalla =
        document.getElementById(
            "pantalla-modulo"
        );

    if (
        pantalla &&
        pantalla.classList.contains("activa")
    ) {

        const contenido =
            document.getElementById(
                "contenido-modulo"
            );

        if (
            contenido &&
            contenido.innerHTML.includes(
                "CENTRO DE REPORTES"
            )
        ) {

            contenido.innerHTML =
                moduloReportes();
        }
    }
}


// ======================================================
// INICIALIZACIÓN
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        guardarDatos();

        // Asegurar que el modal empiece oculto
        const modal =
            document.getElementById("modal");

        if (modal) {
            modal.classList.add("oculto");

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target === modal
                    ) {
                        cerrarModal();
                    }
                }
            );
        }

        mostrarPantalla(
            "pantalla-inicio"
        );
    }
);