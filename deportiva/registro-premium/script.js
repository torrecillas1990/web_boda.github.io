document.addEventListener('DOMContentLoaded', () => {
    const btnPremium = document.querySelector('.btn-premium-action');

    if (btnPremium) {
        btnPremium.addEventListener('click', () => {
            // 1. Comprobamos si hay un usuario logueado en el localStorage
            const sesionActiva = localStorage.getItem('user_status'); // O la clave que uses para el login

            if (!sesionActiva || sesionActiva === 'guest') {
                alert("¡Paso previo! Primero debes identificarte para asociar tu suscripción.");
                if (typeof abrirLogin === 'function') {
                    abrirLogin(); // Llama a la función global de tu script.js raíz
                }
                return;
            }

            // 2. Si hay usuario, simulamos la activación Premium
            // Aquí podrías actualizar el objeto del usuario en el localStorage
            alert("¡Procesando suscripción! Gracias por confiar en VitalStats.");
            
            // Simulamos un pequeño delay de "pago"
            setTimeout(() => {
                alert("¡Felicidades! Tu cuenta ahora es Pro Stats. Reiniciando para aplicar las ventajas...");
                // Aquí podrías cambiar el estado a premium de verdad
                window.location.href = "../index.html";
            }, 1500);
        });
    }
});