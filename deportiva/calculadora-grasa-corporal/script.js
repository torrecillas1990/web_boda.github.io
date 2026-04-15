// Mostrar/Ocultar campo de cadera según género
document.getElementById('gender').addEventListener('change', function() {
    const hipContainer = document.getElementById('hip-container');
    if (this.value === 'female') {
        hipContainer.classList.remove('hidden');
    } else {
        hipContainer.classList.add('hidden');
    }
});

function calculateFat() {
    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('height').value);
    const neck = parseFloat(document.getElementById('neck').value);
    const waist = parseFloat(document.getElementById('waist').value);
    const hip = parseFloat(document.getElementById('hip').value);

    if (!height || !neck || !waist || (gender === 'female' && !hip)) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    let bfp = 0;

    if (gender === 'male') {
        // Fórmula Marina EE.UU. Hombres
        bfp = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
        // Fórmula Marina EE.UU. Mujeres
        bfp = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    displayResult(bfp.toFixed(1));
}

function displayResult(value) {
    const resultDiv = document.getElementById('result-container');
    const percentText = document.getElementById('fat-percentage');
    
    resultDiv.classList.remove('hidden');
    percentText.innerText = value + "%";
    
    // Categoría simple
    const category = document.getElementById('fat-category');
    if (value < 6 && document.getElementById('gender').value === 'male') category.innerText = "Grasa esencial";
    else if (value < 14) category.innerText = "Atleta";
    else if (value < 25) category.innerText = "Fitness/Promedio";
    else category.innerText = "Sobrepeso";
}