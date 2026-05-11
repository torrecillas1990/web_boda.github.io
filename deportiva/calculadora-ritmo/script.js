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

// --- ACTIVAR CLIC DERECHO PARA AÑADIR PUNTOS ---
map.on('contextmenu', function(e) {
    // 1. Obtener los puntos actuales del mapa
    const waypoints = control.getWaypoints();
    
    // 2. Buscar el primer hueco vacío o añadir uno nuevo
    const existingWaypoints = waypoints.filter(wp => wp.latLng !== null);
    
    // 3. Añadir el nuevo punto donde se hizo clic derecho
    const newWaypoints = existingWaypoints.map(wp => wp.latLng);
    newWaypoints.push(e.latlng);
    
    // 4. Actualizar el buscador de rutas
    control.setWaypoints(newWaypoints);
});

// --- ACTIVAR CLIC DERECHO PARA AÑADIR PUNTOS ---
map.on('contextmenu', function(e) {
    // 1. Obtener los puntos actuales del mapa
    const waypoints = control.getWaypoints();
    
    // 2. Buscar el primer hueco vacío o añadir uno nuevo
    const existingWaypoints = waypoints.filter(wp => wp.latLng !== null);
    
    // 3. Añadir el nuevo punto donde se hizo clic derecho
    const newWaypoints = existingWaypoints.map(wp => wp.latLng);
    newWaypoints.push(e.latlng);
    
    // 4. Actualizar el buscador de rutas
    control.setWaypoints(newWaypoints);
});

// --- UTILIDADES FALTANTES (Añadidas para que no den error) ---

// 1. Filtro de puntos para no colapsar el mapa
function filterPoints(points, max) {
    const step = Math.ceil(points.length / max);
    return points.filter((_, i) => i % step === 0);
}

// 2. Cálculo de calorías real según intensidad (METs)
function calculateCalories(vKmh, weight, timeHours) {
    // Fórmula basada en METs (Equivalente Metabólico)
    // Correr a 8km/h ≈ 8 METs, 12km/h ≈ 11.5 METs
    let met = 0;
    if (vKmh <= 0) met = 0;
    else if (vKmh < 8) met = 7;
    else if (vKmh < 10) met = 9.8;
    else if (vKmh < 12) met = 11.5;
    else met = 12.8;

    return Math.round(met * weight * timeHours);
}

// 3. Persistencia (LocalStorage)
function saveToLocal() {
    const data = {
        km: document.getElementById('dist_km').value,
        m: document.getElementById('dist_m').value,
        weight: document.getElementById('user_weight').value
    };
    localStorage.setItem('runner_data', JSON.stringify(data));
}

function loadFromLocal() {
    const data = JSON.parse(localStorage.getItem('runner_data'));
    if (data) {
        document.getElementById('dist_km').value = data.km || 0;
        document.getElementById('dist_m').value = data.m || 0;
        document.getElementById('user_weight').value = data.weight || 70;
        autoCalculate('dist');
    }
}

// --- GESTIÓN DE GPX ---

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

    const sampledPoints = newWaypoints.length > 50 
        ? filterPoints(newWaypoints, 25) 
        : newWaypoints;

    control.setWaypoints(sampledPoints);
    
    const group = new L.featureGroup(sampledPoints.map(p => L.marker(p)));
    map.fitBounds(group.getBounds());

    setTimeout(() => autoCalculate('dist'), 600);
}

function cargarCatalogoRutas() {
    const select = document.getElementById('ruta-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Selecciona una ruta GPX --</option>';
    
    if (typeof MIS_RUTAS !== 'undefined') {
        MIS_RUTAS.forEach(ruta => {
            const option = document.createElement('option');
            option.value = ruta.archivo;
            option.textContent = ruta.nombre;
            select.appendChild(option);
        });
    }
}

// BUG CORREGIDO: Ruta relativa a la raíz para fetch
document.getElementById('ruta-select')?.addEventListener('change', async (e) => {
    if (!e.target.value) return;
    try {
        // Cambiado de ./rutas/ a ../rutas/ para subir un nivel
        const response = await fetch(`../rutas/${e.target.value}`);
        const gpxData = await response.text();
        processGPXData(gpxData);
    } catch (err) {
        alert("Error al acceder al archivo GPX.");
    }
});

// Subida manual
document.getElementById('gpx-upload')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processGPXData(ev.target.result);
    reader.readAsText(file);
});

// --- LÓGICA DE CÁLCULO ---

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

window.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoRutas();
    loadFromLocal();
});

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        const type = input.id.split('_')[0];
        autoCalculate(type);
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

function clearAll() {
    if (confirm("¿Seguro que quieres borrar todos los datos y la ruta actual?")) {
        // Limpiar inputs
        document.querySelectorAll('input').forEach(input => input.value = "");
        document.getElementById('user_weight').value = 70; // Valor por defecto
        
        // Limpiar mapa
        control.setWaypoints([]);
        
        // Limpiar LocalStorage
        localStorage.removeItem('runner_data');
        
        alert("Datos reiniciados correctamente.");
    }
}

function exportToGPX() {
    const waypoints = control.getWaypoints();
    const validWaypoints = waypoints.filter(wp => wp.latLng);

    if (validWaypoints.length < 2) {
        alert("Dibuja una ruta en el mapa antes de exportar.");
        return;
    }

    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VitalStats">
  <trk>
    <name>Ruta VitalStats</name>
    <trkseg>`;

    validWaypoints.forEach(wp => {
        gpxContent += `
      <trkpt lat="${wp.latLng.lat}" lon="${wp.latLng.lng}"></trkpt>`;
    });

    gpxContent += `
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ruta-vitalstats.gpx';
    a.click();
    URL.revokeObjectURL(url);
}