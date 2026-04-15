document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Abrir/Cerrar menú al hacer clic en la hamburguesa
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('is-active'); // Por si quieres animar las barras en el CSS
    });

    // Cerrar el menú si se hace clic fuera (mejora la UX)
    document.addEventListener('click', (event) => {
        const isClickInside = menuToggle.contains(event.target) || navLinks.contains(event.target);
        
        if (!isClickInside && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('is-active');
        }
    });
});

// Objeto global para gestionar el perfil del usuario
const VitalStats = {
    // Guardar un dato (ej: peso, grasa, calorias)
    save: function(key, value) {
        localStorage.setItem(`vs_${key}`, value);
    },

    // Recuperar un dato
    get: function(key) {
        return localStorage.getItem(`vs_${key}`);
    },

    // Borrar todo
    clear: function() {
        localStorage.clear();
        location.reload();
    }
};

// En /script.js (el general)

function saveToHistory(data) {
    let historyCount = parseInt(VitalStats.get('history_count') || 0);

    if (historyCount >= 3) {
        // Si ya llegó al límite, mostramos un aviso elegante
        alert("Has alcanzado el límite de 3 registros gratuitos. Hazte Premium para guardar todo tu historial.");
        window.location.href = "../registro-premium/index.html";
    } else {
        // Lógica para guardar el registro (aquí podrías guardar un array de resultados)
        let historial = JSON.parse(VitalStats.get('user_history') || "[]");
        historial.push({
            fecha: new Date().toLocaleDateString(),
            datos: data
        });
        
        VitalStats.save('user_history', JSON.stringify(historial));
        
        // Aumentar el contador de uso gratuito
        historyCount++;
        VitalStats.save('history_count', historyCount);
        
        alert("¡Datos guardados con éxito en tu historial local!");
    }
}