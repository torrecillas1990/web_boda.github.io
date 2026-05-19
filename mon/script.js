// --- MOTOR DE AUDIO SINTETIZADO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bjpInterval;

function playTone(freq, type, duration) {
    try {
        let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch(e){}
}

function reproducirMusica(tipo) {
    clearInterval(bjpInterval);
    if(tipo === 'exploracion') {
        let notas = [261, 293, 329, 349, 392, 349, 329, 293];
        let i = 0;
        bjpInterval = setInterval(() => {
            playTone(notas[i%notas.length], 'square', 0.2);
            i++;
        }, 250);
    } else if (tipo === 'batalla') {
        let i = 0;
        bjpInterval = setInterval(() => {
            playTone(i % 2 === 0 ? 150 : 110, 'sawtooth', 0.15);
            i++;
        }, 180);
    }
}

// --- CONFIGURACIÓN DE BLOQUES (01 A 99) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 32;

// Generador de gráficos según tu nueva lista de tipos	
const assets = {
    // 01-09: Exterior No Sólido
    01: crearTile('#558b2f', '#33691e', 'hierba'),
    02: crearTile('#9ccc65', '#aed581', 'suelo'),
    // 10-19: Sólido No Natural
    10: crearTile('#78909c', '#37474f', 'muro'),
    11: crearTile('#b71c1c', '#d32f2f', 'tejado'),
    12: crearTile('#a1887f', '#8d6e63', 'pared'),
    // 20-29: Sólido Natural
    20: crearTile('#2e7d32', '#1b5e20', 'arbol'),
    21: crearTile('#90a4ae', '#546e7a', 'piedra'),
    // 30-39: Interior No Natural
    30: crearTile('#ffe0b2', '#f5cc96', 'parquet'),
    31: crearTile('#e53935', '#b71c1c', 'alfombra'),
    32: crearTile('#b3e5fc', '#81d4fa', 'baldosa'),
    // 40-49: Interior Natural (Cuevas, tierra interna)
    40: crearTile('#8d6e63', '#4e342e', 'cueva'),
    // 50-59: Agua / Líquidos
    50: crearTile('#0288d1', '#01579b', 'agua'),
    // 60-69: Transición Agua / Tierra
    60: crearTile('#b0bec5', '#0288d1', 'orilla'),
    // 70-79: Interactivos / Portales
    70: crearTile('#5d4037', '#3e2723', 'puerta'),
    71: crearTile('#ffb74d', '#e53935', 'alfombra_salida'),
    // 80-99: Especiales
    80: crearTile('#e0f7fa', '#b2ebf2', 'hielo'),
    81: crearTile('#ffb300', '#ff8f00', 'cinta_derecha'),
    82: crearTile('#01579b', '#0091ea', 'remolino_agua'),
    83: crearTile('#d7ccc8', '#a1887f', 'remolino_tierra'),

    // SPRITES DEL PERSONAJE (Estilos cambiantes según terreno)
    player: crearSpriteJugador('#ffb74d', '#e53935'),       // Normal
    playerSurf: crearSpriteSurf(),                           // Nadando (Balsa Lapras)
    playerHielo: crearSpriteJugador('#e0f7fa', '#0288d1'),    // Deslizando en hielo
	pkmnJugador: crearSpritePokemon('#2196f3'), 
    pkmnEnemigo: crearSpritePokemon('#f44336')									   
};

function crearTile(col1, col2, tipo) {
    let c = document.createElement('canvas'); c.width = TILE_SIZE; c.height = TILE_SIZE;
    let cx = c.getContext('2d');
    cx.fillStyle = col1; cx.fillRect(0,0,TILE_SIZE,TILE_SIZE);
    cx.fillStyle = col2;
    if(tipo==='hierba') { for(let i=0; i<4; i++) cx.fillRect(i*8+2, 4, 3, 24); }
    if(tipo==='muro') { cx.fillRect(0,0,TILE_SIZE,4); cx.fillRect(8,0,4,14); }
    if(tipo==='tejado') { cx.beginPath(); cx.moveTo(0, TILE_SIZE); cx.lineTo(TILE_SIZE/2, 0); cx.lineTo(TILE_SIZE, TILE_SIZE); cx.fill(); }
    if(tipo==='arbol') { cx.beginPath(); cx.arc(TILE_SIZE/2, TILE_SIZE/2, 12, 0, Math.PI*2); cx.fill(); }
    if(tipo==='piedra') { cx.fillRect(4, 4, TILE_SIZE-8, TILE_SIZE-8); cx.fillStyle='#cfd8dc'; cx.fillRect(6,6,6,6); }
    if(tipo==='parquet') { cx.fillRect(0, 0, TILE_SIZE, 2); cx.fillRect(0, 16, TILE_SIZE, 2); }
    if(tipo==='baldosa') { cx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE); }
    if(tipo==='cueva') { cx.fillRect(2, 2, 6, 6); cx.fillRect(18, 20, 8, 4); }
    if(tipo==='agua') { cx.fillRect(2, 8, 12, 2); cx.fillRect(16, 22, 10, 2); }
    if(tipo==='orilla') { cx.fillRect(0, 0, TILE_SIZE, 12); }
    if(tipo==='puerta') { cx.fillRect(4, 4, TILE_SIZE-8, TILE_SIZE); cx.fillStyle='#ffd54f'; cx.fillRect(6,16,4,4); }
    if(tipo==='alfombra_salida') { cx.fillRect(2, 16, TILE_SIZE-4, TILE_SIZE-16); }
    if(tipo==='hielo') { cx.strokeStyle = '#ffffff'; cx.beginPath(); cx.moveTo(4,4); cx.lineTo(28,28); cx.stroke(); }
    if(tipo==='cinta_derecha') { cx.beginPath(); cx.moveTo(8, 8); cx.lineTo(24, 16); cx.lineTo(8, 24); cx.fill(); }
    if(tipo==='remolino_agua') { cx.beginPath(); cx.arc(TILE_SIZE/2, TILE_SIZE/2, 10, 0, Math.PI, true); cx.stroke(); }
    if(tipo==='remolino_tierra') { cx.fillRect(6,6,4,4); cx.fillRect(20,18,5,5); }
    return c;
}

function crearSpriteJugador(colCabeza, colCuerpo) {
    let c = document.createElement('canvas'); c.width = TILE_SIZE; c.height = TILE_SIZE;
    let cx = c.getContext('2d');
    cx.fillStyle = colCabeza; cx.fillRect(8, 4, 16, 12); 
    cx.fillStyle = colCuerpo; cx.fillRect(6, 16, 20, 14); 
    cx.fillStyle = '#000'; cx.fillRect(10, 8, 3, 3); cx.fillRect(19, 8, 3, 3); 
    return c;
}

function crearSpriteSurf() {
    let c = document.createElement('canvas'); c.width = TILE_SIZE; c.height = TILE_SIZE;
    let cx = c.getContext('2d');
    cx.fillStyle = '#26a69a'; cx.beginPath(); cx.arc(TILE_SIZE/2, TILE_SIZE/2+4, 12, 0, Math.PI*2); cx.fill(); // Caparazón balsa
    cx.fillStyle = '#ffe082'; cx.fillRect(12, 4, 8, 12); // Cuello/Cabeza de criatura de agua
    return c;
}

function crearSpritePokemon(color) {
    let c = document.createElement('canvas'); c.width = 64; c.height = 64;
    let cx = c.getContext('2d');
    cx.fillStyle = color; cx.beginPath(); cx.arc(32, 32, 24, 0, Math.PI*2); cx.fill(); 
    cx.fillStyle = '#000'; cx.beginPath(); cx.arc(24, 24, 4, 0, Math.PI*2); cx.arc(40, 24, 4, 0, Math.PI*2); cx.fill(); 
    return c;
}

// --- ARQUITECTURA DE MAPAS ---
let mapaActual = 'exterior';

// --- DICCIONARIO SISTÉMICO DE RANGOS ---
function obtenerPropiedadesBloque(id) {
    return {
        esSolidoNonatural:  (id >= 10 && id <= 19),
        esSolidoNatural:     (id >= 20 && id <= 29),
        tieneEncuentros:     (id >= 01 && id <= 09),
        esAgua:              (id >= 50 && id <= 59) || id === 82,
        esTransicionAgua:    (id >= 60 && id <= 69),
        esInteractivo:       (id >= 70 && id <= 79),
        
        // Físicas directas
        esHielo:             (id === 80),
        esCintaDerecha:      (id === 81),
        esRemolinoAgua:      (id === 82),
        esRemolinoTierra:    (id === 83)
    };
}

// --- VARIABLES DE ENTIDAD ---
let modo = 'exploracion';
const jugador = {
    x: 2 * TILE_SIZE,
    y: 2 * TILE_SIZE,
    velNormal: 2,
    velHielo: 4,
    velCinta: 3,
    velLenta: 0.7, // Factor de reducción para fango o remolinos terrestres
    dirX: 0,
    dirY: 0,
    estadoEstilo: 'normal',
    anguloGiro: 0  // Para la animación del remolino
};

const teclas = {};
window.addEventListener('keydown', e => { teclas[e.key] = true; audioCtx.resume(); });
window.addEventListener('keyup', e => teclas[e.key] = false);

function comprobarColision(futuroX, futuroY) {
    let margen = 4;
    let esquinas = [
        {x: futuroX + margen, y: futuroY + margen},
        {x: futuroX + TILE_SIZE - margen, y: futuroY + margen},
        {x: futuroX + margen, y: futuroY + TILE_SIZE - margen},
        {x: futuroX + TILE_SIZE - margen, y: futuroY + TILE_SIZE - margen}
    ];

    let mapa = MAPAS[mapaActual];
    for (let e of esquinas) {
        let gridX = Math.floor(e.x / TILE_SIZE);
        let gridY = Math.floor(e.y / TILE_SIZE);
        
        if (!mapa[gridY] || mapa[gridY][gridX] === undefined) return true;
        
        let props = obtenerPropiedadesBloque(mapa[gridY][gridX]);
        if (props.esSolidoNonatural || props.esSolidoNatural) return true;
        if (props.esAgua && jugador.estadoEstilo === 'normal') return true;
    }
    return false;
}

function actualizarMovimiento() {
    if (modo !== 'exploracion') return;

    let mapa = MAPAS[mapaActual];
    let centroX = Math.floor((jugador.x + TILE_SIZE / 2) / TILE_SIZE);
    let centroY = Math.floor((jugador.y + TILE_SIZE / 2) / TILE_SIZE);
    let bloqueActual = mapa[centroY][centroX];
    let propsActual = obtenerPropiedadesBloque(bloqueActual);

    // 1. CONTROL DE ESTADOS DE RENDER
    if (propsActual.esAgua) {
        jugador.estadoEstilo = 'surf';
    } else if (propsActual.esHielo) {
        jugador.estadoEstilo = 'hielo';
    } else if (propsActual.esTransicionAgua) {
        if (jugador.estadoEstilo !== 'surf' && (teclas['ArrowLeft'] || teclas['ArrowRight'] || teclas['ArrowUp'] || teclas['ArrowDown'])) {
            jugador.estadoEstilo = 'normal';
        }
    } else {
        jugador.estadoEstilo = 'normal';
    }

    // 2. SISTEMA DE DINÁMICAS VECTORIALES
    if (propsActual.esHielo) {
        if (jugador.dirX === 0 && jugador.dirY === 0) {
            if (teclas['ArrowUp'])         jugador.dirY = -jugador.velHielo;
            else if (teclas['ArrowDown'])  jugador.dirY = jugador.velHielo;
            else if (teclas['ArrowLeft'])  jugador.dirX = -jugador.velHielo;
            else if (teclas['ArrowRight']) jugador.dirX = jugador.velHielo;
        }
    } else if (propsActual.esCintaDerecha) {
        jugador.dirX = jugador.velCinta;
        jugador.dirY = 0;
    } else if (propsActual.esRemolinoAgua) {
        // Fuerza circular automática en el agua (te arrastra al centro del vórtice)
        jugador.anguloGiro += 0.15;
        jugador.dirX = Math.cos(jugador.anguloGiro) * 2;
        jugador.dirY = Math.sin(jugador.anguloGiro) * 2;
    } else if (propsActual.esRemolinoTierra) {
        // Reducción drástica de velocidad por succión/fango
        jugador.dirX = 0; jugador.dirY = 0;
        if (teclas['ArrowUp'])    jugador.dirY = -jugador.velLenta;
        if (teclas['ArrowDown'])  jugador.dirY = jugador.velLenta;
        if (teclas['ArrowLeft'])  jugador.dirX = -jugador.velLenta;
        if (teclas['ArrowRight']) jugador.dirX = jugador.velLenta;
    } else {
        // Velocidad Estándar
        jugador.dirX = 0; jugador.dirY = 0;
        if (teclas['ArrowUp'])    jugador.dirY = -jugador.velNormal;
        if (teclas['ArrowDown'])  jugador.dirY = jugador.velNormal;
        if (teclas['ArrowLeft'])  jugador.dirX = -jugador.velNormal;
        if (teclas['ArrowRight']) jugador.dirX = jugador.velNormal;
    }

    // 3. PROCESAR COORDENADAS FINALES
    let nuevoX = jugador.x + jugador.dirX;
    let nuevoY = jugador.y + jugador.dirY;

    if ((jugador.dirX !== 0 || jugador.dirY !== 0) && !comprobarColision(nuevoX, nuevoY)) {
        jugador.x = nuevoX;
        jugador.y = nuevoY;

        centroX = Math.floor((jugador.x + TILE_SIZE / 2) / TILE_SIZE);
        centroY = Math.floor((jugador.y + TILE_SIZE / 2) / TILE_SIZE);
        let nuevoBloque = mapa[centroY][centroX];
        let propsNuevas = obtenerPropiedadesBloque(nuevoBloque);

        if (propsNuevas.tieneEncuentros && nuevoBloque === 01) {
            if (Math.random() < 0.006) iniciarBatalla();
        }

        if (propsNuevas.esInteractivo) {
            if (nuevoBloque === 70) { 
                mapaActual = 'interior_casa';
                playTone(580, 'triangle', 0.15);
                jugador.x = 6 * TILE_SIZE; jugador.y = 3 * TILE_SIZE;
                detenerFisicas();
            } else if (nuevoBloque === 71) { 
                mapaActual = 'exterior';
                playTone(440, 'triangle', 0.15);
                jugador.x = 4 * TILE_SIZE; jugador.y = 6 * TILE_SIZE;
                detenerFisicas();
            }
        }
    } else {
        jugador.dirX = 0;
        jugador.dirY = 0;
    }
}

function detenerFisicas() {
    jugador.dirX = 0; jugador.dirY = 0; jugador.anguloGiro = 0;
    for (let k in teclas) teclas[k] = false;
}

// --- SISTEMA DE COMBATE REFACTORIZADO ---
const POKEDEX = [
    { nombre: 'Charmander', hpMax: 50, hp: 50, nivel: 5, exp: 0, ataques: [{n:'Placaje', d:10}, {n:'Ascuas', d:18}] },
    { nombre: 'Bulbasaur', hpMax: 55, hp: 55, nivel: 5, exp: 0, ataques: [{n:'Placaje', d:10}, {n:'Látigo Cepa', d:16}] },
    { nombre: 'Squirtle', hpMax: 52, hp: 52, nivel: 5, exp: 0, ataques: [{n:'Placaje', d:10}, {n:'Pistola Agua', d:17}] }
];
const ENEMIGOS_SALVAJES = [
    { nombre: 'Pidgey', hpMax: 30, hp: 30, nivel: 3, ataques: [{n:'Placaje', d:6}] },
    { nombre: 'Pikachu', hpMax: 35, hp: 35, nivel: 4, ataques: [{n:'Impactrueno', d:12}] }
];

let miPokemon = POKEDEX[0]; let enemigoActual = null; let turnoBloqueado = false;

function iniciarBatalla() {
    modo = 'batalla';
    detenerFisicas();
    reproducirMusica('batalla');
    let plantilla = ENEMIGOS_SALVAJES[Math.floor(Math.random() * ENEMIGOS_SALVAJES.length)];
    enemigoActual = JSON.parse(JSON.stringify(plantilla));
    document.getElementById('battleUI').style.display = 'block';
    document.getElementById('battleText').innerText = `¡Un ${enemigoActual.nombre} salvaje de Nvl ${enemigoActual.nivel} apareció!`;
    cerrarAtaques();
}

function abrirAtaques() {
    if(turnoBloqueado) return;
    document.getElementById('menuOpciones').style.display = 'none';
    document.getElementById('menuAtaques').style.display = 'grid';
    for(let i=0; i<3; i++) {
        let btn = document.getElementById(`btnAtk${i}`);
        if(miPokemon.ataques[i]) { btn.innerText = miPokemon.ataques[i].n; btn.style.display = 'block'; }
        else { btn.style.display = 'none'; }
    }
}
function cerrarAtaques() {
    document.getElementById('menuAtaques').style.display = 'none';
    document.getElementById('menuOpciones').style.display = 'grid';
}

function ejecutarAtaque(indiceAtk) {
    if(turnoBloqueado) return;
    turnoBloqueado = true;
    let ataque = miPokemon.ataques[indiceAtk];
    document.getElementById('battleText').innerText = `¡${miPokemon.nombre} usó ${ataque.n}!`;
    playTone(440, 'sawtooth', 0.2);

    setTimeout(() => {
        enemigoActual.hp = Math.max(0, enemigoActual.hp - ataque.d);
        if (enemigoActual.hp <= 0) {
            playTone(600, 'square', 0.4);
            document.getElementById('battleText').innerText = `¡El ${enemigoActual.nombre} salvaje se ha debilitado!`;
            setTimeout(() => {
                miPokemon.exp += 20;
                document.getElementById('battleText').innerText = `¡${miPokemon.nombre} ganó 20 Puntos de EXP!`;
                if(miPokemon.exp >= miPokemon.nivel * 15) {
                    miPokemon.nivel++; miPokemon.hpMax += 5; miPokemon.hp = miPokemon.hpMax;
                    setTimeout(() => { document.getElementById('battleText').innerText = `¡Subiste al Nivel ${miPokemon.nivel}!`; }, 1000);
                }
                setTimeout(finalizarBatalla, 2000);
            }, 1500);
        } else { turnoEnemigo(); }
    }, 1000);
}

// Turno de la IA del enemigo de manera simplificada
function turnoEnemigo() {
    let atkEnemigo = enemigoActual.ataques[Math.floor(Math.random() * enemigoActual.ataques.length)];
    document.getElementById('battleText').innerText = `¡${enemigoActual.nombre} salvaje usó ${atkEnemigo.n}!`;
    playTone(220, 'sine', 0.25);

    setTimeout(() => {
        miPokemon.hp = Math.max(0, miPokemon.hp - atkEnemigo.d);
        if(miPokemon.hp <= 0) {
            document.getElementById('battleText').innerText = `¡Tu ${miPokemon.nombre} se debilitó! Volviendo a zona segura...`;
            setTimeout(() => {
                miPokemon.hp = miPokemon.hpMax;
                mapaActual = 'exterior';
                jugador.x = 2 * TILE_SIZE; jugador.y = 2 * TILE_SIZE; 
                finalizarBatalla();
            }, 2500);
        } else {
            document.getElementById('battleText').innerText = `¿Qué debe hacer ${miPokemon.nombre}?`;
            turnoBloqueado = false; cerrarAtaques();
        }
    }, 1200);
}

function usarObjeto() {
    if(turnoBloqueado) return;
    miPokemon.hp = Math.min(miPokemon.hpMax, miPokemon.hp + 25);
    document.getElementById('battleText').innerText = `¡Usaste una Poción! ${miPokemon.nombre} recuperó 25 PS.`;
    playTone(550, 'sine', 0.1);
    turnoBloqueado = true;
    setTimeout(turnoEnemigo, 1500);
}

function cambiarPokemon() {
    if(turnoBloqueado) return;
    let indexActual = POKEDEX.indexOf(miPokemon);
    miPokemon = POKEDEX[(indexActual + 1) % POKEDEX.length];
    document.getElementById('battleText').innerText = `¡Adelante ${miPokemon.nombre}!`;
    playTone(400, 'square', 0.1);
    cerrarAtaques();
}

function intentarHuir() {
    if(turnoBloqueado) return;
    document.getElementById('battleText').innerText = "¡Escapaste sin problemas!";
    playTone(800, 'triangle', 0.3);
    setTimeout(finalizarBatalla, 1000);
}

function finalizarBatalla() {
    modo = 'exploracion'; turnoBloqueado = false;
    document.getElementById('battleUI').style.display = 'none';
    reproducirMusica('exploracion');
}

// --- BUCLE CENTRAL DEL MOTOR ---
function loop() {
    actualizarMovimiento();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (modo === 'exploracion') {
        let mapa = MAPAS[mapaActual];
        for (let r = 0; r < mapa.length; r++) {
            for (let c = 0; c < mapa[r].length; c++) {
                let id = mapa[r][c];
                let img = assets[id] || assets[02];
                ctx.drawImage(img, c * TILE_SIZE, r * TILE_SIZE);
            }
        }
        
		// SELECCIÓN DE DISEÑO DEL JUGADOR SEGÚN EL ENTORNO
        let spriteElegido = assets.player;
        if (jugador.estadoEstilo === 'surf') spriteElegido = assets.playerSurf;
        if (jugador.estadoEstilo === 'hielo') spriteElegido = assets.playerHielo;
        
        ctx.drawImage(spriteElegido, jugador.x, jugador.y);

    } else if (modo === 'batalla') {
        ctx.fillStyle = '#f5f5f5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.ellipse(120, 220, 80, 20, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(380, 110, 80, 20, 0, 0, Math.PI*2); ctx.fill();
        ctx.drawImage(assets.pkmnJugador, 80, 150);
        ctx.drawImage(assets.pkmnEnemigo, 340, 40);

		// HUD COMPLETADO CON BARRAS DE VIDA DINÁMICAS
        ctx.fillStyle = '#000'; ctx.font = 'bold 14px Courier New';
        ctx.fillText(`${enemigoActual.nombre.toUpperCase()} Nvl:${enemigoActual.nivel}`, 40, 45);
        ctx.fillStyle = '#ddd'; ctx.fillRect(40, 55, 120, 6);
        ctx.fillStyle = '#4caf50'; ctx.fillRect(40, 55, 120 * (enemigoActual.hp / enemigoActual.hpMax), 6);

        ctx.fillStyle = '#000';
        ctx.fillText(`${miPokemon.nombre.toUpperCase()} Nvl:${miPokemon.nivel}`, 300, 165);
        ctx.fillStyle = '#ddd'; ctx.fillRect(300, 175, 120, 6);
        ctx.fillStyle = '#4caf50'; ctx.fillRect(300, 175, 120 * (miPokemon.hp / miPokemon.hpMax), 6);
        ctx.fillText(`HP: ${miPokemon.hp}/${miPokemon.hpMax}`, 300, 195);
    }
    requestAnimationFrame(loop);
}

reproducirMusica('exploracion');
loop();