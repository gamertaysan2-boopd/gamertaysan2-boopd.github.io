import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, signOut, sendEmailVerification,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    getFirestore, doc, getDoc, setDoc, getDocs, updateDoc,
    collection, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const ROLES = ["usuario", "moderador", "admin"];
const configurado = !String(firebaseConfig.apiKey).startsWith("TU_");

let auth = null;
let db = null;
let nombrePendiente = null; // nombre escrito en el registro, se guarda al crear el perfil

if (configurado) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

const $ = (id) => document.getElementById(id);
const esStaff = () => !!window.sesion && ["admin", "moderador"].includes(window.sesion.role);
const esAdmin = () => !!window.sesion && window.sesion.role === "admin";

/* ---------- Mensajes ---------- */
function mostrarMensaje(texto, tipo = "error") {
    const caja = $("auth-mensaje");
    caja.textContent = texto;
    caja.className = "auth-mensaje " + tipo;
    caja.hidden = !texto;
}

function traducirError(error) {
    switch (error && error.code) {
        case "auth/email-already-in-use": return "Ese correo ya está registrado.";
        case "auth/invalid-email": return "El correo no es válido.";
        case "auth/weak-password": return "La contraseña es demasiado débil.";
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password": return "Correo o contraseña incorrectos.";
        case "auth/too-many-requests": return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
        case "auth/network-request-failed": return "Sin conexión. Revisa tu internet.";
        case "permission-denied": return "No tienes permiso para hacer esto.";
        default: return "Ocurrió un error. Inténtalo de nuevo.";
    }
}

function exigirConfiguracion() {
    if (configurado) return true;
    mostrarMensaje("Falta configurar Firebase: completa firebase-config.js (mira el README).");
    return false;
}

function ocupado(boton, estado, textoOriginal) {
    boton.disabled = estado;
    if (textoOriginal) boton.textContent = estado ? "Procesando..." : textoOriginal;
}

/* ---------- Perfil en Firestore ---------- */
async function cargarPerfil(user) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();

    // Primera vez: se crea SIEMPRE como "usuario" (las reglas lo exigen).
    const nombre = (nombrePendiente || user.displayName || user.email.split("@")[0]).trim().slice(0, 40);
    const nuevo = {
        nombre: nombre.length >= 2 ? nombre : "Usuario",
        email: user.email,
        role: "usuario",
        bloqueado: false,
        createdAt: serverTimestamp()
    };
    await setDoc(ref, nuevo);
    nombrePendiente = null;
    return nuevo;
}

/* ---------- Estado de sesión ---------- */
if (configurado) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.sesion = null;
            pintarSesion();
            return;
        }
        let perfil;
        try {
            perfil = await cargarPerfil(user);
        } catch (e) {
            console.error("No se pudo cargar el perfil:", e);
            await signOut(auth);
            abrirAuth("login");
            mostrarMensaje("No se pudo cargar tu perfil. Revisa las reglas de Firestore.");
            return;
        }
        if (perfil.bloqueado) {
            await signOut(auth);
            abrirAuth("login");
            mostrarMensaje("Tu cuenta está suspendida. Contacta a soporte.");
            return;
        }
        window.sesion = {
            uid: user.uid,
            email: user.email,
            nombre: perfil.nombre,
            role: ROLES.includes(perfil.role) ? perfil.role : "usuario"
        };
        pintarSesion();
    });
}

function pintarSesion() {
    const s = window.sesion;
    $("btn-ingresar").hidden = !!s;
    $("user-chip").hidden = !s;
    $("btn-salir").hidden = !s;
    $("saldo-badge").hidden = !s;
    $("nav-panel").hidden = !esStaff();
    $("panel").hidden = !esStaff();

    if (s) {
        $("user-nombre").textContent = s.nombre;
        const rol = $("user-rol");
        rol.textContent = s.role;
        rol.className = "rol-badge rol-" + s.role;
        cerrarAuth();
        if (esStaff()) cargarUsuarios();
    }
}

/* ---------- Modal de sesión ---------- */
window.abrirAuth = function (tab = "login") {
    cambiarTab(tab);
    $("auth-modal").style.display = "flex";
};

window.cerrarAuth = function () {
    $("auth-modal").style.display = "none";
    mostrarMensaje("");
};

window.cambiarTab = function (tab) {
    const login = tab === "login";
    $("form-login").hidden = !login;
    $("form-registro").hidden = login;
    $("tab-login").classList.toggle("active", login);
    $("tab-registro").classList.toggle("active", !login);
    $("auth-titulo").textContent = login ? "Iniciar sesión" : "Crear cuenta";
    mostrarMensaje("");
};

/* ---------- Login / Registro / Salir ---------- */
window.enviarLogin = async function (e) {
    e.preventDefault();
    if (!exigirConfiguracion()) return;
    const boton = e.submitter || e.target.querySelector("button[type=submit]");
    const email = $("login-email").value.trim();
    const clave = $("login-clave").value;
    mostrarMensaje("");
    ocupado(boton, true, "Entrar");
    try {
        await signInWithEmailAndPassword(auth, email, clave);
        e.target.reset();
    } catch (err) {
        mostrarMensaje(traducirError(err));
    } finally {
        ocupado(boton, false, "Entrar");
    }
};

window.enviarRegistro = async function (e) {
    e.preventDefault();
    if (!exigirConfiguracion()) return;
    const boton = e.submitter || e.target.querySelector("button[type=submit]");
    const nombre = $("reg-nombre").value.trim();
    const email = $("reg-email").value.trim();
    const clave = $("reg-clave").value;
    const clave2 = $("reg-clave2").value;

    if (nombre.length < 2 || nombre.length > 40) return mostrarMensaje("El nombre debe tener entre 2 y 40 caracteres.");
    if (clave.length < 8 || !/[A-Za-z]/.test(clave) || !/\d/.test(clave)) {
        return mostrarMensaje("La contraseña debe tener mínimo 8 caracteres, con letras y números.");
    }
    if (clave !== clave2) return mostrarMensaje("Las contraseñas no coinciden.");
    if (!$("reg-mayor").checked) return mostrarMensaje("Debes confirmar que eres mayor de 18 años.");

    mostrarMensaje("");
    ocupado(boton, true, "Crear cuenta");
    nombrePendiente = nombre;
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, clave);
        sendEmailVerification(cred.user).catch(() => {});
        e.target.reset();
    } catch (err) {
        nombrePendiente = null;
        mostrarMensaje(traducirError(err));
    } finally {
        ocupado(boton, false, "Crear cuenta");
    }
};

window.recuperarClave = async function () {
    if (!exigirConfiguracion()) return;
    const email = $("login-email").value.trim();
    if (!email) return mostrarMensaje("Escribe tu correo arriba y vuelve a pulsar el enlace.");
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (err) {
        if (err.code === "auth/invalid-email" || err.code === "auth/network-request-failed") {
            return mostrarMensaje(traducirError(err));
        }
    }
    // Mismo mensaje exista o no el correo (evita revelar qué correos están registrados).
    mostrarMensaje("Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.", "ok");
};

window.cerrarSesion = async function () {
    if (auth) await signOut(auth);
};

/* ---------- Panel (admin / moderador) ---------- */
async function cargarUsuarios() {
    const tbody = $("tabla-usuarios");
    try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
        tbody.replaceChildren();
        const total = { usuarios: 0, staff: 0, bloqueados: 0 };
        snap.forEach((d) => {
            const u = d.data();
            total.usuarios++;
            if (u.role !== "usuario") total.staff++;
            if (u.bloqueado) total.bloqueados++;
            tbody.appendChild(filaUsuario(d.id, u));
        });
        $("stat-total").textContent = total.usuarios;
        $("stat-staff").textContent = total.staff;
        $("stat-bloqueados").textContent = total.bloqueados;
    } catch (err) {
        console.error(err);
        tbody.replaceChildren();
        $("panel-error").textContent = "No se pudo cargar la lista: " + traducirError(err);
    }
}

function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto; // textContent: los datos del usuario nunca se interpretan como HTML
    return td;
}

function filaUsuario(uid, u) {
    const tr = document.createElement("tr");
    const soyYo = window.sesion && uid === window.sesion.uid;

    tr.appendChild(celda(u.nombre + (soyYo ? " (tú)" : "")));
    tr.appendChild(celda(u.email));

    // Rol: el admin puede cambiarlo; el moderador solo lo ve.
    const tdRol = document.createElement("td");
    if (esAdmin() && !soyYo) {
        const sel = document.createElement("select");
        ROLES.forEach((r) => {
            const op = document.createElement("option");
            op.value = r;
            op.textContent = r;
            op.selected = r === u.role;
            sel.appendChild(op);
        });
        sel.addEventListener("change", () => cambiarRol(uid, sel, u));
        tdRol.appendChild(sel);
    } else {
        const b = document.createElement("span");
        b.className = "rol-badge rol-" + u.role;
        b.textContent = u.role;
        tdRol.appendChild(b);
    }
    tr.appendChild(tdRol);

    const tdEstado = document.createElement("td");
    const est = document.createElement("span");
    est.className = u.bloqueado ? "estado estado-bloqueado" : "estado estado-activo";
    est.textContent = u.bloqueado ? "Bloqueado" : "Activo";
    tdEstado.appendChild(est);
    tr.appendChild(tdEstado);

    // Bloquear: admin a cualquiera (menos a sí mismo); moderador solo a usuarios.
    const puedeBloquear = !soyYo && (esAdmin() || (u.role === "usuario"));
    const tdAcc = document.createElement("td");
    if (puedeBloquear) {
        const btn = document.createElement("button");
        btn.className = "btn-tabla";
        btn.textContent = u.bloqueado ? "Desbloquear" : "Bloquear";
        btn.addEventListener("click", () => alternarBloqueo(uid, u, btn));
        tdAcc.appendChild(btn);
    }
    tr.appendChild(tdAcc);
    return tr;
}

async function cambiarRol(uid, select, u) {
    const nuevo = select.value;
    select.disabled = true;
    $("panel-error").textContent = "";
    try {
        await updateDoc(doc(db, "users", uid), { role: nuevo });
        u.role = nuevo;
        cargarUsuarios();
    } catch (err) {
        select.value = u.role; // revierte si las reglas lo rechazan
        $("panel-error").textContent = "No se pudo cambiar el rol: " + traducirError(err);
        select.disabled = false;
    }
}

async function alternarBloqueo(uid, u, boton) {
    boton.disabled = true;
    $("panel-error").textContent = "";
    try {
        await updateDoc(doc(db, "users", uid), { bloqueado: !u.bloqueado });
        cargarUsuarios();
    } catch (err) {
        $("panel-error").textContent = "No se pudo actualizar: " + traducirError(err);
        boton.disabled = false;
    }
}
