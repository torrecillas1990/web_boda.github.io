/* ==========================================================================
   VITALSTATS - ENGINE CALCULADORA DE RITMO PRO 2026
   ========================================================================== */

// --- 1. CLASE PARA RUTA MANUAL (LÍNEA RECTA) ---
// Imprescindible para que el mapa no dependa de servidores externos
const StraightRouter = L.Class.extend({
    route: function(waypoints, callback, context) {
        const pts = waypoints.filter(wp => wp.latLng).map(wp => wp.latLng);
        
        if (pts.length < 2) {
            return callback.call(context, null, []); 
        }

        const route = {
            name: 'Ruta Manual',
            summary: { totalDistance: 0, totalTime: 0 },
            coordinates: pts,
            waypoints: waypoints,
            inputWaypoints: waypoints,
            instructions: [] 
        };

        // Cálculo de distancia geométrica (línea recta)
        for (let i = 0; i < pts.length - 1; i++) {
            route.summary.totalDistance += pts[i].distanceTo(pts[i+1]);
        }

        // Simular respuesta asíncrona para que Leaflet no se bloquee
        setTimeout(() => {
            callback.call(context, null, [route]);
        }, 50);
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
    router: routers.auto, 
    createMarker: (i, wp) => L.marker(wp.latLng, { draggable: true })
}).addTo(map);

// --- 3. GESTIÓN DE EVENTOS DE TRAZADO ---

// IMPORTANTE: Cambio de modo Manual/Auto
document.getElementById('routing-mode')?.addEventListener('change', function(e) {
    const modo = e.target.value;
    const nuevoRouter = routers[modo];

    // Actualizamos el router en ambos sitios internos del control
    control.options.router = nuevoRouter;
    control.getPlan().options.router = nuevoRouter;
    
    // Forzamos el recálculo refrescando los waypoints actuales
    const currentWps = control.getWaypoints();
    if (currentWps.filter(wp => wp.latLng).length >= 2) {
        control.setWaypoints(currentWps); 
    }
});

// Clic derecho para añadir puntos
map.on('contextmenu', function(e) {
    const waypoints = control.getWaypoints().filter(wp => wp.latLng !== null).map(wp => wp.latLng);
    waypoints.push(e.latlng);
    control.setWaypoints(waypoints);
});

// --- 4. LÓGICA DE CÁLCULOS Y CALORÍAS ---

function calculateCalories(vKmh, weight, timeHours) {
    let met = vKmh < 8 ? 7 : (vKmh < 12 ? 11.5 : 12.8);
    return Math.round(met * weight * timeHours);
}

function autoCalculate(type) {
    const km = parseFloat(document.getElementById('dist_km').value) || 0;
    const m = parseFloat(document.getElementById('dist_m').value) || 0;
    const dist = km + (m / 1000);
    
    const weight = parseFloat(document.getElementById('user_weight').value) || 70;
    const pm = parseFloat(document.getElementById('p_min').value) || 0;
    const ps = parseFloat(document.getElementById('p_sec').value) || 0;
    const pace = (pm * 60) + ps;

    const th = parseFloat(document.getElementById('t_h').value) || 0;
    const tm = parseFloat(document.getElementById('t_m').value) || 0;
    const ts = parseFloat(document.getElementById('t_s').value) || 0;
    const time = (th * 3600) + (tm * 60) + ts;

    if (dist <= 0) return;

    if (type === 'dist' || type === 'p') {
        if (pace > 0) {
            const resT = dist * pace;
            document.getElementById('t_h').value = Math.floor(resT / 3600);
            document.getElementById('t_m').value = Math.floor((resT % 3600) / 60);
            document.getElementById('t_s').value = Math.round(resT % 60);
            document.getElementById('v_kmh').value = (3600 / pace).toFixed(2);
        }
    } else if (type === 't') {
        if (time > 0) {
            const resP = time / dist;
            document.getElementById('p_min').value = Math.floor(resP / 60);
            document.getElementById('p_sec').value = Math.round(resP % 60);
            document.getElementById('v_kmh').value = ((dist / time) * 3600).toFixed(2);
        }
    }

    const v = parseFloat(document.getElementById('v_kmh').value) || 0;
    document.getElementById('res_calories').value = calculateCalories(v, weight, (dist * (pace || 0)) / 3600) + " kcal";
}

// --- 5. PERSISTENCIA Y GPX ---

control.on('routesfound', (e) => {
    const d = e.routes[0].summary.totalDistance;
    document.getElementById('dist_km').value = Math.floor(d / 1000);
    document.getElementById('dist_m').value = Math.round(d % 1000);
    autoCalculate('dist');
});

window.clearAll = function() {
    if(confirm("¿Reiniciar ruta?")) {
        control.setWaypoints([]);
        document.querySelectorAll('input').forEach(i => i.value = "");
    }
};

window.exportToGPX = function() {
    const wps = control.getWaypoints().filter(wp => wp.latLng);
    if (wps.length < 2) return alert("Crea una ruta primero");
    let gpx = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="VitalStats"><trk><trkseg>`;
    wps.forEach(wp => gpx += `<trkpt lat="${wp.latLng.lat}" lon="${wp.latLng.lng}"></trkpt>`);
    gpx += `</trkseg></trk></gpx>`;
    const blob = new Blob([gpx], {type: 'application/gpx+xml'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ruta.gpx';
    a.click();
};


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
