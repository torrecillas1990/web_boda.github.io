// --- 1. VARIABLES GLOBALES ---
let historialCorporal = {}; 
let fitnessChart = null;

// --- 2. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar historial principal
    const savedHistory = VitalStats.get('historialCorporal');
    historialCorporal = JSON.parse(savedHistory) || {};

    // Carga Masiva de archivos externos (VG_)
    const pendientes = JSON.parse(localStorage.getItem('pendiente_carga_grasa'));
    if (pendientes && pendientes.length > 0) {
        await ejecutarCargaMasivaGrasa(pendientes);
    }

    // Inicializar Interfaz
    loadSavedData();
    renderFitnessChart(); 

    // Eventos de Navegación y Filtros
    document.getElementById('timeRangeFilter').addEventListener('change', renderFitnessChart);
    document.getElementById('gender').addEventListener('change', toggleHipField);
    
    // Toggles de visibilidad en el gráfico
    document.querySelectorAll('.chart-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (fitnessChart) {
                fitnessChart.setDatasetVisibility(index, e.target.checked);
                fitnessChart.update();
            }
        });
    });

    // Botón Sincronizar Rango
    const syncBtn = document.getElementById('bulkImportBtn');
    if (syncBtn) {
        syncBtn.onclick = () => {
			// 1. Verificamos primero
			if (!verificarAcceso(0)) return; 

			// 2. Si pasa la verificación, ejecutamos el resto
            const start = document.getElementById('importRangeStart').value;
            const end = document.getElementById('importRangeEnd').value;
            if (!start || !end) return alert("Por favor, selecciona un rango válido.");
            
            const lista = generarNombresArchivosGrasa(start, end);
            localStorage.setItem('pendiente_carga_grasa', JSON.stringify(lista));
            window.location.reload();
        };
    }
	
	// Botón Descargar Registro
    const downloadBtn = document.getElementById('downloadImportBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
			// 1. Verificamos primero
			if (!verificarAcceso(0)) return; 

			// 2. Si pasa la verificación, ejecutamos el resto
            downloadDailyFile();
        };
    }
	
	// Botón Calcular datos
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.onclick = () => {
			// 1. Verificamos primero
			if (!verificarAcceso(0)) return; 

			// 2. Si pasa la verificación, ejecutamos el resto
            calculateAll();
        };
    }
	
	// Botón Limpiar Calculos
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.onclick = () => {
			// 1. Verificamos primero
			if (!verificarAcceso(0)) return; 

			// 2. Si pasa la verificación, ejecutamos el resto
            clearData();
        };
    }
});

// --- 3. LÓGICA DE CÁLCULO ---
function calculateAll() {
    const data = {
        gender: document.getElementById('gender').value,
        age: parseInt(document.getElementById('age').value),
        weight: parseFloat(document.getElementById('weight').value),
        height: parseFloat(document.getElementById('height').value),
        neck: parseFloat(document.getElementById('neck').value),
        waist: parseFloat(document.getElementById('waist').value),
        hip: parseFloat(document.getElementById('hip').value) || 0,
        activity: parseFloat(document.getElementById('activity').value)
    };

    if (!data.weight || !data.height || !data.age || !data.waist || !data.neck) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
    }

    // Fórmula de la Marina de EE.UU.
    let fat = (data.gender === 'male') 
        ? (495 / (1.0324 - 0.19077 * Math.log10(data.waist - data.neck) + 0.15456 * Math.log10(data.height)) - 450)
        : (495 / (1.29579 - 0.35004 * Math.log10(data.waist + data.hip - data.neck) + 0.22100 * Math.log10(data.height)) - 450);

    const fatKg = data.weight * (fat / 100);
    const lean = data.weight - fatKg;
    const imc = data.weight / ((data.height / 100) ** 2);

    // Ecuación Mifflin-St Jeor
    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    bmr = (data.gender === 'male') ? bmr + 5 : bmr - 161;
    const maintenance = bmr * data.activity;

    // Actualizar Interfaz
    updateUI(fat, lean, fatKg, imc, maintenance);

    // Persistencia: Guardar en historialCorporal y LocalStorage
	const hoy = new Date().toISOString().split('T')[0];
	historialCorporal[hoy] = {
		peso: data.weight,
		grasa_pct: parseFloat(fat.toFixed(1)),
		cintura: data.waist,
		cuello: data.neck,
		cadera: data.hip,
		altura: data.height,
		genero: data.gender,
		edad: data.age,
		actividad: data.activity
	};
	VitalStats.save('historialCorporal', JSON.stringify(historialCorporal));
	renderFitnessChart();
}

// --- 4. VISUALIZACIÓN (Chart.js) ---
function renderFitnessChart() {
    const canvas = document.getElementById('fitnessChart');
    const range = document.getElementById('timeRangeFilter').value;
    if (!canvas) return;

    const etiquetas = obtenerRangoFechas(range);
    
    // Extracción de datos con soporte para el formato antiguo y el nuevo
    const getVal = (fecha, campo) => historialCorporal[fecha] ? (historialCorporal[fecha][campo] || null) : null;

    if (fitnessChart) fitnessChart.destroy();

    fitnessChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: etiquetas.map(f => f.split('-').reverse().slice(0,2).join('/')),
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: etiquetas.map(f => getVal(f, 'peso') || getVal(f, 'weight')),
                    borderColor: '#3b82f6',
                    yAxisID: 'y',
                    hidden: false // Visible por defecto
                },
                {
                    label: 'Grasa (%)',
                    data: etiquetas.map(f => getVal(f, 'grasa_pct') || getVal(f, 'fat')),
                    borderColor: '#ef4444',
                    yAxisID: 'y1',
                    hidden: false // Visible por defecto
                },
                {
                    label: 'Cintura (cm)',
                    data: etiquetas.map(f => getVal(f, 'cintura')),
                    borderColor: '#10b981',
                    yAxisID: 'y', // Comparte eje con peso/cm por escala similar
                    hidden: true // Oculto por defecto
                },
                {
                    label: 'Cuello (cm)',
                    data: etiquetas.map(f => getVal(f, 'cuello')),
                    borderColor: '#f59e0b',
                    yAxisID: 'y',
                    hidden: true
                },
                {
                    label: 'Cadera (cm)',
                    data: etiquetas.map(f => getVal(f, 'cadera')),
                    borderColor: '#8b5cf6',
                    yAxisID: 'y',
                    hidden: true
                },
                {
                    label: 'Altura (cm)',
                    data: etiquetas.map(f => getVal(f, 'altura')),
                    borderColor: '#6b7280',
                    yAxisID: 'y',
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            spanGaps: true,
            elements: { line: { tension: 0.3 } },
            scales: {
                y: { 
                    type: 'linear', 
                    position: 'left', 
                    title: { display: true, text: 'kg / cm' } 
                },
                y1: { 
                    type: 'linear', 
                    position: 'right', 
                    grid: { drawOnChartArea: false }, 
                    title: { display: true, text: '%' } 
                }
            },
            plugins: {
                legend: { display: false } // Usamos nuestros propios checkboxes
            }
        }
    });

    // Sincronizar checkboxes con el estado 'hidden' inicial del gráfico
    actualizarEstadoCheckboxes();
}

function actualizarEstadoCheckboxes() {
    const toggles = document.querySelectorAll('.chart-toggle');
    toggles.forEach(toggle => {
        const index = parseInt(toggle.value);
        // Marcamos como "checked" solo si el dataset no está oculto
        toggle.checked = !fitnessChart.data.datasets[index].hidden;
    });
}

// --- 5. PERSISTENCIA Y SINCRONIZACIÓN ---
function downloadDailyFile() {
    // Recogemos todos los valores del formulario
    const weight = document.getElementById('weight').value;
    const fat = document.getElementById('res-fat').innerText.replace('%', '');
    
    if (!weight || fat === "0") return alert("Realiza un cálculo antes de guardar.");

    const dataFull = {
        fecha: new Date().toISOString().split('T')[0],
        genero: document.getElementById('gender').value,
        edad: document.getElementById('age').value,
        peso: parseFloat(weight),
        altura: document.getElementById('height').value,
        cuello: document.getElementById('neck').value,
        cintura: document.getElementById('waist').value,
        cadera: document.getElementById('hip').value || 0,
        actividad: document.getElementById('activity').value,
        grasa_pct: parseFloat(fat),
        // Guardamos también los cálculos de calorías
        objetivos: {
            definicion: document.getElementById('cal-lose').innerText,
            mantenimiento: document.getElementById('cal-maint').innerText,
            volumen: document.getElementById('cal-gain').innerText
        }
    };

    const user = JSON.parse(localStorage.getItem('vs_session'))?.user || "anonimo";
    const varName = `VG_${user}_${dataFull.fecha.replace(/-/g, '')}`;
    
    // El archivo .js ahora contendrá el objeto técnico completo
    const content = `window.${varName} = ${JSON.stringify(dataFull, null, 4)};`;
    
    const blob = new Blob([content], { type: 'application/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${varName}.js`;
    a.click();

    // Actualizamos el historial local con el objeto completo
    historialCorporal[dataFull.fecha] = dataFull;
    VitalStats.save('historialCorporal', JSON.stringify(historialCorporal));
}

async function ejecutarCargaMasivaGrasa(lista) {
    let cargados = 0;
    for (const nombre of lista) {
        try {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = `./diario/${nombre}`;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });

            const match = nombre.match(/(\d{8})/);
            if (match) {
                const f = match[0];
                const fechaClave = `${f.substring(0,4)}-${f.substring(4,6)}-${f.substring(6,8)}`;
                const varFound = Object.keys(window).find(k => k.includes(f) && k.startsWith('VG_'));
                if (window[varFound]) {
                    historialCorporal[fechaClave] = window[varFound];
                    cargados++;
                }
            }
        } catch (e) { /* Archivo no encontrado, saltar */ }
    }
    if (cargados > 0) VitalStats.save('historialCorporal', JSON.stringify(historialCorporal));
    localStorage.removeItem('pendiente_carga_grasa');
}

// --- 6. UTILIDADES ---
function generarNombresArchivosGrasa(inicio, fin) {
    const nombres = [];
    let actual = new Date(inicio);
    const limite = new Date(fin);
    const user = JSON.parse(localStorage.getItem('vs_session'))?.user || "anonimo";

    while (actual <= limite) {
        const y = actual.getFullYear();
        const m = String(actual.getMonth() + 1).padStart(2, '0');
        const d = String(actual.getDate()).padStart(2, '0');
        nombres.push(`VG_${user}_${y}${m}${d}.js`);
        actual.setDate(actual.getDate() + 1);
    }
    return nombres;
}

function obtenerRangoFechas(opcion) {
    let fechas = [];
    let hoy = new Date();
    let dias = (opcion === 'lastMonth') ? 30 : (opcion === 'last6Months') ? 180 : (opcion === 'lastYear') ? 365 : 7;

    for (let i = dias - 1; i >= 0; i--) {
        let d = new Date();
        d.setDate(hoy.getDate() - i);
        fechas.push(d.toISOString().split('T')[0]);
    }
    return fechas;
}

function toggleHipField() {
    const isMale = document.getElementById('gender').value === 'male';
    document.getElementById('hip-container').classList.toggle('hidden', isMale);
}

function updateUI(fat, lean, fatKg, imc, maint) {
    document.getElementById('result-container').classList.remove('hidden');
    document.getElementById('res-fat').innerText = fat.toFixed(1) + "%";
    document.getElementById('res-lean').innerText = lean.toFixed(1) + " kg";
    document.getElementById('res-fat-kg').innerText = fatKg.toFixed(1) + " kg";
    document.getElementById('res-imc').innerText = imc.toFixed(1);

    document.getElementById('cal-lose').innerText = Math.round(maint - 500);
    document.getElementById('cal-maint').innerText = Math.round(maint);
    document.getElementById('cal-gain').innerText = Math.round(maint + 500);
    
    document.getElementById('result-container').scrollIntoView({ behavior: 'smooth' });
}

function loadSavedData() {
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        const data = JSON.parse(saved);
        for (const key in data) {
            const el = document.getElementById(key);
            if (el) el.value = data[key];
        }
        toggleHipField();
    }
}

function clearData() {
    if (confirm("¿Borrar todos los datos actuales e historial?")) {
        localStorage.removeItem('fitnessData');
        VitalStats.save('historialCorporal', null);
        location.reload();
    }
}

function cargarDatosEnFormulario(fecha) {
    const data = historialCorporal[fecha];
    if (!data) return;

    // Rellenamos todos los campos automáticamente
    const campos = ['gender', 'age', 'weight', 'height', 'neck', 'waist', 'hip', 'activity'];
    
    campos.forEach(campo => {
        const el = document.getElementById(campo);
        if (el && data[campo]) {
            el.value = data[campo];
        }
    });

    toggleHipField(); // Para mostrar/ocultar cadera si es necesario
    calculateAll();   // Refrescamos los cálculos de calorías y grasa en la UI
}