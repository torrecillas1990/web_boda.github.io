// 1. VARIABLES GLOBALES (Solo una declaración por variable)
let fitnessChart = null;

// 2. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();      // Rellenar formulario si hay datos
    renderFitnessChart(); // Dibujar gráfico con el historial de LocalStorage
    
    // Escuchar cambios en el género para mostrar/ocultar cadera
    const genderSelect = document.getElementById('gender');
    if(genderSelect) genderSelect.addEventListener('change', toggleHipField);
});

// 3. LÓGICA DE INTERFAZ
function toggleHipField() {
    const gender = document.getElementById('gender').value;
    const hipContainer = document.getElementById('hip-container');
    hipContainer.classList.toggle('hidden', gender === 'male');
}

function updateUI(fat, lean, fatKg, imc, maint) {
    const container = document.getElementById('result-container');
    container.classList.remove('hidden');

    document.getElementById('res-fat').innerText = fat.toFixed(1) + "%";
    document.getElementById('res-lean').innerText = lean.toFixed(1) + " kg";
    document.getElementById('res-fat-kg').innerText = fatKg.toFixed(1) + " kg";
    document.getElementById('res-imc').innerText = imc.toFixed(1);

    document.getElementById('cal-lose').innerText = Math.round(maint - 500) + " kcal";
    document.getElementById('cal-maint').innerText = Math.round(maint) + " kcal";
    document.getElementById('cal-gain').innerText = Math.round(maint + 500) + " kcal";
    
    container.scrollIntoView({ behavior: 'smooth' });
}

// 4. CÁLCULOS PRINCIPALES
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

    // Grasa Corporal (Marina)
    let fatPercentage = (data.gender === 'male') 
        ? (495 / (1.0324 - 0.19077 * Math.log10(data.waist - data.neck) + 0.15456 * Math.log10(data.height)) - 450)
        : (495 / (1.29579 - 0.35004 * Math.log10(data.waist + data.hip - data.neck) + 0.22100 * Math.log10(data.height)) - 450);

    const fatKg = data.weight * (fatPercentage / 100);
    const leanMass = data.weight - fatKg;
    const imc = data.weight / ((data.height / 100) ** 2);

    // Calorías (Mifflin-St Jeor)
    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    bmr = (data.gender === 'male') ? bmr + 5 : bmr - 161;
    const maintenance = bmr * data.activity;

    // Actualizar UI
    updateUI(fatPercentage, leanMass, fatKg, imc, maintenance);

    // Guardar estado actual del formulario
    localStorage.setItem('fitnessData', JSON.stringify(data));

    // Guardar en Historial para el Gráfico
    saveToLocalStorage(data.weight, fatPercentage.toFixed(1));

    // Comunicación con script global si existe
    if (typeof VitalStats !== 'undefined') {
        VitalStats.save('user_fat', fatPercentage.toFixed(1));
        VitalStats.save('user_weight', data.weight);
    }
}

// 5. PERSISTENCIA Y GRÁFICO (LocalStorage)
function saveToLocalStorage(weight, fat) {
    let history = JSON.parse(localStorage.getItem('vStats_history')) || [];
    const now = new Date();
    const dateId = getFileName(); // AAAAMMDD
    
    const newEntry = {
        id: dateId,
        date: now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        weight: parseFloat(weight),
        fat: parseFloat(fat)
    };

    const index = history.findIndex(item => item.id === dateId);
    if (index > -1) {
        history[index] = newEntry;
    } else {
        history.push(newEntry);
    }

    localStorage.setItem('vStats_history', JSON.stringify(history));
    renderFitnessChart();
}

function renderFitnessChart() {
    const history = JSON.parse(localStorage.getItem('vStats_history')) || [];
    const ctx = document.getElementById('fitnessChart');
    if (!ctx || history.length === 0) return;

    history.sort((a, b) => a.id - b.id);

    if (fitnessChart) fitnessChart.destroy();

    fitnessChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: history.map(d => d.date),
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: history.map(d => d.weight),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    yAxisID: 'y',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Grasa (%)',
                    data: history.map(d => d.fat),
                    borderColor: '#e67e22',
                    yAxisID: 'y1',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Peso (kg)' } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Grasa %' } }
            }
        }
    });
}

// 6. UTILIDADES
function getFileName() {
    const now = new Date();
    return now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
}

function loadSavedData() {
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        const data = JSON.parse(saved);
        for (const key in data) {
            const input = document.getElementById(key);
            if (input) input.value = data[key];
        }
        toggleHipField();
    }
}

function clearData() {
    if (confirm("¿Borrar todos los datos y el historial del gráfico?")) {
        localStorage.removeItem('fitnessData');
        localStorage.removeItem('vStats_history');
        location.reload();
    }
}

function downloadDailyFile() {
    const now = new Date();
    const dateId = getFileName();
    const entry = {
        fecha: now.toLocaleDateString(),
        peso: document.getElementById('weight').value,
        grasa: document.getElementById('res-fat').innerText
    };
    const fileContent = `/** Registro VitalStats **/\nif (typeof diarioStats === 'undefined') var diarioStats = [];\ndiarioStats.push(${JSON.stringify(entry, null, 4)});`;
    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${dateId}.js`;
    link.click();
}