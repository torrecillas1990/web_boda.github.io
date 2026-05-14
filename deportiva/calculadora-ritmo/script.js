/* ==========================================================================
   VITALSTATS - ENGINE CALCULADORA DE RITMO PRO 2026
   ========================================================================== */

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    // Botón undoLastPointBtn
    const undoBtn = document.getElementById('undoLastPointBtn');
    if (undoBtn) {
        undoBtn.onclick = () => {
			// 1. Verificamos primero
			if (!verificarAcceso(0)) return; 

			// 2. Si pasa la verificación, ejecutamos el resto
            undoLastPoint();
        };
    }
	
	// Botón clearAllBtn
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.onclick = () => {
			// 1. Verificamos primero
			if (!verificarAcceso(0)) return; 

			// 2. Si pasa la verificación, ejecutamos el resto
            clearAll();
        };
    }
	
	// Botón exportToGPX
    const exportToGPXBtn = document.getElementById('exportToGPXBtn');
    if (exportToGPXBtn) {
        exportToGPXBtn.onclick = () => {
			// 1. Verificamos primero
			if (!verificarAcceso(0)) return; 

			// 2. Si pasa la verificación, ejecutamos el resto
            exportToGPX();
        };
    }
	
	// Botón exportToGPX
    const importGPXBtn = document.getElementById('importGPXBtn');
    if (!verificarAcceso(1)) {
		importGPXBtn.style.display = 'none';
    }
});

// --- GESTIÓN DEL MODAL DEL MAPA ---
function openMapModal() {
    const modal = document.getElementById('mapModal');
    modal.style.display = 'flex';
    
    // 1. Evitamos el scroll del body mientras el mapa está abierto
    document.body.style.overflow = 'hidden';

    // 2. FORZADO DE RENDERIZADO: El secreto de Leaflet
    setTimeout(() => {
        map.invalidateSize();
        // Si hay una ruta ya trazada, centramos el mapa en ella
        const wps = control.getWaypoints().filter(wp => wp.latLng);
        if (wps.length >= 2) {
            const group = new L.featureGroup(wps.map(p => L.marker(p.latLng)));
            map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    }, 300);
}

function closeMapModal() {
    document.getElementById('mapModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Devolvemos el scroll
}

// Permitir cerrar al hacer clic en el fondo oscuro
window.addEventListener('click', (e) => {
    if (e.target.id === 'mapModal') closeMapModal();
});

// --- 1. CLASE PARA RUTA MANUAL (LÍNEA RECTA) ---
// Imprescindible para que el mapa no dependa de servidores externos
const StraightRouter = L.Class.extend({
    route: function(waypoints, callback, context) {
        // Filtrar puntos válidos
        const pts = waypoints.filter(wp => wp.latLng).map(wp => wp.latLng);
        
        // Si no hay suficientes puntos, devolvemos una ruta vacía pero válida
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

        // Calcular distancia geométrica entre puntos
        for (let i = 0; i < pts.length - 1; i++) {
            route.summary.totalDistance += pts[i].distanceTo(pts[i+1]);
        }

        console.log("📏 Modo Manual: Calculada distancia de", route.summary.totalDistance, "metros");

        // IMPORTANTE: Leaflet necesita una respuesta asíncrona
        setTimeout(() => {
            callback.call(context, null, [route]);
        }, 32); // 32ms es el tiempo ideal para el ciclo de refresco del navegador
    }
});

const routers = {
    auto: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    manual: new StraightRouter()
};

// --- 2. EL INTERRUPTOR MAESTRO (FORZADO) ---
document.getElementById('routing-mode')?.addEventListener('change', function(e) {
    const modo = e.target.value;
    console.log("🔄 Cambiando a modo:", modo);

    // 1. Cambiamos el router en todas las propiedades internas
    control.options.router = routers[modo];
    control.getPlan().options.router = routers[modo];
    
    // 2. Limpiamos la caché de rutas anterior
    if (control._router) control._router = routers[modo];

    // 3. Forzamos el recálculo total refrescando los puntos
    const currentWps = control.getWaypoints();
    if (currentWps.filter(wp => wp.latLng).length >= 2) {
        // Al setear los mismos waypoints, obligamos al control a llamar al nuevo router
        control.setWaypoints(currentWps);
    }
});

// --- 2. CONFIGURACIÓN INICIAL DEL MAPA ---
const map = L.map('map').setView([40.4167, -3.7037], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

const control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true, // Esto ayuda a que el modo manual sea fluido
    show: false,
    router: routers.auto, 
    createMarker: (i, wp) => L.marker(wp.latLng, { draggable: true })
}).addTo(map);

// --- 3. GESTIÓN DE EVENTOS DE TRAZADO ---

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

    // 1. Manejo de Velocidad -> Ritmo
    if (type === 'v') {
        const vKmh = parseFloat(document.getElementById('v_kmh').value) || 0;
        if (vKmh > 0) {
            const paceDecimal = 60 / vKmh;
            document.getElementById('p_min').value = Math.floor(paceDecimal);
            document.getElementById('p_sec').value = Math.round((paceDecimal * 60) % 60);
            return autoCalculate('p'); 
        }
    }
    
    if (dist <= 0) return;

    // 2. Cálculos Cruzados (Distancia/Ritmo -> Tiempo o Tiempo -> Ritmo)
    let finalTimeInSeconds = 0;

    if (type === 'dist' || type === 'p') {
        if (pace > 0) {
            finalTimeInSeconds = dist * pace;
            document.getElementById('t_h').value = Math.floor(finalTimeInSeconds / 3600);
            document.getElementById('t_m').value = Math.floor((finalTimeInSeconds % 3600) / 60);
            document.getElementById('t_s').value = Math.round(finalTimeInSeconds % 60);
            document.getElementById('v_kmh').value = (3600 / pace).toFixed(2);
        }
    } else if (type === 't') {
        const th = parseFloat(document.getElementById('t_h').value) || 0;
        const tm = parseFloat(document.getElementById('t_m').value) || 0;
        const ts = parseFloat(document.getElementById('t_s').value) || 0;
        finalTimeInSeconds = (th * 3600) + (tm * 60) + ts;

        if (finalTimeInSeconds > 0) {
            const resP = finalTimeInSeconds / dist;
            document.getElementById('p_min').value = Math.floor(resP / 60);
            document.getElementById('p_sec').value = Math.round(resP % 60);
            document.getElementById('v_kmh').value = ((dist / finalTimeInSeconds) * 3600).toFixed(2);
        }
    }

    // 3. Cálculo de Calorías con el tiempo RECIÉN CALCULADO
    const v = parseFloat(document.getElementById('v_kmh').value) || 0;
    const tiempoHoras = finalTimeInSeconds / 3600;
    
    if (tiempoHoras > 0) {
        document.getElementById('res_calories').value = calculateCalories(v, weight, tiempoHoras) + " kcal";
    }
}

// --- 5. PERSISTENCIA Y GPX ---
// --- ACTUALIZACIÓN DE DISTANCIA EN TIEMPO REAL ---

control.on('routesfound', (e) => {
    const d = e.routes[0].summary.totalDistance; // Distancia en metros
    
    // 1. Actualiza los campos ocultos del formulario principal
    document.getElementById('dist_km').value = Math.floor(d / 1000);
    document.getElementById('dist_m').value = Math.round(d % 1000);
    
    // 2. Actualiza el nuevo visualizador del Modal
    const modalDisplay = document.getElementById('modal_dist_display');
    if (modalDisplay) {
        modalDisplay.value = (d / 1000).toFixed(2) + " km";
    }

    // 3. Dispara los cálculos de ritmo/tiempo/calorías
    autoCalculate('dist');
});

// --- AJUSTE EN LA FUNCIÓN DE REINICIO ---
window.clearAll = function() {
    if(confirm("¿Reiniciar ruta?")) {
        control.setWaypoints([]);
        
        // Limpiar inputs del formulario
        document.getElementById('dist_km').value = "";
        document.getElementById('dist_m').value = "";
        
        // Resetear visualizador del modal
        const modalDisplay = document.getElementById('modal_dist_display');
        if (modalDisplay) modalDisplay.value = "0.00 km";
        
        autoCalculate('dist');
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

// --- FUNCIÓN PARA DESHACER EL ÚLTIMO PUNTO ---
window.undoLastPoint = function() {
    // 1. Obtenemos los waypoints actuales filtrando solo los que tienen coordenadas
    const currentWaypoints = control.getWaypoints().filter(wp => wp.latLng !== null);

    if (currentWaypoints.length > 0) {
        // 2. Eliminamos el último elemento del array
        currentWaypoints.pop();
        
        // 3. Actualizamos el mapa con el nuevo array (esto disparará 'routesfound')
        control.setWaypoints(currentWaypoints);
        
        // 4. Si después de borrar no quedan puntos, limpiamos los inputs de distancia
        if (currentWaypoints.length < 2) {
            document.getElementById('dist_km').value = 0;
            document.getElementById('dist_m').value = 0;
            autoCalculate('dist'); // Actualiza calorías a 0
        }
        
        console.log("📍 Punto eliminado. Quedan:", currentWaypoints.length);
    } else {
        alert("No hay más puntos para borrar.");
    }
};

document.addEventListener('keydown', function(event) {
    // Detecta Ctrl+Z o Cmd+Z
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        undoLastPoint();
    }
});
