// Datos de cada apuesta destacada y sus eventos en vivo (datos de demostración)
const DEPORTES = {
    futbol: {
        titulo: "Toda apuesta - Fútbol",
        precio: "Desde $4.000",
        resumen: "Apuesta a ganador, goles totales, tiros de esquina o tarjetas en cualquier liga.",
        detalle: "Incluye ligas europeas, Copa Libertadores y ligas locales con cashout disponible.",
        badge: "Popular",
        imagen: "fondo_apuestas.jpg",
        respaldo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
        tituloVivo: "Eventos en Vivo · Fútbol",
        eventos: [
            { liga: "⚽ Champions League • Min 64'", partido: "Real Madrid vs Manchester City",
              cuotas: [["1", "Real Madrid", 2.15], ["X", "Empate (RM vs MC)", 3.40], ["2", "Man. City", 2.90]] },
            { liga: "⚽ Copa Libertadores • Min 71'", partido: "Flamengo vs River Plate",
              cuotas: [["1", "Flamengo", 1.95], ["X", "Empate (FLA vs RIV)", 3.10], ["2", "River Plate", 3.60]] },
            { liga: "⚽ Liga BetPlay • Min 38'", partido: "Atlético Nacional vs Millonarios",
              cuotas: [["1", "Atlético Nacional", 2.30], ["X", "Empate (NAL vs MIL)", 3.00], ["2", "Millonarios", 3.05]] }
        ]
    },
    voleibol: {
        titulo: "Apuestas de Voleibol",
        precio: "Desde $3.000",
        resumen: "Pronostica el ganador por set, puntos totales y torneos internacionales.",
        detalle: "Cobertura completa de la Liga de Naciones, torneos olímpicos y ligas nacionales.",
        badge: "",
        imagen: "voleiball.jpg",
        respaldo: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80",
        tituloVivo: "Eventos en Vivo · Voleibol",
        eventos: [
            { liga: "🏐 Liga de Naciones • 3er Set", partido: "Brasil vs Italia",
              cuotas: [["1", "Brasil", 1.70], ["2", "Italia", 2.10]] },
            { liga: "🏐 Sudamericano • 2do Set", partido: "Colombia vs Argentina",
              cuotas: [["1", "Colombia", 2.40], ["2", "Argentina", 1.60]] },
            { liga: "🏐 Liga de Naciones • 4to Set", partido: "Polonia vs Japón",
              cuotas: [["1", "Polonia", 1.55], ["2", "Japón", 2.45]] }
        ]
    },
    baloncesto: {
        titulo: "Apuestas de Baloncesto",
        precio: "Desde $2.000",
        resumen: "Apuesta por cuartos, hándicap asiático, triples y rendimiento de jugadores.",
        detalle: "Disponible para NBA, Euroliga y FIBA con estadísticas en vivo.",
        badge: "Cuota Alta",
        imagen: "baloncesto.jpg",
        respaldo: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
        tituloVivo: "Eventos en Vivo · Baloncesto",
        eventos: [
            { liga: "🏀 NBA • 3er Cuarto", partido: "LA Lakers vs Boston Celtics",
              cuotas: [["1", "LA Lakers", 1.85], ["2", "Boston Celtics", 1.95]] },
            { liga: "🏀 NBA • 2do Cuarto", partido: "Golden State Warriors vs Denver Nuggets",
              cuotas: [["1", "Golden State Warriors", 2.05], ["2", "Denver Nuggets", 1.80]] },
            { liga: "🏀 Euroliga • 4to Cuarto", partido: "Real Madrid vs FC Barcelona",
              cuotas: [["1", "Real Madrid", 1.65], ["2", "FC Barcelona", 2.20]] }
        ]
    }
};

function crearEventoDOM(evento) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "match-card";

    const info = document.createElement("div");
    info.className = "match-info";
    const liga = document.createElement("span");
    liga.className = "league";
    liga.textContent = evento.liga;
    const partido = document.createElement("h4");
    partido.textContent = evento.partido;
    info.append(liga, partido);

    const grupo = document.createElement("div");
    grupo.className = "odds-group";
    evento.cuotas.forEach(([etiqueta, equipo, cuota]) => {
        const boton = document.createElement("button");
        boton.className = "odd-btn";
        boton.type = "button";
        boton.append(etiqueta + " ");
        const valor = document.createElement("span");
        valor.textContent = cuota.toFixed(2);
        boton.appendChild(valor);
        boton.addEventListener("click", () => seleccionarCuota(equipo, cuota));
        grupo.appendChild(boton);
    });

    tarjeta.append(info, grupo);
    return tarjeta;
}

function mostrarDeporte() {
    const clave = new URLSearchParams(window.location.search).get("deporte");
    const deporte = DEPORTES[clave];

    // Si el enlace no trae un deporte válido, volvemos al inicio
    if (!deporte) {
        window.location.replace("index.html#Apuestas");
        return;
    }

    document.title = deporte.titulo + " | Premium Apuestas";

    const img = document.getElementById("detalle-img");
    img.src = deporte.imagen;
    img.alt = deporte.titulo;
    img.onerror = () => { img.onerror = null; img.src = deporte.respaldo; };

    const badge = document.getElementById("detalle-badge");
    if (deporte.badge) {
        badge.textContent = deporte.badge;
        badge.hidden = false;
    }

    document.getElementById("detalle-titulo").textContent = deporte.titulo;
    document.getElementById("detalle-precio").textContent = deporte.precio;
    document.getElementById("detalle-resumen").textContent = deporte.resumen;
    document.getElementById("detalle-descripcion").textContent = deporte.detalle;
    document.getElementById("vivo-titulo").textContent = deporte.tituloVivo;

    const lista = document.getElementById("lista-eventos");
    deporte.eventos.forEach((evento) => lista.appendChild(crearEventoDOM(evento)));
}

mostrarDeporte();
