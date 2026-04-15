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
        const next = waypoints.findIndex(wp => !wp.latLng);
        if (next !== -1) control.spliceWaypoints(next, 1, e.latlng);
        else control.spliceWaypoints(waypoints.length, 0, e.latlng);
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
        // 1. Obtener Distancia Total en km
        const km = parseFloat(document.getElementById('dist_km').value) || 0;
        const m = parseFloat(document.getElementById('dist_m').value) || 0;
        const totalDist = km + (m / 1000);
        
        // 2. Obtener Ritmo en segundos por km
        const pm = parseFloat(document.getElementById('p_min').value) || 0;
        const ps = parseFloat(document.getElementById('p_sec').value) || 0;
        const paceInSec = (pm * 60) + ps;

        // 3. Obtener Tiempo Total en segundos
        const th = parseFloat(document.getElementById('t_h').value) || 0;
        const tm = parseFloat(document.getElementById('t_m').value) || 0;
        const ts = parseFloat(document.getElementById('t_s').value) || 0;
        const totalTimeInSec = (th * 3600) + (tm * 60) + ts;

        // --- LÓGICA DE DECISIÓN ---
        
        // Si cambiamos Distancia o Ritmo -> Calculamos TIEMPO
        if (lastChangedType !== 't' && totalDist > 0 && paceInSec > 0) {
            const resTime = totalDist * paceInSec;
            document.getElementById('t_h').value = Math.floor(resTime / 3600) || 0;
            document.getElementById('t_m').value = Math.floor((resTime % 3600) / 60) || 0;
            document.getElementById('t_s').value = Math.round(resTime % 60) || 0;
        } 
        // Si cambiamos Tiempo -> Calculamos RITMO (asumiendo que hay distancia)
        else if (lastChangedType === 't' && totalDist > 0 && totalTimeInSec > 0) {
            const resPace = totalTimeInSec / totalDist;
            document.getElementById('p_min').value = Math.floor(resPace / 60) || 0;
            document.getElementById('p_sec').value = Math.round(resPace % 60) || 0;
        }
    }

    function clearAll() {
        allInputs.forEach(input => input.value = '');
        control.setWaypoints([]);
    }