// datos.js
// Valores por cada 100g de producto (a menos que se indique lo contrario en observaciones)
const productosMercadonaBase = [
    // --- BEBIDAS ---
    { categoria: "Bebida", nombre: "Energy Drink Full Tropic", kcal: 4.1, prot: 0, grasa: 0, carb: 0.4, obs: "500ml. Sin azúcar." },
	
    // --- COMIDAS PREPARADAS ---
    { categoria: "Preparado", nombre: "Tabule Oriental", kcal: 167, prot: 3.9, grasa: 5.2, carb: 25.4, obs: "Listo para comer." },
    { categoria: "Preparado", nombre: "Ensalada Pollo Queso", kcal: 179, prot: 9.4, grasa: 13, carb: 5.8, obs: "Incluye salsa y complementos." },
	{ categoria: "Preparado", nombre: "Pollo con almendras", kcal: 145, prot: 9, grasa: 8, carb: 5, obs: "Racion de 200g aprox." },
	{ categoria: "Preparado", nombre: "Fideos de arroz", kcal: 150, prot: 2, grasa: 2, carb: 75, obs: "Racion de 100g aprox." },
	{ categoria: "Preparado", nombre: "Rollito de primavera", kcal: 120, prot: 5, grasa: 2, carb: 22, obs: "Racion de 100g aprox." },
	{ categoria: "Preparado", nombre: "Gyosa de pollo", kcal: 170, prot: 10, grasa: 5, carb: 20, obs: "Una pesa 22g aprox." },
	
    // --- LÁCTEOS Y PROTEÍNAS ---
    { categoria: "Proteina", nombre: "Yogur Proteínas Natural", kcal: 52, prot: 10, grasa: 0.1, carb: 3.1, obs: "un yogur de 120g." },
    { categoria: "Proteina", nombre: "Yogur Proteínas Arándanos", kcal: 64, prot: 10, grasa: 0.1, carb: 5, obs: "" },
	{ categoria: "Proteina", nombre: "Yogur Griego Natural", kcal: 129, prot: 3.9, grasa: 10.8, carb: 3.9, obs: "Alto en grasas saludables." },
    { categoria: "Proteina", nombre: "Queso Batido 0%", kcal: 46, prot: 8, grasa: 0.1, carb: 3.5, obs: "" },
    { categoria: "Proteina", nombre: "Leche Semidesnatada (1 vaso 250g)", kcal: 46, prot: 3.2, grasa: 1.5, carb: 4.8, obs: "1 vaso 250g aprox." },
    { categoria: "Proteina", nombre: "Leche Proteinas", kcal: 44, prot: 6, grasa: 0.2, carb: 4.6, obs: "1 vaso 250g aprox. Desnatada con extra de calcio/prot." },
    { categoria: "Proteina", nombre: "Kéfir Natural", kcal: 40, prot: 3.4, grasa: 1.5, carb: 2.5, obs: "" },
    { categoria: "Proteina", nombre: "Kéfir Natural 0%", kcal: 36, prot: 3.9, grasa: 0.5, carb: 4.8, obs: "Bebida de 250g" },
    { categoria: "Proteina", nombre: "Claras de Huevo", kcal: 50, prot: 11, grasa: 0, carb: 0.7, obs: "" },
    { categoria: "Proteina", nombre: "Queso Cottage", kcal: 99, prot: 12, grasa: 4, carb: 3.3, obs: "Bajo en calorías, alto en caseína." },
    { categoria: "Proteina", nombre: "Queso Curado Mezcla", kcal: 431, prot: 25, grasa: 36, carb: 1.8, obs: "Loncha 20g aprox." },
    { categoria: "Suplemento", nombre: "Barrita de proteínas Chocolate", kcal: 386, prot: 33, grasa: 17, carb: 38, obs: "Peso barrita: 60g." },
    
    // --- CARNES Y PESCADOS ---
    { categoria: "Proteina", nombre: "Pechuga de Pollo", kcal: 110, prot: 23, grasa: 1, carb: 0, obs: "un filete 100g aprox." },
    { categoria: "Proteina", nombre: "Pechuga de Pavo", kcal: 105, prot: 22, grasa: 1.5, carb: 0, obs: "un filete 100g aprox." },
    { categoria: "Proteina", nombre: "Cinta de Lomo de Cerdo", kcal: 151, prot: 21, grasa: 7, carb: 0, obs: "" },
    { categoria: "Proteina", nombre: "Salmón Ahumado", kcal: 191, prot: 23, grasa: 11, carb: 0.5, obs: "" },
    { categoria: "Proteina", nombre: "Atún Claro al Natural", kcal: 98, prot: 21, grasa: 1.2, carb: 0.9, obs: "Lata de 70g según peso escurrido." },
    { categoria: "Proteina", nombre: "Atún Claro en Aceite de Oliva", kcal: 245, prot: 21, grasa: 18, carb: 0.9, obs: "Lata de 70g según peso escurrido." },
    { categoria: "Proteina", nombre: "Bonito del Norte en aceite de oliva (lata 75g escurrido)", kcal: 140, prot: 18, grasa: 7.3, carb: 0.5, obs: "" },
    { categoria: "Proteina", nombre: "Merluza Congelada", kcal: 71, prot: 16, grasa: 0.6, carb: 0, obs: "" },
    { categoria: "Proteina", nombre: "Tiras de Pollo Asado", kcal: 165, prot: 30, grasa: 4.5, carb: 0.5, obs: "" },
    { categoria: "Proteina", nombre: "Huevos duros", kcal: 121, prot: 13, grasa: 7.7, carb: 0.5, obs: "Aprox. 50g-60g por unidad." },
    { categoria: "Proteina", nombre: "Pechuguita de pollo lonchas 99% La Carloteña", kcal: 125, prot: 26.8, grasa: 2, carb: 0.5, obs: "Cada loncha Aprox. 6g" },
	{ categoria: "Proteina", nombre: "Boquerones en Vinagre (Escurrido)", kcal: 156, prot: 24.7, grasa: 6, carb: 0.7, obs: "Cada boqueron escurrido Aprox. 3g" },
	{ categoria: "Proteina", nombre: "Boquerones en Aliñados en ajo y perejil (Escurrido)", kcal: 149, prot: 22, grasa: 6.8, carb: 0, obs: "Cada boqueron escurrido Aprox. 3g" },
	{ categoria: "Proteina", nombre: "Lomo de cebo ibérico 50% raza ibérica", kcal: 298, prot: 39.1, grasa: 15.5, carb: 0.7, obs: "Cada loncha 5.5g aprox." },
	{ categoria: "Proteina", nombre: "Lomo de salmon", kcal: 223, prot: 20, grasa: 16, carb: 0, obs: "Cada lomo unos 125g aprox." },
	{ categoria: "Proteina", nombre: "Gamba roja", kcal: 92, prot: 21, grasa: 1.1, carb: 0, obs: "Cada gamba unos 30g aprox." },
	
    // --- CEREALES Y LEGUMBRES ---
    { categoria: "Carbohidrato", nombre: "Avena en copos", kcal: 375, prot: 13, grasa: 7, carb: 59, obs: "" },
    { categoria: "Carbohidrato", nombre: "Arroz Integral", kcal: 350, prot: 7.5, grasa: 2.5, carb: 73, obs: "" },
    { categoria: "Carbohidrato", nombre: "Quinoa cocida", kcal: 120, prot: 4.4, grasa: 1.9, carb: 21, obs: "" },
    { categoria: "Carbohidrato", nombre: "Garbanzos Cocidos (bote)", kcal: 105, prot: 6, grasa: 2, carb: 14, obs: "" },
    { categoria: "Carbohidrato", nombre: "Lentejas Cocidas (bote)", kcal: 85, prot: 7, grasa: 0.5, carb: 11, obs: "" },
    { categoria: "Carbohidrato", nombre: "Pasta 100% Integral", kcal: 345, prot: 13, grasa: 2, carb: 65, obs: "" },
    { categoria: "Carbohidrato", nombre: "Tortitas de maíz Hacendado", kcal: 368, prot: 7.5, grasa: 1.8, carb: 80, obs: "1 Tortita pesa aprox 7.5g." },

    // --- GRASAS Y SALSAS ---
    { categoria: "Carbohidrato", nombre: "Hummus de Garbanzos", kcal: 240, prot: 8, grasa: 18, carb: 10, obs: "" },
    { categoria: "Grasa", nombre: "Guacamole Fresh", kcal: 155, prot: 1.5, grasa: 14, carb: 3, obs: "" },
    { categoria: "Grasa", nombre: "Alioli", kcal: 749, prot: 1.2, grasa: 82, carb: 1.5, obs: "1 cucharada cafe 5g." },
    { categoria: "Grasa", nombre: "Aceite de Oliva Virgen Extra", kcal: 884, prot: 0, grasa: 100, carb: 0, obs: "1 cucharada sopera ≈ 10g-12g." },
    { categoria: "Grasa", nombre: "Crema de Cacahuete 100%", kcal: 618, prot: 30, grasa: 50, carb: 7, obs: "" },
    { categoria: "Grasa", nombre: "Tahini (Pasta de sésamo)", kcal: 710, prot: 25, grasa: 65, carb: 3, obs: "" },
    { categoria: "Grasa", nombre: "Nueces Peladas", kcal: 654, prot: 15, grasa: 65, carb: 7, obs: "" },
    { categoria: "Grasa", nombre: "Almendras Tostadas", kcal: 620, prot: 22, grasa: 54, carb: 5, obs: "" },

    // --- PANES Y OTROS ---
    { categoria: "Carbohidrato", nombre: "Pan 100% Integral Centeno", kcal: 230, prot: 8, grasa: 2, carb: 40, obs: "" },
    { categoria: "Carbohidrato", nombre: "Pan de Molde Integral", kcal: 245, prot: 9, grasa: 3, carb: 42, obs: "" },
    { categoria: "Carbohidrato", nombre: "Tostadas de Fibra y Sésamo", kcal: 390, prot: 12, grasa: 7, carb: 60, obs: "" },
    { categoria: "Carbohidrato", nombre: "Tostadas 100% Espelta Integral (1 tostada 7g)", kcal: 382, prot: 17, grasa: 6.4, carb: 59, obs: "" },
    { categoria: "Carbohidrato", nombre: "Tortitas de Maiz", kcal: 368, prot: 7.5, grasa: 1.8, carb: 80, obs: "Cada tortita 7.5g cada paquete de 4 30g" },
    { categoria: "Proteina", nombre: "Tofu Firme", kcal: 120, prot: 12, grasa: 7, carb: 2, obs: "" },
    { categoria: "Carbohidrato", nombre: "Edamame Congelado", kcal: 130, prot: 11, grasa: 5, carb: 10, obs: "" },
    { categoria: "Carbohidrato", nombre: "Salmorejo Fresco", kcal: 75, prot: 1, grasa: 5, carb: 6, obs: "" },
    { categoria: "Carbohidrato", nombre: "Gazpacho Suave", kcal: 45, prot: 0.8, grasa: 3, carb: 3.5, obs: "" },
	
    // --- FRUTAS Y VERDURAS ---
    { categoria: "Carbohidrato", nombre: "Platano", kcal: 89, prot: 1.1, grasa: 0.3, carb: 23, obs: "Sin piel pesa aprox 80-120g." },
    { categoria: "Carbohidrato", nombre: "Manzana 1 pieza son 150 gramos", kcal: 52, prot: 0.3, grasa: 0.2, carb: 14, obs: "" },
    { categoria: "Carbohidrato", nombre: "Naranja 1 pieza son 150 gramos", kcal: 60, prot: 0.94, grasa: 0.12, carb: 11.75, obs: "1 pieza mediana 150g." },
    { categoria: "Carbohidrato", nombre: "Aguacate", kcal: 160, prot: 2, grasa: 15, carb: 9, obs: "" },
    { categoria: "Carbohidrato", nombre: "Brócoli Congelado", kcal: 34, prot: 3, grasa: 0.4, carb: 4, obs: "" },
    { categoria: "Carbohidrato", nombre: "Espinacas Frescas", kcal: 23, prot: 2.9, grasa: 0.4, carb: 3.6, obs: "" },
    { categoria: "Carbohidrato", nombre: "Judías Verdes", kcal: 31, prot: 1.8, grasa: 0.2, carb: 7, obs: "" },
    { categoria: "Carbohidrato", nombre: "Arándanos Frescos", kcal: 57, prot: 0.7, grasa: 0.3, carb: 14, obs: "" },
    { categoria: "Carbohidrato", nombre: "Nispero", kcal: 47, prot: 0.4, grasa: 0.2, carb: 12, obs: "Peso de un nispero unos 60g aprox." },
	
	// --- DULCES ---
    { categoria: "Carbohidrato", nombre: "Nestle Extrafino Filipino Blanco", kcal: 557, prot: 4.4, grasa: 33.5, carb: 58.7, obs: "1 onza 8.5g" },
    { categoria: "Carbohidrato", nombre: "Chocolate Valor Puro con Almendras", kcal: 570, prot: 9.9, grasa: 40, carb: 38, obs: "1 onza 13.8g" },
    { categoria: "Carbohidrato", nombre: "Chocolate con leche", kcal: 523, prot: 5.6, grasa: 28, carb: 59.8, obs: "1 onza 15g" },
    { categoria: "Carbohidrato", nombre: "Cacao puro en polvo", kcal: 375, prot: 25.5, grasa: 16, carb: 16.3, obs: "Cuchara pequeña 5g aprox" },
    { categoria: "Carbohidrato", nombre: "Bizcocho Chocolate con pepitas", kcal: 436, prot: 9.5, grasa: 24, carb: 45, obs: "" },
    { categoria: "Carbohidrato", nombre: "Gominola Gummy", kcal: 325, prot: 3.6, grasa: 0, carb: 76.5, obs: "Una gummy 6.25g - Cuatro 25g" }
];