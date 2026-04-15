// Al cargar el documento, recuperar datos si existen
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    
    // Escuchar cambios en el género para mostrar/ocultar cadera
    const genderSelect = document.getElementById('gender');
    genderSelect.addEventListener('change', toggleHipField);
});

function toggleHipField() {
    const gender = document.getElementById('gender').value;
    const hipContainer = document.getElementById('hip-container');
    hipContainer.classList.toggle('hidden', gender === 'male');
}

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
        alert("Faltan datos por completar");
        return;
    }

    // Guardar datos en el almacenamiento local
    localStorage.setItem('fitnessData', JSON.stringify(data));

    // --- LÓGICA DE CÁLCULO ---
    let fatPercentage = 0;
    if (data.gender === 'male') {
        fatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(data.waist - data.neck) + 0.15456 * Math.log10(data.height)) - 450;
    } else {
        fatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(data.waist + data.hip - data.neck) + 0.22100 * Math.log10(data.height)) - 450;
    }

    const fatKg = data.weight * (fatPercentage / 100);
    const leanMass = data.weight - fatKg;
    const imc = data.weight / ((data.height/100) ** 2);

    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    bmr = (data.gender === 'male') ? bmr + 5 : bmr - 161;
    const maintenance = bmr * data.activity;

    updateUI(fatPercentage, leanMass, fatKg, imc, maintenance);
}

function updateUI(fat, lean, fatKg, imc, maint) {
    document.getElementById('result-container').classList.remove('hidden');
    document.getElementById('res-fat').innerText = fat.toFixed(1) + "%";
    document.getElementById('res-lean').innerText = lean.toFixed(1) + " kg";
    document.getElementById('res-fat-kg').innerText = fatKg.toFixed(1) + " kg";
    document.getElementById('res-imc').innerText = imc.toFixed(1);

    document.getElementById('cal-lose').innerText = Math.round(maint - 500) + " kcal";
    document.getElementById('cal-maint').innerText = Math.round(maint) + " kcal";
    document.getElementById('cal-gain').innerText = Math.round(maint + 500) + " kcal";
}

function loadSavedData() {
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Rellenar campos
        document.getElementById('gender').value = data.gender;
        document.getElementById('age').value = data.age;
        document.getElementById('weight').value = data.weight;
        document.getElementById('height').value = data.height;
        document.getElementById('neck').value = data.neck;
        document.getElementById('waist').value = data.waist;
        document.getElementById('hip').value = data.hip;
        document.getElementById('activity').value = data.activity;

        // Ajustar visibilidad de cadera y calcular automáticamente
        toggleHipField();
        calculateAll();
    }
}

function clearData() {
    localStorage.removeItem('fitnessData');
    location.reload(); // Recarga la página para limpiar todo
}