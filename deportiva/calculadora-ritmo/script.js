// Inicializar Mapa
const map = L.map('map').setView([40.4167, -3.7037], 13); // Madrid por defecto

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '© OpenStreetMap'
}).addTo(map);

// Control de Rutas
const control = L.Routing.control({
	waypoints: [],
	routeWhileDragging: true,
	show: false,
	createMarker: function(i, wp) {
		return L.marker(wp.latLng, { draggable: true });
	}
}).addTo(map);

// Añadir puntos con clic derecho
map.on('contextmenu', function(e) {
	const waypoints = control.getWaypoints();
	// Filtramos puntos que ya tengan coordenadas
	const activeWaypoints = waypoints.filter(wp => wp.latLng !== null);
	control.setWaypoints([...activeWaypoints.map(wp => wp.latLng), e.latlng]);
});
	
// Evento cuando se calcula una ruta en el mapa
control.on('routesfound', function(e) {
	const totalMeters = e.routes[0].summary.totalDistance;
        
	// Dividir metros en Km y M
	const km = Math.floor(totalMeters / 1000);
	const m = Math.round(totalMeters % 1000);
        
	document.getElementById('dist_km').value = km;
	document.getElementById('dist_m').value = m;
        
		autoCalculate('dist'); 
});

// Lógica de la Calculadora
const allInputs = document.querySelectorAll('input');
allInputs.forEach(input => {
    input.addEventListener('input', () => {
        const type = input.id.split('_')[0]; // Identifica si es dist, p (pace) o t (time)
		autoCalculate(type);
	});
});

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

    // --- NUEVA LÓGICA PARA VELOCIDAD ---
    if (lastChangedType === 'v') {
        const vKmh = parseFloat(document.getElementById('v_kmh').value) || 0;
        if (vKmh > 0) {
            const paceDecimal = 60 / vKmh; // min/km en decimal (ej: 4.5)
            const pSecTotal = paceDecimal * 60;
            document.getElementById('p_min').value = Math.floor(paceDecimal);
            document.getElementById('p_sec').value = Math.round(pSecTotal % 60);
            // Re-calculamos paceInSec para que el tiempo se actualice abajo
            const newPaceInSec = pSecTotal;
            if (totalDist > 0) {
                const resTime = totalDist * newPaceInSec;
                document.getElementById('t_h').value = Math.floor(resTime / 3600);
                document.getElementById('t_m').value = Math.floor((resTime % 3600) / 60);
                document.getElementById('t_s').value = Math.round(resTime % 60);
            }
        }
        return; // Salimos para evitar bucles
    }

    // --- CÁLCULOS RESTANTES ---
    if (totalDist > 0) {
        if (lastChangedType === 'dist' || lastChangedType === 'p') {
            if (paceInSec > 0) {
                // Calcular Tiempo
                const resTime = totalDist * paceInSec;
                document.getElementById('t_h').value = Math.floor(resTime / 3600);
                document.getElementById('t_m').value = Math.floor((resTime % 3600) / 60);
                document.getElementById('t_s').value = Math.round(resTime % 60);
                // Calcular Velocidad
                document.getElementById('v_kmh').value = (3600 / paceInSec).toFixed(2);
            }
        } 
        else if (lastChangedType === 't') {
            if (totalTimeInSec > 0) {
                const resPace = totalTimeInSec / totalDist;
                document.getElementById('p_min').value = Math.floor(resPace / 60);
                document.getElementById('p_sec').value = Math.round(resPace % 60);
                // Calcular Velocidad
                document.getElementById('v_kmh').value = ((totalDist / totalTimeInSec) * 3600).toFixed(2);
            }
        }
    }
}

function clearAll() {
    allInputs.forEach(input => input.value = '');
    // Si usas el control de rutas de Leaflet:
    if (control) control.setWaypoints([]);
}

// --- FUNCIÓN PARA GUARDAR DATOS ---
function saveToLocal() {
    const data = {
        dist_km: document.getElementById('dist_km').value,
        dist_m: document.getElementById('dist_m').value,
        p_min: document.getElementById('p_min').value,
        p_sec: document.getElementById('p_sec').value,
        v_kmh: document.getElementById('v_kmh').value,
        t_h: document.getElementById('t_h').value,
        t_m: document.getElementById('t_m').value,
        t_s: document.getElementById('t_s').value,
        // Guardamos los waypoints del mapa (coordenadas)
        waypoints: control.getWaypoints().map(wp => wp.latLng).filter(p => p !== null)
    };
    localStorage.setItem('runningData', JSON.stringify(data));
}

// --- FUNCIÓN PARA CARGAR DATOS ---
function loadFromLocal() {
    const saved = localStorage.getItem('runningData');
    if (!saved) return;

    const data = JSON.parse(saved);
    
    // Rellenar inputs
    Object.keys(data).forEach(key => {
        if (key !== 'waypoints' && document.getElementById(key)) {
            document.getElementById(key).value = data[key];
        }
    });

    // Restaurar ruta en el mapa si existen puntos
    if (data.waypoints && data.waypoints.length > 0) {
        control.setWaypoints(data.waypoints);
    }
}

function calculateCalories(vKmh, weight, timeInHours) {
    if (vKmh <= 0 || weight <= 0 || timeInHours <= 0) return 0;

    // Tabla simplificada de METs según velocidad (km/h)
    let met = 0;
    if (vKmh < 6) met = 4;        // Caminar rápido
    else if (vKmh < 8) met = 8;   // Trote muy suave
    else if (vKmh < 10) met = 10; // Trote
    else if (vKmh < 12) met = 11.5;
    else if (vKmh < 14) met = 12.5;
    else if (vKmh < 16) met = 14;
    else met = 16;                // Ritmo de competición

    return Math.round(met * weight * timeInHours);
}

// Dentro de autoCalculate, después de calcular Tiempo y Velocidad:
const weight = parseFloat(document.getElementById('user_weight').value) || 0;
const vKmh = parseFloat(document.getElementById('v_kmh').value) || 0;
const timeHours = totalTimeInSec / 3600;

document.getElementById('res_calories').value = calculateCalories(vKmh, weight, timeHours) + " kcal";

// --- INTEGRACIÓN ---

// 1. Llamar a loadFromLocal cuando cargue la página
window.addEventListener('load', loadFromLocal);

// 2. Modificar tu EventListener de inputs para que guarde
allInputs.forEach(input => {
    input.addEventListener('input', () => {
        const type = input.id.split('_')[0];
        autoCalculate(type);
        saveToLocal(); // <--- Guardar tras calcular
    });
});

// 3. Modificar el evento 'routesfound' para que guarde la distancia del mapa
control.on('routesfound', function(e) {
    // ... tu lógica de cálculo de KM y M actual ...
    autoCalculate('dist');
    saveToLocal(); // <--- Guardar ruta nueva
});

// 4. Modificar clearAll para que limpie también el localStorage
function clearAll() {
    allInputs.forEach(input => input.value = '');
    control.setWaypoints([]);
    localStorage.removeItem('runningData'); // <--- Limpiar memoria
}

function exportToGPX() {
    const waypoints = control.getWaypoints().filter(wp => wp.latLng !== null);
    
    if (waypoints.length < 2) {
        alert("Por favor, crea una ruta en el mapa con al menos dos puntos primero.");
        return;
    }

    // Cabecera del archivo GPX
    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VitalStats Running Pro" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Mi Ruta VitalStats</name>
    <trkseg>`;

    // Añadir cada punto de la ruta
    waypoints.forEach(wp => {
        gpxContent += `
      <trkpt lat="${wp.latLng.lat.toFixed(6)}" lon="${wp.latLng.lng.toFixed(6)}"></trkpt>`;
    });

    // Cierre del archivo
    gpxContent += `
    </trkseg>
  </trk>
</gpx>`;

    // Crear el archivo y forzar la descarga
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ruta-running.gpx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('gpx-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(e.target.result, "text/xml");
        const points = xml.querySelectorAll('trkpt');
        
        if (points.length === 0) {
            alert("No se encontraron puntos de ruta válidos en este archivo GPX.");
            return;
        }

        const newWaypoints = [];
        points.forEach(pt => {
            const lat = parseFloat(pt.getAttribute('lat'));
            const lon = parseFloat(pt.getAttribute('lon'));
            newWaypoints.push(L.latLng(lat, lon));
        });

        // Limitar el número de puntos para no saturar el Routing Machine (opcional)
        // Si la ruta es muy larga, tomamos una muestra
        const sampledPoints = newWaypoints.length > 50 
            ? filterPoints(newWaypoints, 20) 
            : newWaypoints;

        control.setWaypoints(sampledPoints);
        
        // Centrar el mapa en la nueva ruta
        const group = new L.featureGroup(sampledPoints.map(p => L.marker(p)));
        map.fitBounds(group.getBounds());
    };
    reader.readAsText(file);
});

// Función auxiliar para no saturar el mapa con miles de puntos
function filterPoints(points, maxPoints) {
    const step = Math.ceil(points.length / maxPoints);
    return points.filter((_, index) => index % step === 0);
}
