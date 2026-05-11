/* ==========================================================================
   VITALSTATS - ENGINE CALCULADORA DE RITMO PRO
   ========================================================================== */

// --- 1. CLASE PARA RUTA MANUAL (LÍNEA RECTA) ---
const StraightRouter = L.Class.extend({
    route: function(waypoints, callback, context) {
        const routes = [{
            name: 'Ruta Manual',
            summary: { totalDistance: 0, totalTime: 0 },
            coordinates: [],
            waypoints: waypoints
        }];

        // Generamos una lista limpia de coordenadas sin duplicados
        for (let i = 0; i < waypoints.length; i++) {
            if (waypoints[i].latLng) {
                routes[0].coordinates.push(waypoints[i].latLng);
            }
        }

        // Calculamos la distancia geométrica total
        for (let i = 0; i < routes[0].coordinates.length - 1; i++) {
            routes[0].summary.totalDistance += routes[0].coordinates[i].distanceTo(routes[0].coordinates[i+1]);
        }

        // Ejecutamos el callback de forma asíncrona para que Leaflet lo procese correctamente
        setTimeout(() => {
            callback.call(context, null, routes);
        }, 10);
    }
});

const routers = {
    auto: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    manual: new StraightRouter()
};

// --- 2. CONFIGURACIÓN INICIAL DEL MAPA ---
const map = L.map('map').setView([40.4167, -3.7037], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

const control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true,
    show: false,
    router: routers.auto, // Por defecto automático
    createMarker: (i, wp) => L.marker(wp.latLng, { draggable: true })
}).addTo(map);

// --- 3. GESTIÓN DE EVENTOS DE TRAZADO ---

// Cambio de modo (Auto vs Manual)
document.getElementById('routing-mode')?.addEventListener('change', function(e) {
    const modo = e.target.value;
    
    // Cambiamos el router en el objeto de control principal
    control.options.router = routers[modo];
    
    // También lo actualizamos en el plan para mantener la coherencia
    control.getPlan().options.router = routers[modo];
    
    // Si ya hay puntos en el mapa, forzamos el recálculo inmediato
    if (control.getWaypoints().filter(wp => wp.latLng).length >= 2) {
        control.route();
    }
});

// Añadir puntos con Clic Derecho
map.on('contextmenu', function(e) {
    const waypoints = control.getWaypoints();
    const existingWaypoints = waypoints.filter(wp => wp.latLng !== null).map(wp => wp.latLng);
    existingWaypoints.push(e.latlng);
    control.setWaypoints(existingWaypoints);
});

// --- 4. UTILIDADES Y CÁLCULOS ---

function calculateCalories(vKmh, weight, timeHours) {
    let met = 0;
    if (vKmh <= 0) met = 0;
    else if (vKmh < 8) met = 7;
    else if (vKmh < 10) met = 9.8;
    else if (vKmh < 12) met = 11.5;
    else met = 12.8;
    return Math.round(met * weight * timeHours);
}

function autoCalculate(lastChangedType) {
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

    if (lastChangedType === 'v') {
        const vKmh = parseFloat(document.getElementById('v_kmh').value) || 0;
        if (vKmh > 0) {
            const paceDecimal = 60 / vKmh;
            document.getElementById('p_min').value = Math.floor(paceDecimal);
            document.getElementById('p_sec').value = Math.round((paceDecimal * 60) % 60);
            autoCalculate('p'); 
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

    const vKmhActual = parseFloat(document.getElementById('v_kmh').value) || 0;
    const calories = calculateCalories(vKmhActual, weight, totalTimeInSec / 3600);
    document.getElementById('res_calories').value = calories + " kcal";
}

// --- 5. GESTIÓN DE GPX Y PERSISTENCIA ---

function filterPoints(points, max) {
    const step = Math.ceil(points.length / max);
    return points.filter((_, i) => i % step === 0);
}

function processGPXData(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");
    const points = xml.querySelectorAll('trkpt');
    if (points.length === 0) return alert("GPX no válido");

    const newWaypoints = [];
    points.forEach(pt => {
        newWaypoints.push(L.latLng(parseFloat(pt.getAttribute('lat')), parseFloat(pt.getAttribute('lon'))));
    });

    const sampledPoints = newWaypoints.length > 50 ? filterPoints(newWaypoints, 25) : newWaypoints;
    control.setWaypoints(sampledPoints);
    const group = new L.featureGroup(sampledPoints.map(p => L.marker(p)));
    map.fitBounds(group.getBounds());
    setTimeout(() => autoCalculate('dist'), 600);
}

function saveToLocal() {
    const data = { km: document.getElementById('dist_km').value, m: document.getElementById('dist_m').value, weight: document.getElementById('user_weight').value };
    localStorage.setItem('runner_data', JSON.stringify(data));
}

function loadFromLocal() {
    const data = JSON.parse(localStorage.getItem('runner_data'));
    if (data) {
        document.getElementById('dist_km').value = data.km;
        document.getElementById('dist_m').value = data.m;
        document.getElementById('user_weight').value = data.weight;
        autoCalculate('dist');
    }
}

// --- FUNCIÓN PARA LLENAR EL SELECTOR DE RUTAS ---
function cargarCatalogoRutas() {
    const select = document.getElementById('ruta-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Selecciona una ruta GPX --</option>';
    
    // Comprobamos si existe la variable global definida en rutas.js
    if (typeof MIS_RUTAS !== 'undefined') {
        MIS_RUTAS.forEach(ruta => {
            const option = document.createElement('option');
            option.value = ruta.archivo;
            option.textContent = ruta.nombre;
            select.appendChild(option);
        });
    }
}

// --- EVENTO PARA CARGAR LA RUTA SELECCIONADA DEL CATÁLOGO ---
document.getElementById('ruta-select')?.addEventListener('change', async (e) => {
    if (!e.target.value) return;
    try {
        const response = await fetch(`../rutas/${e.target.value}`);
        const gpxData = await response.text();
        processGPXData(gpxData);
    } catch (err) {
        console.error("Error al acceder al archivo GPX:", err);
        alert("No se pudo cargar la ruta seleccionada.");
    }
});

// --- 6. INICIALIZACIÓN ---

window.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoRutas();
    loadFromLocal();
});

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

// Funciones globales (para los botones del HTML)
window.clearAll = function() {
    if (confirm("¿Borrar todo?")) {
        document.querySelectorAll('input').forEach(i => i.value = "");
        control.setWaypoints([]);
        localStorage.removeItem('runner_data');
    }
};

window.exportToGPX = function() {
    const waypoints = control.getWaypoints().filter(wp => wp.latLng);
    if (waypoints.length < 2) return alert("Dibuja una ruta primero");

    let gpx = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="VitalStats"><trk><trkseg>`;
    waypoints.forEach(wp => { gpx += `<trkpt lat="${wp.latLng.lat}" lon="${wp.latLng.lng}"></trkpt>`; });
    gpx += `</trkseg></trk></gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ruta.gpx'; a.click();
};