// Base de datos local (puedes añadir todos los que quieras)
const productosMercadona = [
    { nombre: "Hummus de Garbanzos", kcal: 240 },
    { nombre: "Guacamole", kcal: 155 },
    { nombre: "Avena en copos", kcal: 375 },
    { nombre: "Yogur Proteínas Arándanos", kcal: 64 },
    { nombre: "Pechuga de Pollo", kcal: 110 },
    { nombre: "Tortitas de Maíz", kcal: 380 },
    { nombre: "Claras de huevo", kcal: 50 }
];

const searchInput = document.getElementById('productSearch');
const resultsList = document.getElementById('resultsList');
const diaryList = document.getElementById('diaryList');
const totalCalDisplay = document.getElementById('totalCalories');
const clearBtn = document.getElementById('clearBtn');

let totalCal = 0;

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

// Añadir al registro diario
function addToDiary(producto) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${producto.nombre}</span> <strong>${producto.kcal} kcal</strong>`;
    diaryList.appendChild(li);

    totalCal += producto.kcal;
    totalCalDisplay.textContent = totalCal;

    // Limpiar buscador
    searchInput.value = '';
    resultsList.innerHTML = '';
}

// Vaciar todo
clearBtn.addEventListener('click', () => {
    diaryList.innerHTML = '';
    totalCal = 0;
    totalCalDisplay.textContent = '0';
});