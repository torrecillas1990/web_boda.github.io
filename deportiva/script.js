    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Animación simple de las barras (opcional)
        menuToggle.classList.toggle('is-active');
    });