// En index/script.js

const VitalStats = {
    // ... (funciones anteriores de login/logout) ...

    sincronizarDatos: function() {
        const sesion = JSON.parse(localStorage.getItem('vs_session'));
        if (!sesion) return null;

        console.log(`Sincronizando datos para: ${sesion.user}...`);

        // 1. Buscamos si existen datos para este usuario en el archivo cargado
        if (window.REGISTRO_CLOUD && window.REGISTRO_CLOUD[sesion.user]) {
            const datosUsuario = window.REGISTRO_CLOUD[sesion.user];
            
            // 2. Mezclamos con lo que hay en LocalStorage (o lo sobreescribimos)
            // Aquí tú decides si el "Cloud" manda sobre el "Local"
            localStorage.setItem('historialNutricional', JSON.stringify(this.formatearDatos(datosUsuario)));
            
            console.log("¡Datos sincronizados desde la nube!");
            return true;
        }
        return false;
    },

    // Auxiliar para convertir el formato del archivo .js al formato que espera tu App
    formatearDatos: function(arrayDatos) {
        let formatoApp = {};
        arrayDatos.forEach(reg => {
            formatoApp[reg.fecha] = [ { nombre: "Carga Cloud", kcal: reg.kcal, prot: reg.prot, grasa: reg.grasa, carb: reg.carb } ];
        });
        return formatoApp;
    }
};