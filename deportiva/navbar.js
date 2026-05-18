
// --- INICIALIZACIÓN PRINCIPAL ---
document.addEventListener('DOMContentLoaded', async () => {
	
	// navbar 
	const indexnavbarjs = document.getElementById('index-navbar-js');
	const navbarjs = document.getElementById('navbar-js');
	
	if (indexnavbarjs) {
		indexnavbarjs.innerHTML =
		`		<div class="nav-container">
				<a href="./index.html" class="logo" target="_self">VitalStats</a>
				<button class="menu-toggle" id="mobile-menu">
					<span class="bar"></span>
					<span class="bar"></span>
					<span class="bar"></span>
				</button>
				<ul class="nav-links">
					<li><a href="./index.html" target="_self">Inicio</a></li>
					<li><a href="./contador-calorias/index.html" target="_self">Calorías</a></li>
					<li><a href="./calculadora-grasa-corporal/index.html" target="_self">Grasa Corporal</a></li>
					<li><a href="./calculadora-ritmo/index.html" target="_self">Ritmo Runner</a></li>
				</ul>
				<a href="./registro-premium/index.html" class="btn-nav" target="_self">Premium</a>
				<a href="#" id="authBtn" class="btn-nav" target="_self">Cargando...</a>
			</div>`;
	} 
	
	if (navbarjs) {
		navbarjs.innerHTML =
		`		<div class="nav-container">
				<a href="../index.html" class="logo" target="_self">VitalStats</a>
				<button class="menu-toggle" id="mobile-menu">
					<span class="bar"></span>
					<span class="bar"></span>
					<span class="bar"></span>
				</button>
				<ul class="nav-links">
					<li><a href="../index.html" target="_self">Inicio</a></li>
					<li><a href="../contador-calorias/index.html" target="_self">Calorías</a></li>
					<li><a href="../calculadora-grasa-corporal/index.html" target="_self">Grasa Corporal</a></li>
					<li><a href="../calculadora-ritmo/index.html" target="_self">Ritmo Runner</a></li>
				</ul>
				<a href="../registro-premium/index.html" class="btn-nav" target="_self">Premium</a>
				<a href="#" id="authBtn" class="btn-nav" target="_self">Cargando...</a>
			</div>`;
	}
	
	// navbar para moviles
	const indexmobilenavbarjs = document.getElementById('index-mobile-tab-bar-js');
	const mobilenavbarjs = document.getElementById('mobile-tab-bar-js');
	
	if (indexmobilenavbarjs) {
		indexmobilenavbarjs.innerHTML =
		`		<a href="./contador-calorias/index.html" class="tab-item" target="_self">
					<span class="tab-icon">🍎</span>
					<span class="tab-label">Calorías</span>
				</a>
				<a href="./calculadora-grasa-corporal/index.html" class="tab-item" target="_self">
					<span class="tab-icon">⚖️</span>
					<span class="tab-label">Grasa</span>
				</a>
				<a href="./index.html" class="tab-item" target="_self">
					<span class="tab-icon">🏠</span>
					<span class="tab-label">Inicio</span>
				</a>
				<a href="./calculadora-ritmo/index.html" class="tab-item" target="_self">
					<span class="tab-icon">🏃</span>
					<span class="tab-label">Ritmo</span>
				</a>
				<a href="./registro-premium/index.html" class="tab-item" target="_self">
					<span class="tab-icon">💎</span>
					<span class="tab-label">Pro</span>
				</a>`;
	} 
	
	if (mobilenavbarjs) {
		mobilenavbarjs.innerHTML =
		`		<a href="../contador-calorias/index.html" class="tab-item" target="_self">
					<span class="tab-icon">🍎</span>
					<span class="tab-label">Calorías</span>
				</a>
				<a href="../calculadora-grasa-corporal/index.html" class="tab-item" target="_self">
					<span class="tab-icon">⚖️</span>
					<span class="tab-label">Grasa</span>
				</a>
				<a href="../index.html" class="tab-item" target="_self">
					<span class="tab-icon">🏠</span>
					<span class="tab-label">Inicio</span>
				</a>
				<a href="../calculadora-ritmo/index.html" class="tab-item" target="_self">
					<span class="tab-icon">🏃</span>
					<span class="tab-label">Ritmo</span>
				</a>
				<a href="../registro-premium/index.html" class="tab-item" target="_self">
					<span class="tab-icon">💎</span>
					<span class="tab-label">Pro</span>
				</a>`;
	}
	
	// footer
	const footer = document.getElementById('footer');
	
	if (footer) {
		footer.innerHTML =
		`		        <p>&copy; 2026 VitalStats Hub - Tu salud en números.</p>`;
	} 
	
	// perfil modal
	const authModal = document.getElementById('authModal');
	
	if (authModal) {
		authModal.innerHTML =
		`		<div class="modal-content perfil-card">
					<div class="perfil-header">
						<h2 id="perfilNombre">Identificarse</h2>
					</div>
					<input type="text" id="loginUser" placeholder="Usuario" style="width:100%; margin-bottom:10px; padding:10px;">
					<input type="password" id="loginPass" placeholder="Contraseña" style="width:100%; margin-bottom:20px; padding:10px;">
					<button onclick="intentarLogin()" style="background:#28a745; color:white; border:none; padding:10px 20px; cursor:pointer; width:100%; border-radius:5px;">Entrar</button>
					<button onclick="cerrarLogin()" style="background:none; border:none; color:red; margin-top:10px; cursor:pointer;">Cancelar</button>
				</div>`;
	} 
	
	// perfil modal
	const perfilModal = document.getElementById('perfilModal');
	
	if (perfilModal) {
		perfilModal.innerHTML =
		`		<div class="modal-content perfil-card">
					<span class="close-modal" id="closePerfil">&times;</span>
					<div class="perfil-header">
						<div class="avatar-circle" id="userAvatarModalPerfil">T</div>
						<h2 id="perfilNombreModalPerfil">Usuario</h2>
						<p class="user-status">Miembro VitalStats</p>
					</div>
					<hr>
					<div class="perfil-stats">
						<div class="stat-item">
							<button id="theme-toggle" class="btn-theme" title="Cambiar modo">
								<span id="theme-icon">🌙</span>
							</button>
						</div>
						<div class="stat-item">
							<span class="stat-value" id="statsDiasModalPerfil">0</span>
							<span class="stat-label">Días Registrados</span>
						</div>
					</div>
					<button id="logoutBtn" class="btn-logout">Cerrar Sesión</button>
				</div>`;
	} 
	
	// install banner
	const installBanner = document.getElementById('install-banner');
	
	if (installBanner) {
		installBanner.innerHTML =
		`		<div class="install-content">
					<img src="recursos/icon-192.png" alt="VitalStats Logo" class="install-icon">
					<div class="install-text">
						<strong>Instalar VitalStats</strong>
						<p>Acceso rápido y modo offline</p>
					</div>
				</div>
				<div class="install-actions">
					<button id="btn-install-no" class="btn-secondary">Ahora no</button>
					<button id="btn-install-yes" class="btn-primary">Instalar</button>
				</div>`;
	} 
		
});