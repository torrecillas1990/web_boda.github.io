// --- CONFIGURACIÓN INICIAL DEL MAPA ---
const map = L.map('map').setView([40.4167, -3.7037], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

const control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true,
    show: false,
    createMarker: (i, wp) => L.marker(wp.latLng, { draggable: true })
}).addTo(map);

// --- GESTIÓN DE GPX (CARGA Y PROCESAMIENTO) ---

// Función única para procesar el XML de un GPX
function processGPXData(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");
    const points = xml.querySelectorAll('trkpt');
    
    if (points.length === 0) {
        alert("El archivo GPX no contiene puntos válidos.");
        return;
    }

    const newWaypoints = [];
    points.forEach(pt => {
        const lat = parseFloat(pt.getAttribute('lat'));
        const lon = parseFloat(pt.getAttribute('lon'));
        newWaypoints.push(L.latLng(lat, lon));
    });

    // Filtramos para no saturar Leaflet (máximo 25 puntos)
    const sampledPoints = newWaypoints.length > 50 
        ? filterPoints(newWaypoints, 25) 
        : newWaypoints;

    control.setWaypoints(sampledPoints);
    
    // Centrar mapa
    const group = new L.featureGroup(sampledPoints.map(p => L.marker(p)));
    map.fitBounds(group.getBounds());

    // Disparar cálculos tras un pequeño delay para que Routing Machine termine
    setTimeout(() => autoCalculate('dist'), 600);
}

// Cargar catálogo desde JS
function cargarCatalogoRutas() {
    const select = document.getElementById('ruta-select');
    if (!select) return;

    // Ya no usamos fetch, usamos la variable global MIS_RUTAS
    select.innerHTML = '<option value="">-- Selecciona una ruta GPX --</option>';
    
    MIS_RUTAS.forEach(ruta => {
        const option = document.createElement('option');
        option.value = ruta.archivo;
        option.textContent = ruta.nombre;
        select.appendChild(option);
    });
}

// Evento: Selección de ruta del catálogo
document.getElementById('ruta-select').addEventListener('change', async (e) => {
    if (!e.target.value) return;
    try {
        const response = await fetch(`./rutas/${e.target.value}`);
        const gpxData = await response.text();
        processGPXData(gpxData);
    } catch (err) {
        alert("Error al acceder al archivo GPX en el servidor.");
    }
});

// Evento: Subida manual de GPX
document.getElementById('gpx-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processGPXData(ev.target.result);
    reader.readAsText(file);
});

// --- CÁLCULOS Y LÓGICA DE NEGOCIO ---

function autoCalculate(lastChangedType) {
    // 1. Obtener valores
    const km = parseFloat(document.getElementById('dist_km').value) || 0;
    const m = parseFloat(document.getElementById('dist_m').value) || 0;
    const totalDist = km + (m / 1000);
    
    const pm = parseFloat(document.getElementById('p_min').value) || 0;
    const ps = parseFloat(document.getElementById('p_sec').value) || 0;
    const paceInSec = (pm * 60) + ps;

    const th = parseFloat(document.getElementById('t_h').value) || 0;
    const tm = parseFloat(document.getElementById('t_m').value) || 0;
    const ts = parseFloat(document.getElementById('t_s').value) || 0;
    const totalTimeInSec = (th * 3600) + (tm * 60) + ts;
    
    const weight = parseFloat(document.getElementById('user_weight').value) || 70;

    if (totalDist <= 0) return;

    // 2. Lógica de decisión
    if (lastChangedType === 'v') {
        const vKmh = parseFloat(document.getElementById('v_kmh').value) || 0;
        if (vKmh > 0) {
            const paceDecimal = 60 / vKmh;
            document.getElementById('p_min').value = Math.floor(paceDecimal);
            document.getElementById('p_sec').value = Math.round((paceDecimal * 60) % 60);
            autoCalculate('p'); // Recalcular tiempo con el nuevo ritmo
        }
        return;
    }

    if (lastChangedType === 'dist' || lastChangedType === 'p') {
        if (paceInSec > 0) {
            const resTime = totalDist * paceInSec;
            document.getElementById('t_h').value = Math.floor(resTime / 3600);
            document.getElementById('t_m').value = Math.floor((resTime % 3600) / 60);
            document.getElementById('t_s').value = Math.round(resTime % 60);
            document.getElementById('v_kmh').value = (3600 / paceInSec).toFixed(2);
        }
    } else if (lastChangedType === 't') {
        if (totalTimeInSec > 0) {
            const resPace = totalTimeInSec / totalDist;
            document.getElementById('p_min').value = Math.floor(resPace / 60);
            document.getElementById('p_sec').value = Math.round(resPace % 60);
            document.getElementById('v_kmh').value = ((totalDist / totalTimeInSec) * 3600).toFixed(2);
        }
    }

    // 3. Calorías
    const vKmhActual = parseFloat(document.getElementById('v_kmh').value) || 0;
    const calories = calculateCalories(vKmhActual, weight, totalTimeInSec / 3600);
    document.getElementById('res_calories').value = calories + " kcal";
}

// --- EVENTOS INICIALES ---
window.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoRutas();
    loadFromLocal();
});

// Registrar eventos de guardado automático en todos los inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        autoCalculate(input.id.split('_')[0]);
        saveToLocal();
    });
});

control.on('routesfound', (e) => {
    const d = e.routes[0].summary.totalDistance;
    document.getElementById('dist_km').value = Math.floor(d / 1000);
    document.getElementById('dist_m').value = Math.round(d % 1000);
    autoCalculate('dist');
    saveToLocal();
});