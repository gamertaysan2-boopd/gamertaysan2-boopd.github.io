let cuotaSeleccionada = 0;
let equipoSeleccionado = "";
let saldo = 50000;

// Seleccionar cuota en eventos en vivo
function seleccionarCuota(equipo, cuota) {
    equipoSeleccionado = equipo;
    cuotaSeleccionada = cuota;

    const contenedor = document.getElementById("seleccion-actual");
    contenedor.innerHTML = `
        <strong>Selección:</strong> ${equipo}<br>
        <strong>Cuota:</strong> <span style="color:#f59e0b">${cuota}</span>
    `;
    contenedor.style.borderStyle = "solid";
    contenedor.style.borderColor = "#10b981";
    calcularGanancia();
}

// Calcular ganancia potencial
function calcularGanancia() {
    const monto = parseFloat(document.getElementById("monto-apuesta").value) || 0;
    const total = monto * cuotaSeleccionada;
    document.getElementById("ganancia-total").innerText = "$" + total.toLocaleString("es-CO");
}

// Confirmar apuesta y descontar saldo
function realizarApuesta() {
    if (!window.sesion) {
        alert("Inicia sesión para confirmar tu apuesta.");
        abrirAuth("login");
        return;
    }
    const monto = parseFloat(document.getElementById("monto-apuesta").value) || 0;

    if (cuotaSeleccionada === 0) {
        alert("Por favor, selecciona una cuota primero.");
        return;
    }
    if (monto < 1000) {
        alert("El monto mínimo para apostar es $1.000.");
        return;
    }
    if (monto > saldo) {
        alert("Saldo insuficiente.");
        return;
    }

    saldo -= monto;
    document.getElementById("saldo-usuario").innerText = saldo.toLocaleString("es-CO");
    alert(`¡Apuesta confirmada por $${monto.toLocaleString("es-CO")} a ${equipoSeleccionado}!`);
}

// Filtrar tarjetas por deporte
function filtrarCategorias(categoria, boton) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    boton.classList.add("active");

    const tarjetas = document.querySelectorAll(".apuestas-card");
    tarjetas.forEach(card => {
        if (categoria === "todas" || card.dataset.categoria === categoria) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// Ventana Modal para Ver Detalles
function verDetalles(titulo, precio, descripcion) {
    document.getElementById("modal-titulo").innerText = titulo;
    document.getElementById("modal-precio").innerText = precio;
    document.getElementById("modal-descripcion").innerText = descripcion;
    document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}

// Envío del formulario de contacto
function enviarFormulario(e) {
    e.preventDefault();
    alert("¡Mensaje enviado con éxito! Nuestro equipo te responderá pronto.");
    e.target.reset();
}

// Menú hamburguesa (celular)
function toggleMenu() {
    document.getElementById("nav-links").classList.toggle("open");
}

// Cerrar el menú al tocar un enlace
document.querySelectorAll("#nav-links a").forEach(enlace => {
    enlace.addEventListener("click", () => {
        document.getElementById("nav-links").classList.remove("open");
    });
});

// Cerrar el modal al tocar fuera de la ventana
document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") cerrarModal();
});

document.getElementById("auth-modal").addEventListener("click", (e) => {
    if (e.target.id === "auth-modal") cerrarAuth();
});
