// --- MOTOR DE AUDIO SINTETIZADO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bjpInterval;

// Variable global para controlar el estado de la música
let musicaEncendida = true;

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
    
    // Si la música está apagada, cancelamos cualquier intento de reproducción
    if (!musicaEncendida) return;
    
    // Si no se le pasa un tipo concreto, deduce cuál suena según el estado actual del juego
    let tipoAHR = tipo || (modo === 'batalla' ? 'batalla' : 'exploracion');
    
    if(tipoAHR === 'exploracion') {
        let notas = [261, 293, 329, 349, 392, 349, 329, 293];
        let i = 0;
        bjpInterval = setInterval(() => {
            playTone(notas[i%notas.length], 'square', 0.2);
            i++;
        }, 250);
    } else if (tipoAHR === 'batalla') {
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

// --- BASE DE DATOS E HISTORIAL DEL MUNDO (DICCIONARIO DE ESPECIES) ---
const ESPECIES_POKEDEX = ['Charmander', 'Bulbasaur', 'Squirtle', 'Pidgey', 'Pikachu'];
let especiesAvistadas = { 'Charmander': true }; // Registro para el panel de la Pokédex

// --- SISTEMA DE EQUIPO RESTRUCTURADO (MÁXIMO 6) Y CAJA ---
let equipo = [
    { nombre: 'Charmander', hpMax: 50, hp: 50, nivel: 5, exp: 0, ataques: [{n:'Placaje', d:10}, {n:'Ascuas', d:18}] }
];
let caja = []; // Destino de criaturas cuando equipo.length >= 6
let miPokemon = equipo[0]; // Puntero al luchador activo

// Modificación del inventario inicial para testear filtros
let inventario = { pociones: 5, bolas: 5, antidoto: 0, superball: 1 }; 

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

let enemigoActual = null; let turnoBloqueado = false;

let animacionCaptura = false; // Controla si dibujamos la bola o al enemigo

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

// --- NAVEGACIÓN DEL MENÚ POKÉMON ---

function abrirMenuPokemon() {
    if(turnoBloqueado) return;
    
    document.getElementById('menuOpciones').style.display = 'none';
    document.getElementById('menuPokemon').style.display = 'grid';
    document.getElementById('battleText').innerText = "Selecciona un Pokémon para combatir:";

    // Renderizar usando 'equipo' (máximo 6, pero solo mostramos los que haya)
    for(let i = 0; i < 6; i++) {
        let btn = document.getElementById(`btnPkmn${i}`);
        if (!btn) continue; // Por si tu HTML solo tiene 3 botones todavía
        
        let pkmn = equipo[i]; // <--- CAMBIADO AQUÍ (Antes POKEDEX)

        if(pkmn) {
            btn.style.display = 'block';
            btn.innerText = `${pkmn.nombre} (${pkmn.hp}/${pkmn.hpMax})`;
            
            if (pkmn === miPokemon) {
                btn.innerText = `• ${pkmn.nombre} •`;
            } else if (pkmn.hp <= 0) {
                btn.innerText = `${pkmn.nombre} (X_X)`;
            }
        } else {
            btn.style.display = 'none';
        }
    }
}

function elegirPokemon(indice) {
    let pokemonSeleccionado = equipo[indice]; // <--- CAMBIADO AQUÍ (Antes POKEDEX)

    if (!pokemonSeleccionado) return;

    if (pokemonSeleccionado === miPokemon) {
        document.getElementById('battleText').innerText = `¡${pokemonSeleccionado.nombre} ya está en la arena!`;
        return;
    }

    if (pokemonSeleccionado.hp <= 0) {
        document.getElementById('battleText').innerText = `¡${pokemonSeleccionado.nombre} no tiene energías!`;
        return;
    }

    turnoBloqueado = true;
    document.getElementById('menuPokemon').style.display = 'none';
    document.getElementById('battleText').innerText = `¡Regresa ${miPokemon.nombre}! ... ¡Adelante ${pokemonSeleccionado.nombre}!`;
    
    playTone(300, 'square', 0.1);
    setTimeout(() => playTone(450, 'square', 0.15), 100);

    miPokemon = pokemonSeleccionado;
    setTimeout(() => { turnoEnemigo(); }, 2000);
}

function cambiarPokemon() {
    if(turnoBloqueado) return;
    let indexActual = equipo.indexOf(miPokemon); // <--- CAMBIADO AQUÍ (Antes POKEDEX)
    miPokemon = equipo[(indexActual + 1) % equipo.length]; // <--- CAMBIADO AQUÍ
    document.getElementById('battleText').innerText = `¡Adelante ${miPokemon.nombre}!`;
    playTone(400, 'square', 0.1);
    cerrarAtaques();
}

function cerrarMenuPokemon() {
    document.getElementById('menuPokemon').style.display = 'none';
    document.getElementById('menuOpciones').style.display = 'grid';
    document.getElementById('battleText').innerText = `¿Qué debe hacer ${miPokemon.nombre}?`;
}

// --- NAVEGACIÓN DEL INVENTARIO ---
function abrirInventario() {
    if(turnoBloqueado) return;
    
    // Cambiamos la vista de los menús
    document.getElementById('menuOpciones').style.display = 'none';
    document.getElementById('menuInventario').style.display = 'grid';
    
    // Actualizamos el texto de los botones con la cantidad actual
    document.getElementById('btnPocion').innerText = `Poción (x${inventario.pociones})`;
    document.getElementById('btnBola').innerText = `Bola (x${inventario.bolas})`;
    
    document.getElementById('battleText').innerText = "¿Qué objeto quieres usar?";
}

function cerrarInventario() {
    document.getElementById('menuInventario').style.display = 'none';
    document.getElementById('menuOpciones').style.display = 'grid';
    document.getElementById('battleText').innerText = `¿Qué debe hacer ${miPokemon.nombre}?`;
}

// --- EFECTOS DE LOS OBJETOS ---

function usarPocion() {
    if (inventario.pociones <= 0) {
        document.getElementById('battleText').innerText = "¡No te quedan Pociones!";
        return;
    }
    if (miPokemon.hp === miPokemon.hpMax) {
        document.getElementById('battleText').innerText = `¡La salud de ${miPokemon.nombre} ya está al máximo!`;
        return;
    }

    // Consumir poción y curar
    inventario.pociones--;
    turnoBloqueado = true;
    cerrarInventario();
    
    miPokemon.hp = Math.min(miPokemon.hpMax, miPokemon.hp + 25);
    document.getElementById('battleText').innerText = `¡Usaste una Poción! ${miPokemon.nombre} recuperó 25 PS.`;
    playTone(550, 'sine', 0.1); // Sonido de curación
    
    // Pasa el turno al enemigo tras usar la poción
    setTimeout(turnoEnemigo, 1500);
}

function usarBola() {
    if (inventario.bolas <= 0) {
        document.getElementById('battleText').innerText = "¡No te quedan Bolas!";
        return;
    }

    // Consumir bola e iniciar captura
    inventario.bolas--;
    turnoBloqueado = true;
    animacionCaptura = true; // Activa el dibujo de la bola en el Canvas
    cerrarInventario();
    
    document.getElementById('battleText').innerText = `¡Lanzaste una Bola!`;
    playTone(350, 'triangle', 0.2); // Sonido de lanzamiento

    // Llama al sistema de probabilidades que creamos anteriormente
    setTimeout(() => calcularCaptura(), 1200);
}

function calcularCaptura() {
    // Probabilidad Base (ej. 30%) + Bonus por Daño (hasta 50% extra)
    let probBase = 0.3; 
    let ratioSalud = enemigoActual.hp / enemigoActual.hpMax;
    let probFinal = probBase + ((1 - ratioSalud) * 0.5); 

    ejecutarTemblores(0, probFinal);
}

function ejecutarTemblores(fase, probFinal) {
    if (fase < 3) {
        // Animación de temblor
        document.getElementById('battleText').innerText = "...";
        playTone(120, 'sawtooth', 0.1); // Sonido de temblor seco

        // Comprobamos si el Pokémon rompe la bola en este temblor
        let tirada = Math.random();
        if (tirada > probFinal + 0.15) { // Damos un pequeño margen extra en cada temblor
            setTimeout(() => {
                animacionCaptura = false; // El enemigo vuelve a aparecer
                document.getElementById('battleText').innerText = "¡Oh no! ¡El Pokémon se escapó!";
                playTone(150, 'square', 0.4);
                setTimeout(turnoEnemigo, 1500);
            }, 1000);
            return;
        }

        // Si no se escapa, pasamos al siguiente temblor
        setTimeout(() => ejecutarTemblores(fase + 1, probFinal), 1000);
        
    } else {
        // FASE 3 SUPERADA: CAPTURA EXITOSA
        document.getElementById('battleText').innerText = `¡Genial! ¡${enemigoActual.nombre} fue capturado!`;
        playTone(600, 'square', 0.1);
        setTimeout(() => playTone(800, 'square', 0.2), 150);
        setTimeout(() => playTone(1000, 'square', 0.4), 300); // Canción de victoria rápida

        // Curamos al Pokémon capturado y lo añadimos al equipo
        let nuevoAmigo = JSON.parse(JSON.stringify(enemigoActual));
        nuevoAmigo.hp = nuevoAmigo.hpMax;
        nuevoAmigo.exp = 0;
        POKEDEX.push(nuevoAmigo);
		
		// Registrar especie en el historial de avistamientos
		especiesAvistadas[nuevoAmigo.nombre] = true;

		if (equipo.length < 6) {
			equipo.push(nuevoAmigo);
			document.getElementById('battleText').innerText = `¡${enemigoActual.nombre} se unió a tu EQUIPO!`;
		} else {
			caja.push(nuevoAmigo);
			document.getElementById('battleText').innerText = `¡Equipo lleno! ${enemigoActual.nombre} fue enviado a la CAJA.`;
		}
	
        setTimeout(() => {
            document.getElementById('battleText').innerText = `¡${enemigoActual.nombre} se ha añadido a tu equipo!`;
            setTimeout(() => {
                animacionCaptura = false;
                finalizarBatalla();
            }, 2000);
        }, 2000);
    }
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
		
        // DIBUJADO DINÁMICO DEL ENEMIGO O LA BOLA
		if (animacionCaptura) {
			// Coordenadas centrales donde estaría el enemigo
			let bx = 372; let by = 72;
			
			// Mitad superior (Roja)
			ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(bx, by, 16, Math.PI, 0); ctx.fill();
			// Mitad inferior (Blanca)
			ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI); ctx.fill();
			// Borde negro y línea central
			ctx.lineWidth = 2; ctx.strokeStyle = '#000';
			ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI*2); ctx.stroke();
			ctx.beginPath(); ctx.moveTo(bx - 16, by); ctx.lineTo(bx + 16, by); ctx.stroke();
			// Botón central
			ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI*2); ctx.fill();
			ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI*2); ctx.fill();
		} else {
			// Dibujo normal del enemigo
			ctx.drawImage(assets.pkmnEnemigo, 340, 40);
		}

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

// Actualización del cargador automático de persistencia
const partidaExistente = localStorage.getItem('pokemon_pro_save');
if (partidaExistente) {
    const datos = JSON.parse(partidaExistente);
    jugador.x = datos.jugadorX;
    jugador.y = datos.jugadorY;
    mapaActual = datos.mapa;
    inventario = datos.inventario;
    especiesAvistadas = datos.especiesAvistadas || { 'Charmander': true };
    
    // Restaurar equipo
    equipo.length = 0;
    datos.equipo.forEach(p => equipo.push(p));
    
    // Restaurar caja externa
    caja.length = 0;
    if(datos.caja) datos.caja.forEach(p => caja.push(p));
    
    miPokemon = equipo[0];
	
	// Dentro del bloque 'if (partidaExistente)' al final de tu script:
	if (datos.musicaEncendida !== undefined) {
		musicaEncendida = datos.musicaEncendida;
	}
    console.log("Datos del equipo y caja vinculados desde la memoria local.");
}

//reproducirMusica('exploracion');
loop();

// --- CONTROL INTEGRADO DEL MENÚ DE PAUSA ---

function abrirMenuPausa() {
    modo = 'pausa';
    detenerFisicas();
    document.getElementById('contenedorPausa').style.display = 'block';
    document.getElementById('menuPausa').style.display = 'flex';
    ocultarTodosLosSubPaneles();
    playTone(400, 'triangle', 0.05);
}

function cerrarMenuPausa() {
    modo = 'exploracion';
    document.getElementById('contenedorPausa').style.display = 'none';
    playTone(300, 'triangle', 0.05);
}

function abrirSubPanel(idPanel) {
    playTone(450, 'sine', 0.05);
    document.getElementById('menuPausa').style.display = 'none';
    ocultarTodosLosSubPaneles();
    
    const panel = document.getElementById(`panel${idPanel.charAt(0).toUpperCase() + idPanel.slice(1)}`);
    panel.style.display = 'flex';

    // RENDERIZADO DINÁMICO
    if (idPanel === 'pokedex') construirPokedexUI();
    if (idPanel === 'equipo') construirEquipoUI();
    if (idPanel === 'mochila') construirMochilaUI();
    if (idPanel === 'opciones') construirOpcionesUI();
    if (idPanel === 'guardar') document.getElementById('txtGuardar').innerText = "¿Deseas guardar tu progreso actual?";
}

function regresarAlMenuPausa() {
    playTone(350, 'sine', 0.05);
    ocultarTodosLosSubPaneles();
    document.getElementById('menuPausa').style.display = 'flex';
}

function ocultarTodosLosSubPaneles() {
    const paneles = ['panelPokedex', 'panelEquipo', 'panelMochila', 'panelGuardar', 'panelOpciones'];
    paneles.forEach(p => document.getElementById(p).style.display = 'none');
}

function alternarMenuPausa() {
    if (modo === 'exploracion') abrirMenuPausa();
    else if (modo === 'pausa') cerrarMenuPausa();
}

// --- CONSTRUCTORES DE CONTENIDO PIXEL-ART INDEPENDIENTES ---

// 1. Render Pokédex (Cruza especies totales vs descubiertas)
function construirPokedexUI() {
    const contenedor = document.getElementById('listaPokedex');
    contenedor.innerHTML = '';
    
    ESPECIES_POKEDEX.forEach((nombre, index) => {
        let numero = String(index + 1).padStart(3, '0');
        let capturado = especiesAvistadas[nombre];
        
        contenedor.innerHTML += `
            <div class="fila-registro">
                <span>Nº${numero} ${capturado ? nombre.toUpperCase() : '----------'}</span>
                <span style="color: ${capturado ? '#4caf50' : '#ccc'}">${capturado ? '✓ ATRAP' : '???'}</span>
            </div>`;
    });
}

// 2. Render Equipo (Max 6) y Caja de Almacenamiento
function construirEquipoUI() {
    const conEquipo = document.getElementById('listaEquipoPausa');
    const conCaja = document.getElementById('listaCajaPausa');
    conEquipo.innerHTML = '';
    conCaja.innerHTML = '';

    equipo.forEach((pkmn, i) => {
        conEquipo.innerHTML += `
            <div class="fila-registro">
                <span>${pkmn.nombre} (Nvl ${pkmn.nivel})</span>
                <span>HP: ${pkmn.hp}/${pkmn.hpMax}</span>
            </div>`;
    });

    if(caja.length === 0) {
        conCaja.innerHTML = `<div style="color:#999; text-align:center; font-size:12px; padding:6px;">La caja está vacía</div>`;
    } else {
        caja.forEach((pkmn) => {
            conCaja.innerHTML += `
                <div class="fila-registro" style="color:#555;">
                    <span>${pkmn.nombre} (Nvl ${pkmn.nivel})</span>
                    <span>ALMACENADO</span>
                </div>`;
        });
    }
}

// 3. Render Mochila (Muestra únicamente ítems con cantidad mayor o igual a 1)
function construirMochilaUI() {
    const contenedor = document.getElementById('listaMochilaPausa');
    contenedor.innerHTML = '';
    let totalItems = 0;

    for (let objeto in inventario) {
        if (inventario[objeto] >= 1) {
            totalItems++;
            // Capitalizar nombre del objeto visualmente
            let nombreFormateado = objeto.charAt(0).toUpperCase() + objeto.slice(1);
            contenedor.innerHTML += `
                <div class="fila-registro">
                    <span>• ${nombreFormateado}</span>
                    <span>x${inventario[objeto]}</span>
                </div>`;
        }
    }

    if (totalItems === 0) {
        contenedor.innerHTML = `<div style="color:#999; text-align:center; font-size:12px; padding:6px;">Mochila vacía</div>`;
    }
}

// 4. Mecánica de Guardado Persistente en LocalStorage
function pausaConfirmarGuardar() {
    try {
        const salvado = {
            jugadorX: jugador.x, jugadorY: jugador.y,
            mapa: mapaActual, inventario: inventario,
            equipo: equipo, caja: caja,
            especiesAvistadas: especiesAvistadas
        };
        localStorage.setItem('pokemon_pro_save', JSON.stringify(salvado));
        
        playTone(600, 'square', 0.08);
        setTimeout(() => playTone(800, 'square', 0.15), 80);
        
        document.getElementById('txtGuardar').innerText = "¡Partida guardada con éxito!";
    } catch(e) {
        document.getElementById('txtGuardar').innerText = "Error al acceder a la memoria.";
    }
}

// 5. Render Panel de Opciones e Interruptor de Música
function construirOpcionesUI() {
    const contenedor = document.getElementById('listaOpcionesPausa');
    contenedor.innerHTML = `
        <div style="padding: 10px; display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 14px;">
                <span>MÚSICA DE FONDO</span>
                <button onclick="alternarMusica()" style="width: 100px; padding: 6px; font-size: 11px; text-align: center;">
                    ${musicaEncendida ? 'ENCENDIDA' : 'APAGADA'}
                </button>
            </div>
            
            <div style="font-size: 11px; color: #777; border-top: 1px dashed #ccc; padding-top: 12px; line-height: 1.5;">
                • TEXTOS: RÁPIDO (Predeterminado)<br>
                • SONIDO: MONO (Sintetizador WebAudio)<br>
                • PANTALLA: AJUSTE AJUSTABLE
            </div>
        </div>
    `;
}

// Lógica para encender/apagar y actualizar la UI
function alternarMusica() {
    musicaEncendida = !musicaEncendida;
    
    if (musicaEncendida) {
        reproducirMusica(); // Enciende y detecta automáticamente si debe sonar exploración o batalla
    } else {
        clearInterval(bjpInterval); // Corta el bucle de sonido inmediatamente
    }
    
    construirOpcionesUI(); // Redibuja el botón para cambiar el texto de ENCENDIDA a APAGADA
    playTone(450, 'sine', 0.05); // Sonido sutil de confirmación de interfaz
}

// --- MAPEADO DE CONTROLES VIRTUALES PARA MÓVIL ---

const mapeoMovimiento = [
    { id: 'btnVUp', tecla: 'ArrowUp' },
    { id: 'btnVDown', tecla: 'ArrowDown' },
    { id: 'btnVLeft', tecla: 'ArrowLeft' },
    { id: 'btnVRight', tecla: 'ArrowRight' }
];

// Enlazar eventos táctiles a la cruceta
mapeoMovimiento.forEach(control => {
    const boton = document.getElementById(control.id);
    
    boton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        audioCtx.resume(); // Desbloquea el audio en navegadores móviles
        teclas[control.tecla] = true;
    });
    
    boton.addEventListener('touchend', (e) => {
        e.preventDefault();
        teclas[control.tecla] = false;
    });
});

// --- LÓGICA DE LOS BOTONES DE ACCIÓN (A / B / START / SELECT) ---
// --- DETECTOR DE TECLADO RECONECTADO ---
window.addEventListener('keydown', e => { 
    teclas[e.key] = true; 
    audioCtx.resume(); 

    // Interceptar la barra espaciadora para el menú de pausa
    if (e.key === ' ' || e.key === 'Spacebar') {
        if (modo === 'exploracion' || modo === 'pausa') {
            e.preventDefault(); // Evita que la página web haga scroll hacia abajo
            alternarMenuPausa();
        }
    }

    // Tecla opcional Escape o B para volver atrás en los subpaneles desde PC
    if (e.key === 'Escape' || e.key.toLowerCase() === 'b') {
        if (modo === 'pausa') {
            // Si hay un subpanel abierto, volvemos al menú lateral; si no, cerramos la pausa
            let algunoAbierto = false;
            ['panelPokedex', 'panelEquipo', 'panelMochila', 'panelGuardar', 'panelOpciones'].forEach(p => {
                if(document.getElementById(p).style.display === 'flex') algunoAbierto = true;
            });
            if (algunoAbierto) regresarAlMenuPausa();
            else cerrarMenuPausa();
        }
    }
});

window.addEventListener('keyup', e => teclas[e.key] = false);


// --- BOTONES DE ACCIÓN MÓVIL RECONECTADOS ---

document.getElementById('btnVA').addEventListener('touchstart', (e) => {
    e.preventDefault();
    audioCtx.resume();
    playTone(400, 'sine', 0.05);
    // Aquí podrías añadir lógica para interactuar con NPCs del mapa en el futuro
});

document.getElementById('btnVB').addEventListener('touchstart', (e) => {
    e.preventDefault();
    audioCtx.resume();
    
    // Si estamos en pausa, el botón B físico del móvil actúa como "VOLVER"
    if (modo === 'pausa') {
        let algunoAbierto = false;
        ['panelPokedex', 'panelEquipo', 'panelMochila', 'panelGuardar', 'panelOpciones'].forEach(p => {
            if(document.getElementById(p).style.display === 'flex') algunoAbierto = true;
        });
        if (algunoAbierto) regresarAlMenuPausa();
        else cerrarMenuPausa();
        return;
    }
    
    // Cancelación en menús de batalla
    if(modo === 'batalla' && !turnoBloqueado) {
        playTone(250, 'sine', 0.05);
        cerrarAtaques();
        cerrarInventario();
        cerrarMenuPokemon();
    }
});

// ¡VINCULACIÓN DEL START MÓVIL!
document.getElementById('btnVStart').addEventListener('touchstart', (e) => {
    e.preventDefault();
    audioCtx.resume();
    if (modo === 'exploracion' || modo === 'pausa') {
        alternarMenuPausa();
    }
});

document.getElementById('btnVSelect').addEventListener('touchstart', (e) => {
    e.preventDefault();
    playTone(450, 'triangle', 0.08);
});
