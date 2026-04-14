// Base de datos local (puedes añadir todos los que quieras)
const productosMercadona = [
    { nombre: "Hummus de Garbanzos", kcal: 240, prot: 8, grasa: 18, carb: 10 },
    { nombre: "Guacamole", kcal: 155, prot: 1.5, grasa: 14, carb: 3 },
    { nombre: "Avena en copos", kcal: 375, prot: 13, grasa: 7, carb: 59 },
    { nombre: "Yogur Proteínas Arándanos", kcal: 64, prot: 10, grasa: 0.1, carb: 5 },
    { nombre: "Pechuga de Pollo", kcal: 110, prot: 23, grasa: 1, carb: 0 }
];
const searchInput = document.getElementById('productSearch');
const resultsList = document.getElementById('resultsList');
const diaryList = document.getElementById('diaryList');
const totalCalDisplay = document.getElementById('totalCalories');
const clearBtn = document.getElementById('clearBtn');

let totalCal = 0;

// Variables para acumular macros
let totales = { prot: 0, grasa: 0, carb: 0 };

// Filtrar productos mientras escribes
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    resultsList.innerHTML = '';
    
    if (query.length > 1) {
        const filtered = productosMercadona.filter(p => 
            p.nombre.toLowerCase().includes(query)
        );

        filtered.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.nombre} (${p.kcal} kcal/100g)`;
            li.onclick = () => addToDiary(p);
            resultsList.appendChild(li);
        });
    }
});

// Inicializar el gráfico
const ctx = document.getElementById('macroChart').getContext('2d');
let macroChart = new Chart(ctx, {
    type: 'doughnut', // Gráfico circular tipo "donut"
    data: {
        labels: ['Proteínas (g)', 'Grasas (g)', 'Carbohidratos (g)'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' }
        }
    }
});

function actualizarGrafica() {
    macroChart.data.datasets[0].data = [totales.prot, totales.grasa, totales.carb];
    macroChart.update();
}

// Modifica tu función addToDiary existente:
function addToDiary(producto) {
    // ... tu lógica anterior de añadir <li> ...

    totalCal += producto.kcal;
    totalCalDisplay.textContent = totalCal;

    // Sumar macros al total
    totales.prot += producto.prot;
    totales.grasa += producto.grasa;
    totales.carb += producto.carb;

    actualizarGrafica(); // <--- Llamamos a la actualización

    searchInput.value = '';
    resultsList.innerHTML = '';
}

// Modifica tu botón de vaciar
clearBtn.addEventListener('click', () => {
    diaryList.innerHTML = '';
    totalCal = 0;
    totales = { prot: 0, grasa: 0, carb: 0 }; // Reiniciar macros
    totalCalDisplay.textContent = '0';
    actualizarGrafica();
});