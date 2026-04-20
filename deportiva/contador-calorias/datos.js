// datos.js
// kcal por cada 100 gramos
const productosMercadonaBase = [
    // --- BEBIDAS ---
    { nombre: "Energy Drink Full Tropic", kcal: 4.1, prot: 0, grasa: 0, carb: 0.4 },
	
    // --- COMIDAS PREPARADAS ---
    { nombre: "Tabule Oriental Mercadona", kcal: 167, prot: 3.9, grasa: 5.2, carb: 25.4 },
    { nombre: "Ensalada Pollo Queso", kcal: 179, prot: 9.4, grasa: 13, carb: 5.8 },
	
    // --- LÁCTEOS Y PROTEÍNAS ---
    { nombre: "Yogur Proteínas Natural Mercadona", kcal: 52, prot: 10, grasa: 0.1, carb: 3.1 },
    { nombre: "Yogur Proteínas Arándanos", kcal: 64, prot: 10, grasa: 0.1, carb: 5 },
    { nombre: "Yogur Griego Natural", kcal: 129, prot: 3.9, grasa: 10.8, carb: 3.9 },
    { nombre: "Queso Batido 0%", kcal: 46, prot: 8, grasa: 0.1, carb: 3.5 },
    { nombre: "Leche Semidesnatada (1 vaso 250g)", kcal: 46, prot: 3.2, grasa: 1.5, carb: 4.8 },
    { nombre: "Leche Proteinas (1 vaso 250g)", kcal: 44, prot: 6, grasa: 0.2, carb: 4.6 },
    { nombre: "Kéfir Natural", kcal: 40, prot: 3.4, grasa: 1.5, carb: 2.5 },
    { nombre: "Kéfir Natural 0% Bebida de 250g", kcal: 36, prot: 3.9, grasa: 0.5, carb: 4.8 },
    { nombre: "Claras de Huevo", kcal: 50, prot: 11, grasa: 0, carb: 0.7 },
    { nombre: "Queso Cottage", kcal: 99, prot: 12, grasa: 4, carb: 3.3 },
    { nombre: "Barrita de proteinas Chocolate con Leche (60g por barrita)", kcal: 386, prot: 33, grasa: 17, carb: 38 },

    // --- CARNES Y PESCADOS ---
    { nombre: "Pechuga de Pollo", kcal: 110, prot: 23, grasa: 1, carb: 0 },
    { nombre: "Pechuga de Pavo", kcal: 105, prot: 22, grasa: 1.5, carb: 0 },
    { nombre: "Cinta de Lomo de Cerdo", kcal: 151, prot: 21, grasa: 7, carb: 0 },
    { nombre: "Salmón Ahumado", kcal: 191, prot: 23, grasa: 11, carb: 0.5 },
    { nombre: "Atún al Natural (lata)", kcal: 101, prot: 24, grasa: 0.6, carb: 0 },
    { nombre: "Merluza Congelada", kcal: 71, prot: 16, grasa: 0.6, carb: 0 },
    { nombre: "Tiras de Pollo Asado", kcal: 165, prot: 30, grasa: 4.5, carb: 0.5 },

    // --- CEREALES Y LEGUMBRES ---
    { nombre: "Avena en copos", kcal: 375, prot: 13, grasa: 7, carb: 59 },
    { nombre: "Arroz Integral", kcal: 350, prot: 7.5, grasa: 2.5, carb: 73 },
    { nombre: "Quinoa cocida", kcal: 120, prot: 4.4, grasa: 1.9, carb: 21 },
    { nombre: "Garbanzos Cocidos (bote)", kcal: 105, prot: 6, grasa: 2, carb: 14 },
    { nombre: "Lentejas Cocidas (bote)", kcal: 85, prot: 7, grasa: 0.5, carb: 11 },
    { nombre: "Pasta 100% Integral", kcal: 345, prot: 13, grasa: 2, carb: 65 },
    { nombre: "Tortitas de Maíz", kcal: 380, prot: 7, grasa: 3, carb: 80 },

    // --- GRASAS Y SALSAS ---
    { nombre: "Hummus de Garbanzos", kcal: 240, prot: 8, grasa: 18, carb: 10 },
    { nombre: "Guacamole Fresh", kcal: 155, prot: 1.5, grasa: 14, carb: 3 },
    { nombre: "Aceite de Oliva Virgen Extra", kcal: 884, prot: 0, grasa: 100, carb: 0 },
    { nombre: "Crema de Cacahuete 100%", kcal: 618, prot: 30, grasa: 50, carb: 7 },
    { nombre: "Tahini (Pasta de sésamo)", kcal: 710, prot: 25, grasa: 65, carb: 3 },
    { nombre: "Nueces Peladas", kcal: 654, prot: 15, grasa: 65, carb: 7 },
    { nombre: "Almendras Tostadas", kcal: 620, prot: 22, grasa: 54, carb: 5 },

    // --- PANES Y OTROS ---
    { nombre: "Pan 100% Integral Centeno", kcal: 230, prot: 8, grasa: 2, carb: 40 },
    { nombre: "Pan de Molde Integral", kcal: 245, prot: 9, grasa: 3, carb: 42 },
    { nombre: "Tostadas de Fibra y Sésamo", kcal: 390, prot: 12, grasa: 7, carb: 60 },
    { nombre: "Tofu Firme", kcal: 120, prot: 12, grasa: 7, carb: 2 },
    { nombre: "Edamame Congelado", kcal: 130, prot: 11, grasa: 5, carb: 10 },
    { nombre: "Salmorejo Fresco", kcal: 75, prot: 1, grasa: 5, carb: 6 },
    { nombre: "Gazpacho Suave", kcal: 45, prot: 0.8, grasa: 3, carb: 3.5 },

    // --- FRUTAS Y VERDURAS ---
    { nombre: "Plátano", kcal: 89, prot: 1.1, grasa: 0.3, carb: 23 },
    { nombre: "Manzana 1 pieza son 150 gramos", kcal: 52, prot: 0.3, grasa: 0.2, carb: 14 },
    { nombre: "Naranja 1 pieza son 150 gramos", kcal: 60, prot: 0.94, grasa: 0.12, carb: 11.75 },
    { nombre: "Aguacate", kcal: 160, prot: 2, grasa: 15, carb: 9 },
    { nombre: "Brócoli Congelado", kcal: 34, prot: 3, grasa: 0.4, carb: 4 },
    { nombre: "Espinacas Frescas", kcal: 23, prot: 2.9, grasa: 0.4, carb: 3.6 },
    { nombre: "Judías Verdes", kcal: 31, prot: 1.8, grasa: 0.2, carb: 7 },
    { nombre: "Arándanos Frescos", kcal: 57, prot: 0.7, grasa: 0.3, carb: 14 },
	
	// --- DULCES ---
    { nombre: "Chocolate con leche", kcal: 523, prot: 5.6, grasa: 28, carb: 59.8 },
    { nombre: "Cacao puro en polvo (Cuchara pequeña 5g aprox)", kcal: 375, prot: 25.5, grasa: 16, carb: 16.3 }
];