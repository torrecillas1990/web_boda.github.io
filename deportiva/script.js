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