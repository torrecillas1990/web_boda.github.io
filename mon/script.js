// ============================================================================
// 1. MOTOR DE AUDIO SINTETIZADO (8-BIT WEB AUDIO API)
// ============================================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bjpInterval;
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
    if (!musicaEncendida) return;
    
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

// ============================================================================
// 2. CONFIGURACIÓN DE BLOQUES Y GENERACIÓN GRÁFICA PROCEDURAL
// ============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 32;

const assets = {
    01: crearTile('#558b2f', '#33691e', 'hierba'),
    02: crearTile('#9ccc65', '#aed581', 'suelo'),
    10: crearTile('#78909c', '#37474f', 'muro'),
    11: crearTile('#b71c1c', '#d32f2f', 'tejado'),
    12: crearTile('#a1887f', '#8d6e63', 'pared'),
    20: crearTile('#2e7d32', '#1b5e20', 'arbol'),
    21: crearTile('#90a4ae', '#546e7a', 'piedra'),
    30: crearTile('#ffe0b2', '#f5cc96', 'parquet'),
    31: crearTile('#e53935', '#b71c1c', 'alfombra'),
    32: crearTile('#b3e5fc', '#81d4fa', 'baldosa'),
    40: crearTile('#8d6e63', '#4e342e', 'cueva'),
    50: crearTile('#0288d1', '#01579b', 'agua'),
    60: crearTile('#b0bec5', '#0288d1', 'orilla'),
    70: crearTile('#5d4037', '#3e2723', 'puerta'),
    71: crearTile('#ffb74d', '#e53935', 'alfombra_salida'),
    72: crearTile('#9e9e9e', '#2196f3', 'ordenador'),
    80: crearTile('#e0f7fa', '#b2ebf2', 'hielo'),
    81: crearTile('#ffb300', '#ff8f00', 'cinta_derecha'),
    82: crearTile('#01579b', '#0091ea', 'remolino_agua'),
    83: crearTile('#d7ccc8', '#a1887f', 'remolino_tierra'),

    player: crearSpriteJugador('#ffb74d', '#e53935'),
    playerSurf: crearSpriteSurf(),
    playerHielo: crearSpriteJugador('#e0f7fa', '#0288d1'),
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
    if(tipo==='ordenador') {
        cx.fillStyle = '#616161'; cx.fillRect(2, 18, TILE_SIZE-4, 12);
        cx.fillStyle = col1; cx.fillRect(4, 2, TILE_SIZE-8, 16);
        cx.fillStyle = col2; cx.fillRect(7, 4, TILE_SIZE-14, 11);
        cx.fillStyle = '#fff'; cx.fillRect(9, 6, 2, 2);
    }
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
    cx.fillStyle = '#26a69a'; cx.beginPath(); cx.arc(TILE_SIZE/2, TILE_SIZE/2+4, 12, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#ffe082'; cx.fillRect(12, 4, 8, 12);
    return c;
}

function crearSpritePokemon(color) {
    let c = document.createElement('canvas'); c.width = 64; c.height = 64;
    let cx = c.getContext('2d');
    cx.fillStyle = color; cx.beginPath(); cx.arc(32, 32, 24, 0, Math.PI*2); cx.fill(); 
    cx.fillStyle = '#000'; cx.beginPath(); ctx.arc(24, 24, 4, 0, Math.PI*2); cx.arc(40, 24, 4, 0, Math.PI*2); cx.fill(); 
    return c;
}

// ============================================================================
// 3. VARIABLES DE ESTADO Y ALMACENAMIENTO GLOBAL
// ============================================================================
let mapaActual = 'exterior';
let modo = 'exploracion';
const teclas = {};

const jugador = {
    x: 2 * TILE_SIZE,
    y: 2 * TILE_SIZE,
    velNormal: 2,
    velHielo: 4,
    velCinta: 3,
    velLenta: 0.7,
    dirX: 0,
    dirY: 0,
    estadoEstilo: 'normal',
    anguloGiro: 0
};

const ESPECIES_POKEDEX = ['Charmander', 'Bulbasaur', 'Squirtle', 'Pidgey', 'Pikachu'];
let especiesAvistadas = { 'Charmander': true };

// --- NUEVA TABLA DE EFECTIVIDADES ELEMENTALES ---
const TABLA_TIPOS = {
    FUEGO:    { PLANTA: 2.0, AGUA: 0.5, FUEGO: 0.5 },
    AGUA:     { FUEGO: 2.0, PLANTA: 0.5, AGUA: 0.5 },
    PLANTA:   { AGUA: 2.0, FUEGO: 0.5, PLANTA: 0.5, VOLADOR: 0.5 },
    ELECTRICO:{ VOLADOR: 2.0, AGUA: 2.0, ELECTRICO: 0.5, PLANTA: 0.5 },
    VOLADOR:  { PLANTA: 2.0, ELECTRICO: 0.5 }
};

// --- BASE DE DATOS ACTUALIZADA CON TIPOS, PP Y ESTADOS ---
let equipo = [
    { 
        nombre: 'Charmander', tipo: 'FUEGO', estado: 'OK',
        hpMax: 50, hp: 50, nivel: 5, exp: 0, 
        ataques: [
            {n:'Placaje', d:10, tipo:'NORMAL', pp:35, ppMax:35}, 
            {n:'Ascuas', d:18, tipo:'FUEGO', pp:25, ppMax:25}
        ] 
    }
];

const ENEMIGOS_SALVAJES = [
    { 
        nombre: 'Bulbasaur', tipo: 'PLANTA', estado: 'OK', hpMax: 50, hp: 50, nivel: 5, 
        ataques: [{n:'Látigo Cepa', d:14, tipo:'PLANTA', pp:25, ppMax:25}] 
    },
    { 
        nombre: 'Squirtle', tipo: 'AGUA', estado: 'OK', hpMax: 50, hp: 50, nivel: 5, 
        ataques: [{n:'Burbuja', d:14, tipo:'AGUA', pp:25, ppMax:25}] 
    },
    { 
        nombre: 'Pidgey', tipo: 'VOLADOR', estado: 'OK', hpMax: 30, hp: 30, nivel: 3, 
        ataques: [{n:'Tornado', d:10, tipo:'VOLADOR', pp:35, ppMax:35}] 
    },
    { 
        nombre: 'Pikachu', tipo: 'ELECTRICO', estado: 'OK', hpMax: 35, hp: 35, nivel: 4, 
        ataques: [{n:'Impactrueno', d:16, tipo:'ELECTRICO', pp:20, ppMax:20}] 
    }
];

let caja = [];
let miPokemon = equipo[0];
let inventario = { pociones: 5, bolas: 5, antidoto: 0, superball: 1 }; 

let enemigoActual = null; 
let turnoBloqueado = false;
let animacionCaptura = false;

// --- BASE DE DATOS DE NPCs POR MAPA ---
const NPCS = {
    exterior: [
        {
            id: 'anciano_sabio',
            gridX: 7, gridY: 3, // Coordenadas en baldosas (tiles)
            colCabeza: '#cfd8dc', colCuerpo: '#37474f', // Pelo canoso, abrigo oscuro
            dialogo: [
                "¡Hola, joven aspirante!",
                "Cuidado con la pista de hielo del norte, ¡es súper resbaladiza!",
                "Si te quedas atrapado, deslízate hacia una roca sólida para frenar."
            ]
        }
    ],
    interior_casa: [
        {
            id: 'mama_pkmn',
            gridX: 4, gridY: 4, // Al lado de la entrada
            colCabeza: '#ff8a80', colCuerpo: '#c2185b', // Look hogareño
            dialogo: [
                "¡Hola, cariño! Qué casa tan bonita estás programando.",
                "Recuerda que puedes usar mi ORDENADOR para gestionar tus criaturas.",
                "Y no olvides GUARDAR la partida en el menú START antes de salir."
            ]
        }
    ]
};

// Variables de control de flujo del texto
let dialogoActual = null;
let indiceLineaDialogo = 0;

// ============================================================================
// 4. MOTOR DE FÍSICAS, MOVIMIENTO Y COLISIONES
// ============================================================================
function obtenerPropiedadesBloque(id) {
    return {
        esSolidoNonatural:  (id >= 10 && id <= 19),
        esSolidoNatural:     (id >= 20 && id <= 29),
        tieneEncuentros:     (id >= 01 && id <= 09),
        esAgua:              (id >= 50 && id <= 59) || id === 82,
        esTransicionAgua:    (id >= 60 && id <= 69),
        esInteractivo:       (id >= 70 && id <= 79),
        esOrdenador:         (id === 72),
        esHielo:              (id === 80),
        esCintaDerecha:      (id === 81),
        esRemolinoAgua:      (id === 82),
        esRemolinoTierra:    (id === 83)
    };
}

function comprobarColision(futuroX, futuroY) {
    let margen = 4;
    let esquinas = [
        {x: futuroX + margen, y: futuroY + margen},
        {x: futuroX + TILE_SIZE - margen, y: futuroY + margen},
        {x: futuroX + margen, y: futuroY + TILE_SIZE - margen},
        {x: futuroX + TILE_SIZE - margen, y: futuroY + TILE_SIZE - margen}
    ];

    // 1. Colisión con la matriz física del mapa
    let mapa = MAPAS[mapaActual];
    for (let e of esquinas) {
        let gridX = Math.floor(e.x / TILE_SIZE);
        let gridY = Math.floor(e.y / TILE_SIZE);
        
        if (!mapa[gridY] || mapa[gridY][gridX] === undefined) return true;
        
        let props = obtenerPropiedadesBloque(mapa[gridY][gridX]);
        if (props.esSolidoNonatural || props.esSolidoNatural || props.esOrdenador) return true;
        if (props.esAgua && jugador.estadoEstilo === 'normal') return true;
    }

    // 2. NUEVO: Colisión con NPCs del mapa actual
    let npcsMapa = NPCS[mapaActual] || [];
    for (let npc of npcsMapa) {
        let jugadorGridX_Futuro = Math.floor((futuroX + TILE_SIZE / 2) / TILE_SIZE);
        let jugadorGridY_Futuro = Math.floor((futuroY + TILE_SIZE / 2) / TILE_SIZE);
        
        if (npc.gridX === jugadorGridX_Futuro && npc.gridY === jugadorGridY_Futuro) {
            return true; // Sólido, no puedes atravesar al NPC
        }
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
        jugador.anguloGiro += 0.15;
        jugador.dirX = Math.cos(jugador.anguloGiro) * 2;
        jugador.dirY = Math.sin(jugador.anguloGiro) * 2;
    } else if (propsActual.esRemolinoTierra) {
        jugador.dirX = 0; jugador.dirY = 0;
        if (teclas['ArrowUp'])    jugador.dirY = -jugador.velLenta;
        if (teclas['ArrowDown'])  jugador.dirY = jugador.velLenta;
        if (teclas['ArrowLeft'])  jugador.dirX = -jugador.velLenta;
        if (teclas['ArrowRight']) jugador.dirX = jugador.velLenta;
    } else {
        jugador.dirX = 0; jugador.dirY = 0;
        if (teclas['ArrowUp'])    jugador.dirY = -jugador.velNormal;
        if (teclas['ArrowDown'])  jugador.dirY = jugador.velNormal;
        if (teclas['ArrowLeft'])  jugador.dirX = -jugador.velNormal;
        if (teclas['ArrowRight']) jugador.dirX = jugador.velNormal;
    }

    let nuevoX = jugador.x + jugador.dirX;
    let nuevoY = jugador.y + jugador.dirY;

    if ((jugador.dirX !== 0 || jugador.dirY !== 0) && !comprobarColision(nuevoX, nuevoY)) {
        jugador.x = nuevoX;
        jugador.y = nuevoY;

        centroX = Math.floor((jugador.x + TILE_SIZE / 2) / TILE_SIZE);
        centroY = Math.floor((jugador.y + TILE_SIZE / 2) / TILE_SIZE);
        let nuevoBloque = mapa[centroY][centroX];
        let propsNuevas = obtenerPropiedadesBloque(nuevoBloque);

        if (propsNuevas.tieneEncuentros && nuevoBloque === 1) {
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

function intentarInteractuar() {
    if (modo !== 'exploracion') return;
    
    let mapa = MAPAS[mapaActual];
    let centroX = Math.floor((jugador.x + TILE_SIZE / 2) / TILE_SIZE);
    let centroY = Math.floor((jugador.y + TILE_SIZE / 2) / TILE_SIZE);

    let vecinos = [
        {x: centroX, y: centroY - 1}, // Arriba
        {x: centroX, y: centroY + 1}, // Abajo
        {x: centroX - 1, y: centroY}, // Izquierda
        {x: centroX + 1, y: centroY}  // Derecha
    ];

    // 1. Verificar si hay un NPC en los azulejos vecinos
    let npcsMapa = NPCS[mapaActual] || [];
    for (let npc of npcsMapa) {
        for (let v of vecinos) {
            if (npc.gridX === v.x && npc.gridY === v.y) {
                iniciarDialogo(npc.dialogo);
                return;
            }
        }
    }

    // 2. Verificar si hay un Bloque Ordenador (Lógica anterior)
    for (let v of vecinos) {
        if (mapa[v.y] && mapa[v.y][v.x] !== undefined) {
            let idBloque = mapa[v.y][v.x];
            let props = obtenerPropiedadesBloque(idBloque);
            if (props.esOrdenador) {
                abrirMenuOrdenador();
                return;
            }
        }
    }
}

// --- MAQUINA DE ESTADOS DEL SISTEMA DE DIÁLOGOS ---

function iniciarDialogo(lineas) {
    modo = 'dialogo';
    detenerFisicas();
    dialogoActual = lineas;
    indiceLineaDialogo = 0;
    
    document.getElementById('dialogoUI').style.display = 'flex';
    mostrarTextoDialogo();
    playTone(400, 'sine', 0.04);
}

function mostrarTextoDialogo() {
    document.getElementById('dialogoTexto').innerText = dialogoActual[indiceLineaDialogo];
}

function avanzarDialogo() {
    indiceLineaDialogo++;
    playTone(450, 'sine', 0.03);
    
    // Si quedan líneas, las muestra; de lo contrario, apaga la interfaz
    if (indiceLineaDialogo < dialogoActual.length) {
        mostrarTextoDialogo();
    } else {
        finalizarDialogo();
    }
}

function finalizarDialogo() {
    modo = 'exploracion';
    dialogoActual = null;
    document.getElementById('dialogoUI').style.display = 'none';
    playTone(300, 'sine', 0.04);
}

// ============================================================================
// 5. SISTEMA DEL ORDENADOR (ALMACENAMIENTO EN CAJA)
// ============================================================================
function abrirMenuOrdenador() {
    modo = 'ordenador';
    detenerFisicas();
    document.getElementById('contenedorOrdenador').style.display = 'flex';
    actualizarPCUI();
    playTone(520, 'sine', 0.08);
}

function cerrarMenuOrdenador() {
    modo = 'exploracion';
    document.getElementById('contenedorOrdenador').style.display = 'none';
    playTone(320, 'sine', 0.05);
}

function actualizarPCUI() {
    const listaEquipo = document.getElementById('pcListaEquipo');
    const listaCaja = document.getElementById('pcListaCaja');
    listaEquipo.innerHTML = '';
    listaCaja.innerHTML = '';

    equipo.forEach((pkmn, index) => {
        listaEquipo.innerHTML += `
            <div class="item-pc-pkmn" onclick="pcDepositar(${index})">
                <span>${pkmn.nombre}</span>
                <span>Nvl:${pkmn.nivel}</span>
            </div>`;
    });

    if (caja.length === 0) {
        listaCaja.innerHTML = `<div style="color:#aaa; text-align:center; font-size:11px; padding-top:10px;">Caja vacía</div>`;
    } else {
        caja.forEach((pkmn, index) => {
            listaCaja.innerHTML += `
                <div class="item-pc-pkmn" onclick="pcRetirar(${index})">
                    <span>${pkmn.nombre}</span>
                    <span>Nvl:${pkmn.nivel}</span>
                </div>`;
        });
    }
}

function pcDepositar(index) {
    if (equipo.length <= 1) {
        alert("¡No puedes depositar a tu último Pokémon! Necesitas al menos uno para combatir.");
        return;
    }
    let pkmn = equipo.splice(index, 1)[0];
    caja.push(pkmn);
    if (pkmn === miPokemon) miPokemon = equipo[0];
    
    playTone(400, 'triangle', 0.05);
    actualizarPCUI();
}

function pcRetirar(index) {
    if (equipo.length >= 6) {
        alert("Tu equipo ya está lleno (Máximo 6 miembros). Deposita un Pokémon primero.");
        return;
    }
    let pkmn = caja.splice(index, 1)[0];
    equipo.push(pkmn);
    
    playTone(480, 'triangle', 0.05);
    actualizarPCUI();
}

// ============================================================================
// 6. ENTORNO DE COMBATE POR TURNOS Y CAPTURA
// ============================================================================
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

// --- RENDERIZADO DE ATAQUES CON PP ---
function abrirAtaques() {
    if(turnoBloqueado) return;
    document.getElementById('menuOpciones').style.display = 'none';
    document.getElementById('menuAtaques').style.display = 'grid';
    
    for(let i=0; i<3; i++) {
        let btn = document.getElementById(`btnAtk${i}`);
        let atk = miPokemon.ataques[i];
        if(atk) { 
            btn.innerText = `${atk.n} [${atk.pp}/${atk.ppMax}]`; 
            btn.style.display = 'block'; 
            // Deshabilitar botón si no quedan PP
            btn.disabled = atk.pp <= 0;
        } else { 
            btn.style.display = 'none'; 
        }
    }
}

function cerrarAtaques() {
    document.getElementById('menuAtaques').style.display = 'none';
    document.getElementById('menuOpciones').style.display = 'grid';
}

// --- TURNO DEL JUGADOR CON VALIDACIÓN DE PP Y ESTADOS ---
function ejecutarAtaque(indiceAtk) {
    if(turnoBloqueado) return;
    turnoBloqueado = true;
    let ataque = miPokemon.ataques[indiceAtk];
    
    // 1. Verificación de Paralización
    if (miPokemon.estado === 'PARALIZADO' && Math.random() < 0.25) {
        document.getElementById('battleText').innerText = `¡${miPokemon.nombre} está paralizado y no se puede mover!`;
        playTone(150, 'sine', 0.3);
        setTimeout(procesarFinDeTurnoJugador, 1500);
        return;
    }

    // 2. Consumo de PP
    ataque.pp--;
    document.getElementById('battleText').innerText = `¡${miPokemon.nombre} usó ${ataque.n}!`;
    playTone(440, 'sawtooth', 0.2);

    setTimeout(() => {
        // 3. Cálculo de Efectividad de Tipo
        let mult = 1.0;
        if (TABLA_TIPOS[ataque.tipo] && TABLA_TIPOS[ataque.tipo][enemigoActual.tipo]) {
            mult = TABLA_TIPOS[ataque.tipo][enemigoActual.tipo];
        }

        // Aplicar daño elemental
        let danoFinal = Math.floor(ataque.d * mult);
        enemigoActual.hp = Math.max(0, enemigoActual.hp - danoFinal);

        // Chance de aplicar estado secundario (ej: Quemar con Fuego, Paralizar con Eléctrico)
        if (mult > 1.0 && enemigoActual.hp > 0 && enemigoActual.estado === 'OK') {
            if (ataque.tipo === 'FUEGO' && Math.random() < 0.4) {
                enemigoActual.estado = 'QUEMADO';
                setTimeout(() => { document.getElementById('battleText').innerText = `¡El ${enemigoActual.nombre} salvaje se ha quemado!`; }, 1000);
            }
            if (ataque.tipo === 'ELECTRICO' && Math.random() < 0.4) {
                enemigoActual.estado = 'PARALIZADO';
                setTimeout(() => { document.getElementById('battleText').innerText = `¡El ${enemigoActual.nombre} salvaje ha quedado paralizado!`; }, 1000);
            }
        }

        // Mostrar feedback visual de efectividad
        if (mult > 1.0) document.getElementById('battleText').innerText = "¡Es súper efectivo!";
        else if (mult < 1.0) document.getElementById('battleText').innerText = "No es muy efectivo...";

        setTimeout(() => {
            if (enemigoActual.hp <= 0) {
                procesarVictoria();
            } else {
                procesarFinDeTurnoJugador();
            }
        }, 1200);
    }, 1000);
}

// --- RESOLUCIÓN TÁCTICA DEL FIN DE TURNO ---
function procesarFinDeTurnoJugador() {
    // Aplicar daño por quemadura si corresponde
    if (enemigoActual.estado === 'QUEMADO') {
        let danoEntropia = Math.ceil(enemigoActual.hpMax * 0.1);
        enemigoActual.hp = Math.max(0, enemigoActual.hp - danoEntropia);
        document.getElementById('battleText').innerText = `¡El ${enemigoActual.nombre} salvaje sufre por la quemadura!`;
        playTone(180, 'sine', 0.2);
        
        setTimeout(() => {
            if (enemigoActual.hp <= 0) procesarVictoria();
            else turnoEnemigo();
        }, 1200);
    } else {
        turnoEnemigo();
    }
}

// --- TURNO DEL ENEMIGO CON INTELIGENCIA ELEMENTAL Y ESTADOS ---
function turnoEnemigo() {
    // 1. Verificación de Paralización Enemiga
    if (enemigoActual.estado === 'PARALIZADO' && Math.random() < 0.25) {
        document.getElementById('battleText').innerText = `¡El ${enemigoActual.nombre} salvaje está paralizado y no puede atacar!`;
        playTone(150, 'sine', 0.3);
        setTimeout(procesarFinDeTurnoEnemigo, 1500);
        return;
    }

    let atkEnemigo = enemigoActual.ataques[Math.floor(Math.random() * enemigoActual.ataques.length)];
    document.getElementById('battleText').innerText = `¡${enemigoActual.nombre} salvaje usó ${atkEnemigo.n}!`;
    playTone(220, 'sine', 0.25);

    setTimeout(() => {
        let mult = 1.0;
        if (TABLA_TIPOS[atkEnemigo.tipo] && TABLA_TIPOS[atkEnemigo.tipo][miPokemon.tipo]) {
            mult = TABLA_TIPOS[atkEnemigo.tipo][miPokemon.tipo];
        }

        let danoFinal = Math.floor(atkEnemigo.d * mult);
        miPokemon.hp = Math.max(0, miPokemon.hp - danoFinal);

        if (mult > 1.0) document.getElementById('battleText').innerText = "¡Es súper efectivo!";
        else if (mult < 1.0) document.getElementById('battleText').innerText = "No es muy efectivo...";

        setTimeout(() => {
            if(miPokemon.hp <= 0) {
                procesarDerrota();
            } else {
                procesarFinDeTurnoEnemigo();
            }
        }, 1200);
    }, 1200);
}

function procesarFinDeTurnoEnemigo() {
    if (miPokemon.estado === 'QUEMADO') {
        let danoEntropia = Math.ceil(miPokemon.hpMax * 0.1);
        miPokemon.hp = Math.max(0, miPokemon.hp - danoEntropia);
        document.getElementById('battleText').innerText = `¡${miPokemon.nombre} sufre por la quemadura!`;
        playTone(180, 'sine', 0.2);
        
        setTimeout(() => {
            if (miPokemon.hp <= 0) procesarDerrota();
            else {
                document.getElementById('battleText').innerText = `¿Qué debe hacer ${miPokemon.nombre}?`;
                turnoBloqueado = false; cerrarAtaques();
            }
        }, 1200);
    } else {
        document.getElementById('battleText').innerText = `¿Qué debe hacer ${miPokemon.nombre}?`;
        turnoBloqueado = false; cerrarAtaques();
    }
}

// --- AUXILIARES REFACTORIZADOS DE FIN DE COMBATE ---
function procesarVictoria() {
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
}

function procesarDerrota() {
    document.getElementById('battleText').innerText = `¡Tu ${miPokemon.nombre} se debilitó! Volviendo a zona segura...`;
    setTimeout(() => {
        // Al debilitarse, limpiamos también el estado alterado
        equipo.forEach(p => { p.hp = p.hpMax; p.estado = 'OK'; });
        mapaActual = 'exterior';
        jugador.x = 2 * TILE_SIZE; jugador.y = 2 * TILE_SIZE; 
        finalizarBatalla();
    }, 2500);
}

function abrirMenuPokemon() {
    if(turnoBloqueado) return;
    document.getElementById('menuOpciones').style.display = 'none';
    document.getElementById('menuPokemon').style.display = 'grid';
    document.getElementById('battleText').innerText = "Selecciona un Pokémon para combatir:";

    for(let i = 0; i < 6; i++) {
        let btn = document.getElementById(`btnPkmn${i}`);
        if (!btn) continue;
        let pkmn = equipo[i];

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
    let pokemonSeleccionado = equipo[indice];
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
    let indexActual = equipo.indexOf(miPokemon);
    miPokemon = equipo[(indexActual + 1) % equipo.length];
    document.getElementById('battleText').innerText = `¡Adelante ${miPokemon.nombre}!`;
    playTone(400, 'square', 0.1);
    cerrarAtaques();
}

function cerrarMenuPokemon() {
    document.getElementById('menuPokemon').style.display = 'none';
    document.getElementById('menuOpciones').style.display = 'grid';
    document.getElementById('battleText').innerText = `¿Qué debe hacer ${miPokemon.nombre}?`;
}

function abrirInventario() {
    if(turnoBloqueado) return;
    document.getElementById('menuOpciones').style.display = 'none';
    document.getElementById('menuInventario').style.display = 'grid';
    document.getElementById('btnPocion').innerText = `Poción (x${inventario.pociones})`;
    document.getElementById('btnBola').innerText = `Bola (x${inventario.bolas})`;
    document.getElementById('battleText').innerText = "¿Qué objeto quieres usar?";
}

function cerrarInventario() {
    document.getElementById('menuInventario').style.display = 'none';
    document.getElementById('menuOpciones').style.display = 'grid';
    document.getElementById('battleText').innerText = `¿Qué debe hacer ${miPokemon.nombre}?`;
}

function usarPocion() {
    if (inventario.pociones <= 0) {
        document.getElementById('battleText').innerText = "¡No te quedan Pociones!";
        return;
    }
    if (miPokemon.hp === miPokemon.hpMax) {
        document.getElementById('battleText').innerText = `¡La salud de ${miPokemon.nombre} ya está al máximo!`;
        return;
    }

    inventario.pociones--;
    turnoBloqueado = true;
    cerrarInventario();
    
    miPokemon.hp = Math.min(miPokemon.hpMax, miPokemon.hp + 25);
    document.getElementById('battleText').innerText = `¡Usaste una Poción! ${miPokemon.nombre} recuperó 25 PS.`;
    playTone(550, 'sine', 0.1);
    setTimeout(turnoEnemigo, 1500);
}

function usarBola() {
    if (inventario.bolas <= 0) {
        document.getElementById('battleText').innerText = "¡No te quedan Bolas!";
        return;
    }

    inventario.bolas--;
    turnoBloqueado = true;
    animacionCaptura = true;
    cerrarInventario();
    
    document.getElementById('battleText').innerText = `¡Lanzaste una Bola!`;
    playTone(350, 'triangle', 0.2);
    setTimeout(() => calcularCaptura(), 1200);
}

function calcularCaptura() {
    let probBase = 0.3; 
    let ratioSalud = enemigoActual.hp / enemigoActual.hpMax;
    let probFinal = probBase + ((1 - ratioSalud) * 0.5); 
    ejecutarTemblores(0, probFinal);
}

function ejecutarTemblores(fase, probFinal) {
    if (fase < 3) {
        document.getElementById('battleText').innerText = "...";
        playTone(120, 'sawtooth', 0.1);

        let tirada = Math.random();
        if (tirada > probFinal + 0.15) {
            setTimeout(() => {
                animacionCaptura = false;
                document.getElementById('battleText').innerText = "¡Oh no! ¡El Pokémon se escapó!";
                playTone(150, 'square', 0.4);
                setTimeout(turnoEnemigo, 1500);
            }, 1000);
            return;
        }
        setTimeout(() => ejecutarTemblores(fase + 1, probFinal), 1000);
        
    } else {
        document.getElementById('battleText').innerText = `¡Genial! ¡${enemigoActual.nombre} fue capturado!`;
        playTone(600, 'square', 0.1);
        setTimeout(() => playTone(800, 'square', 0.2), 150);
        setTimeout(() => playTone(1000, 'square', 0.4), 300);

        let nuevoAmigo = JSON.parse(JSON.stringify(enemigoActual));
        nuevoAmigo.hp = nuevoAmigo.hpMax;
        nuevoAmigo.exp = 0;
        
        especiesAvistadas[nuevoAmigo.nombre] = true;

        if (equipo.length < 6) {
            equipo.push(nuevoAmigo);
            setTimeout(() => {
                document.getElementById('battleText').innerText = `¡${enemigoActual.nombre} se unió a tu EQUIPO!`;
            }, 1500);
        } else {
            caja.push(nuevoAmigo);
            setTimeout(() => {
                document.getElementById('battleText').innerText = `¡Equipo lleno! ${enemigoActual.nombre} fue enviado a la CAJA.`;
            }, 1500);
        }
    
        setTimeout(() => {
            animacionCaptura = false;
            finalizarBatalla();
        }, 3500);
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

// ============================================================================
// 7. SISTEMA DE GESTIÓN DE MENÚ DE PAUSA (SUBPANELES HTML)
// ============================================================================
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

function construirPokedexUI() {
    const contenedor = document.getElementById('listaPokedex');
    contenedor.innerHTML = '';
    
    ESPECIES_POKEDEX.forEach((nombre, index) => {
        let numero = String(index + 1).padStart(3, '0');
        let capturado = especiesAvistadas[nombre];
        contenedor.innerHTML += `
            <div class="fila-registro">
                <span>Nº${numero} ${capturado ? nombre.toUpperCase() : '----------'}</span>
                <span style="color: ${capturado ? '#4caf50' : '#ccc'}">${capturado ? '✓ ATTRAP' : '???'}</span>
            </div>`;
    });
}

function construirEquipoUI() {
    const conEquipo = document.getElementById('listaEquipoPausa');
    const conCaja = document.getElementById('listaCajaPausa');
    conEquipo.innerHTML = ''; conCaja.innerHTML = '';

    equipo.forEach((pkmn) => {
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

function construirMochilaUI() {
    const contenedor = document.getElementById('listaMochilaPausa');
    contenedor.innerHTML = '';
    let totalItems = 0;

    for (let objeto in inventario) {
        if (inventario[objeto] >= 1) {
            totalItems++;
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
        </div>`;
}

function alternarMusica() {
    musicaEncendida = !musicaEncendida;
    if (musicaEncendida) reproducirMusica();
    else clearInterval(bjpInterval);
    construirOpcionesUI();
    playTone(450, 'sine', 0.05);
}

function pausaConfirmarGuardar() {
    try {
        const salvado = {
            jugadorX: jugador.x, jugadorY: jugador.y,
            mapa: mapaActual, inventario: inventario,
            equipo: equipo, caja: caja,
            especiesAvistadas: especiesAvistadas,
            musicaEncendida: musicaEncendida
        };
        localStorage.setItem('pokemon_pro_save', JSON.stringify(salvado));
        playTone(600, 'square', 0.08);
        setTimeout(() => playTone(800, 'square', 0.15), 80);
        document.getElementById('txtGuardar').innerText = "¡Partida guardada con éxito!";
    } catch(e) {
        document.getElementById('txtGuardar').innerText = "Error al acceder a la memoria.";
    }
}

// ============================================================================
// 8. CAPTURA Y ASIGNACIÓN UNIFICADA DE EVENTOS (TECLADO Y PANTALLAS TÁCTILES)
// ============================================================================
window.addEventListener('keydown', e => { 
    teclas[e.key] = true; 
    audioCtx.resume(); 

    if (e.key === ' ' || e.key === 'Spacebar') {
        if (modo === 'exploracion' || modo === 'pausa') {
            e.preventDefault();
            alternarMenuPausa();
        }
    }

    if (e.key === 'Escape' || e.key.toLowerCase() === 'b') {
        if (modo === 'pausa') {
            let algunoAbierto = false;
            ['panelPokedex', 'panelEquipo', 'panelMochila', 'panelGuardar', 'panelOpciones'].forEach(p => {
                if(document.getElementById(p).style.display === 'flex') algunoAbierto = true;
            });
            if (algunoAbierto) regresarAlMenuPausa();
            else cerrarMenuPausa();
        }
    }
    
    if (e.key.toLowerCase() === 'a' || e.key === 'Enter') {
		if (modo === 'exploracion') intentarInteractuar();
		else if (modo === 'dialogo') avanzarDialogo();
	}
    
    if ((e.key.toLowerCase() === 'b' || e.key === 'Escape') && modo === 'ordenador') {
        cerrarMenuOrdenador();
    }
});

window.addEventListener('keyup', e => teclas[e.key] = false);

const mapeoMovimiento = [
    { id: 'btnVUp', tecla: 'ArrowUp' },
    { id: 'btnVDown', tecla: 'ArrowDown' },
    { id: 'btnVLeft', tecla: 'ArrowLeft' },
    { id: 'btnVRight', tecla: 'ArrowRight' }
];

mapeoMovimiento.forEach(control => {
    const boton = document.getElementById(control.id);
    if(boton) {
        boton.addEventListener('touchstart', (e) => {
            e.preventDefault(); audioCtx.resume();
            teclas[control.tecla] = true;
        });
        boton.addEventListener('touchend', (e) => {
            e.preventDefault();
            teclas[control.tecla] = false;
        });
    }
});

if(document.getElementById('btnVA')) {
    document.getElementById('btnVA').addEventListener('touchstart', (e) => {
        e.preventDefault(); audioCtx.resume();
        playTone(400, 'sine', 0.05);
        
        if (modo === 'exploracion') intentarInteractuar();
        else if (modo === 'dialogo') avanzarDialogo();
    });
}

if(document.getElementById('btnVB')) {
    document.getElementById('btnVB').addEventListener('touchstart', (e) => {
        e.preventDefault(); audioCtx.resume();
        if (modo === 'ordenador') { cerrarMenuOrdenador(); return; }
        if (modo === 'pausa') {
            let algunoAbierto = false;
            ['panelPokedex', 'panelEquipo', 'panelMochila', 'panelGuardar', 'panelOpciones'].forEach(p => {
                if(document.getElementById(p).style.display === 'flex') algunoAbierto = true;
            });
            if (algunoAbierto) regresarAlMenuPausa();
            else cerrarMenuPausa();
            return;
        }
        if(modo === 'batalla' && !turnoBloqueado) {
            playTone(250, 'sine', 0.05);
            cerrarAtaques(); cerrarInventario(); cerrarMenuPokemon();
        }
    });
}

if(document.getElementById('btnVStart')) {
    document.getElementById('btnVStart').addEventListener('touchstart', (e) => {
        e.preventDefault(); audioCtx.resume();
        if (modo === 'exploracion' || modo === 'pausa') alternarMenuPausa();
    });
}

if(document.getElementById('btnVSelect')) {
    document.getElementById('btnVSelect').addEventListener('touchstart', (e) => {
        e.preventDefault(); playTone(450, 'triangle', 0.08);
    });
}

// ============================================================================
// 9. BUCLE CENTRAL DEL JUEGO E INICIALIZACIÓN
// ============================================================================
function loop() {
    actualizarMovimiento();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (modo === 'exploracion' || modo === 'pausa' || modo === 'ordenador' || modo === 'dialogo') {
        let mapa = MAPAS[mapaActual];
        for (let r = 0; r < mapa.length; r++) {
            for (let c = 0; c < mapa[r].length; c++) {
                let id = mapa[r][c];
                let img = assets[id] || assets[02];
                ctx.drawImage(img, c * TILE_SIZE, r * TILE_SIZE);
            }
        }
        let spriteElegido = assets.player;
        if (jugador.estadoEstilo === 'surf') spriteElegido = assets.playerSurf;
        if (jugador.estadoEstilo === 'hielo') spriteElegido = assets.playerHielo;
        
		// Renderizado dinámico de NPCs del mapa activo
		let npcsMapa = NPCS[mapaActual] || [];
		npcsMapa.forEach(npc => {
			// Dibujamos cabeza
			ctx.fillStyle = npc.colCabeza; 
			ctx.fillRect(npc.gridX * TILE_SIZE + 8, npc.gridY * TILE_SIZE + 4, 16, 12); 
			// Dibujamos cuerpo
			ctx.fillStyle = npc.colCuerpo; 
			ctx.fillRect(npc.gridX * TILE_SIZE + 6, npc.gridY * TILE_SIZE + 16, 20, 14); 
			// Dibujamos ojos negros clásicos
			ctx.fillStyle = '#000'; 
			ctx.fillRect(npc.gridX * TILE_SIZE + 10, npc.gridY * TILE_SIZE + 8, 3, 3); 
			ctx.fillRect(npc.gridX * TILE_SIZE + 19, npc.gridY * TILE_SIZE + 8, 3, 3);
		});

        ctx.drawImage(spriteElegido, jugador.x, jugador.y);

    } else if (modo === 'batalla') {
        ctx.fillStyle = '#f5f5f5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.ellipse(120, 220, 80, 20, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(380, 110, 80, 20, 0, 0, Math.PI*2); ctx.fill();
        ctx.drawImage(assets.pkmnJugador, 80, 150);
        
        if (animacionCaptura) {
            let bx = 372; let by = 72;
            ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(bx, by, 16, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI); ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = '#000';
            ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bx - 16, by); ctx.lineTo(bx + 16, by); ctx.stroke();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.drawImage(assets.pkmnEnemigo, 340, 40);
        }

        ctx.fillStyle = '#000'; ctx.font = 'bold 14px Courier New';
        ctx.fillText(`${enemigoActual.nombre.toUpperCase()} Nvl:${enemigoActual.nivel}`, 40, 45);
        ctx.fillStyle = '#ddd'; ctx.fillRect(40, 55, 120, 6);
        ctx.fillStyle = '#4caf50'; ctx.fillRect(40, 55, 120 * (enemigoActual.hp / enemigoActual.hpMax), 6);

        ctx.fillStyle = '#000';
        ctx.fillText(`${miPokemon.nombre.toUpperCase()} Nvl:${miPokemon.nivel}`, 300, 165);
        ctx.fillStyle = '#ddd'; ctx.fillRect(300, 175, 120, 6);
        ctx.fillStyle = '#4caf50'; ctx.fillRect(300, 175, 120 * (miPokemon.hp / miPokemon.hpMax), 6);
        ctx.fillText(`HP: ${miPokemon.hp}/${miPokemon.hpMax}`, 300, 195);
		
		// HUD Enemigo: Dibujar Estado si no está OK
		ctx.fillStyle = '#000'; ctx.font = 'bold 14px Courier New';
		let txtEnemigo = `${enemigoActual.nombre.toUpperCase()} Nvl:${enemigoActual.nivel}`;
		if(enemigoActual.estado !== 'OK') txtEnemigo += ` [${enemigoActual.estado.substring(0,3)}]`;
		ctx.fillText(txtEnemigo, 40, 45);

		// HUD Jugador: Dibujar Estado si no está OK
		ctx.fillStyle = '#000';
		let txtJugador = `${miPokemon.nombre.toUpperCase()} Nvl:${miPokemon.nivel}`;
		if(miPokemon.estado !== 'OK') txtJugador += ` [${miPokemon.estado.substring(0,3)}]`;
		ctx.fillText(txtJugador, 300, 165);
    }
    requestAnimationFrame(loop);
}

// Bloque de carga de persistencia desde LocalStorage
const partidaExistente = localStorage.getItem('pokemon_pro_save');
if (partidaExistente) {
    const datos = JSON.parse(partidaExistente);
    jugador.x = datos.jugadorX;
    jugador.y = datos.jugadorY;
    mapaActual = datos.mapa;
    inventario = datos.inventario;
    especiesAvistadas = datos.especiesAvistadas || { 'Charmander': true };
    
    equipo.length = 0;
    datos.equipo.forEach(p => equipo.push(p));
    
    caja.length = 0;
    if(datos.caja) datos.caja.forEach(p => caja.push(p));
    
    miPokemon = equipo[0];
    if (datos.musicaEncendida !== undefined) musicaEncendida = datos.musicaEncendida;
    console.log("¡Partida cargada con éxito!");
}

// Lanzamiento inicial de subprocesos
reproducirMusica('exploracion');
loop();