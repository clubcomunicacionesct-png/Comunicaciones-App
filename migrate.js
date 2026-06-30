import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pdgbpjdhxfbpyxisbdmx.supabase.co'
const SUPABASE_KEY = 'sb_publishable_5xL_AGGbjQEcZ36fK_fGQQ_TKrOo8ur'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function parseFecha(str) {
  if (!str || str.trim() === '') return null
  // formato d/m/yyyy o dd/mm/yyyy
  const parts = str.trim().split('/')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  const year = parseInt(y)
  // Si el año es 2026 y el día es 1-9 probablemente sea fecha de ingreso sin nacimiento real
  if (year >= 2026) return null
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
}

function parseFechaPartido(str) {
  if (!str || str.trim() === '') return null
  const parts = str.trim().split('/')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
}

function parseAltura(str) {
  if (!str || str.trim() === '') return null
  // puede venir como "1,75" o "1.90"
  const val = parseFloat(str.replace(',', '.'))
  if (isNaN(val)) return null
  // si viene como 1.75 (metros) guardarlo en cm
  if (val < 3) return val * 100
  return val
}

function parsePeso(str) {
  if (!str || str.trim() === '') return null
  const val = parseFloat(str.replace(',', '.'))
  return isNaN(val) ? null : val
}

function mapPosicion(pos) {
  if (!pos) return 'Mediocampista'
  const p = pos.toLowerCase()
  if (p.includes('arquero') || p.includes('goalkeeper')) return 'Arquero'
  if (p.includes('central') || p.includes('defensor')) return 'Defensor'
  if (p.includes('lateral')) return 'Lateral'
  if (p.includes('volante') || p.includes('medio')) return 'Mediocampista'
  if (p.includes('extremo')) return 'Extremo'
  if (p.includes('delantero') || p.includes('atacante')) return 'Delantero'
  return 'Mediocampista'
}

function mapCondicion(str) {
  if (!str) return 'Local'
  const s = str.toLowerCase()
  if (s.includes('visit') || s === 'visitante') return 'Visitante'
  return 'Local'
}

function mapTurno(str) {
  if (!str || str.trim() === '') return 'Mañana'
  const s = str.trim().toLowerCase()
  if (s === 'tarde') return 'Tarde'
  return 'Mañana'
}

function mapTipoSesion(tipo) {
  if (!tipo) return 'ABP'
  const t = tipo.toLowerCase()
  if (t.includes('abp') || t.includes('balon parado')) return 'ABP'
  if (t.includes('movilidad articular') || t.includes('activacion movilidad')) return 'Activación Movilidad Articular'
  if (t.includes('pre partido') || t.includes('activacion pre')) return 'Activación Pre Partido'
  if (t.includes('bloque ofensivo') || t.includes('ofensivo')) return 'Bloque Ofensivo'
  if (t.includes('bloque defensivo') || t.includes('defensivo')) return 'Bloque Defensivo'
  if (t.includes('partido entrenamiento') || t.includes('futbol formal') || t.includes('futbol tactico') || t.includes('amistoso')) return 'Partido Entrenamiento'
  if (t.includes('fisico') || t.includes('fuerza') || t.includes('frz') || t.includes('intermitente') || t.includes('aerobico') || t.includes('velocidad')) return 'Físico'
  if (t.includes('tecnica individual') || t.includes('técnica')) return 'Técnica Individual'
  if (t.includes('recuperacion') || t.includes('regenerativo')) return 'Recuperación'
  return 'ABP'
}

function parseGoles(str) {
  if (!str || str.trim() === '') return null
  const n = parseInt(str)
  return isNaN(n) ? null : n
}

// JUGADORES
const jugadoresRaw = [
  {nombre:'Ivo',apellido:'Cabrera',fn:'28/9/2001',alt:'1,75',peso:'79.1',pos:'Lateral'},
  {nombre:'Renzo',apellido:'Compagnucci',fn:'17/6/2004',alt:'1,79',peso:'76.4',pos:'Defensor'},
  {nombre:'Felipe',apellido:'Di Lena',fn:'8/5/2001',alt:'1,79',peso:'76.5',pos:'Lateral'},
  {nombre:'Gonzalo',apellido:'Zabala',fn:'21/5/1996',alt:'1,86',peso:'94',pos:'Defensor'},
  {nombre:'Tomas',apellido:'Friesel',fn:'28/3/2002',alt:'1,75',peso:'74.5',pos:'Mediocampista'},
  {nombre:'Facundo',apellido:'Fabello',fn:'15/6/1989',alt:'1,81',peso:'82.5',pos:'Mediocampista'},
  {nombre:'Sebastian',apellido:'Gallo',fn:'24/3/2003',alt:'1,75',peso:'71.2',pos:'Mediocampista'},
  {nombre:'Joaquin',apellido:'Ibañez',fn:'18/7/1995',alt:'1,70',peso:'70.8',pos:'Mediocampista'},
  {nombre:'Nicolás',apellido:'Ruiz',fn:'16/8/2005',alt:'1,79',peso:'73.5',pos:'Mediocampista'},
  {nombre:'Conrado',apellido:'Pugdellivol',fn:'11/4/2001',alt:'1,75',peso:'72.2',pos:'Mediocampista'},
  {nombre:'Sebastian',apellido:'Carruega',fn:'1/9/1996',alt:'1,70',peso:'69.8',pos:'Extremo'},
  {nombre:'Joaquín',apellido:'Barroso',fn:'3/5/2007',alt:'1,82',peso:'77.8',pos:'Delantero'},
  {nombre:'Maximiliano',apellido:'Bambrillo',fn:'20/12/1996',alt:'1,73',peso:'69',pos:'Delantero'},
  {nombre:'Sergio',apellido:'Sosa',fn:'15/3/1994',alt:'1,78',peso:'89.1',pos:'Delantero'},
  {nombre:'Gabriel',apellido:'Gonzalez',fn:null,alt:null,peso:'75.3',pos:'Extremo'},
  {nombre:'David',apellido:'Ledesma',fn:null,alt:null,peso:'76.3',pos:'Defensor'},
  {nombre:'Jeremias',apellido:'Hendeireich',fn:null,alt:null,peso:null,pos:'Delantero'},
  {nombre:'Luciano',apellido:'Britez',fn:null,alt:null,peso:'80',pos:'Lateral'},
  {nombre:'Ezequiel',apellido:'Bacher',fn:null,alt:'1.90',peso:'76.9',pos:'Arquero'},
  {nombre:'Thiago',apellido:'Rolon',fn:null,alt:null,peso:'63.7',pos:'Mediocampista'},
  {nombre:'Gonzalo',apellido:'Jaque',fn:null,alt:null,peso:'71.3',pos:'Lateral'},
  {nombre:'Francisco',apellido:'Mattia',fn:null,alt:null,peso:'90.5',pos:'Defensor'},
  {nombre:'Ezequiel',apellido:'Ramirez',fn:null,alt:null,peso:'68.2',pos:'Extremo'},
  {nombre:'Valentin',apellido:'Quevedo',fn:null,alt:null,peso:'63.3',pos:'Delantero'},
  {nombre:'Tomas',apellido:'Rozic',fn:null,alt:null,peso:'80.6',pos:'Delantero'},
  {nombre:'German',apellido:'Yacaruso',fn:null,alt:null,peso:'82.5',pos:'Arquero'},
  {nombre:'Cristian',apellido:'Vazquez',fn:null,alt:null,peso:'67.4',pos:'Mediocampista'},
  {nombre:'Julian',apellido:'Lagos',fn:null,alt:null,peso:null,pos:'Arquero'},
  {nombre:'Pablo',apellido:'Ruiz',fn:null,alt:null,peso:null,pos:'Mediocampista'},
]

// PARTIDOS
const partidosRaw = [
  {fecha:'16/2/2026',rival:'Argentino (M)',condicion:'Local',torneo:'Primera B Metro',nro:1,gc:'1',gr:null},
  {fecha:'21/2/2026',rival:'Arsenal',condicion:'Visitante',torneo:'Primera B Metro',nro:2,gc:null,gr:'2'},
  {fecha:'28/2/2026',rival:'Excursionistas',condicion:'Local',torneo:'Primera B Metro',nro:3,gc:'1',gr:'1'},
  {fecha:'4/3/2026',rival:'Villa Dalmine',condicion:'Visitante',torneo:'Primera B Metro',nro:4,gc:null,gr:null},
  {fecha:'15/3/2026',rival:'Real Pilar',condicion:'Visitante',torneo:'Primera B Metro',nro:6,gc:null,gr:'2'},
  {fecha:'23/3/2026',rival:'Liniers',condicion:'Local',torneo:'Primera B Metro',nro:7,gc:'2',gr:null},
  {fecha:'28/3/2026',rival:'Villa San Carlos',condicion:'Visitante',torneo:'Primera B Metro',nro:8,gc:'1',gr:null},
  {fecha:'5/4/2026',rival:'San Martin (Bzco)',condicion:'Local',torneo:'Primera B Metro',nro:9,gc:null,gr:'1'},
  {fecha:'11/4/2026',rival:'Sportivo Italiano',condicion:'Visitante',torneo:'Primera B Metro',nro:10,gc:'1',gr:'1'},
  {fecha:'16/4/2026',rival:'Camioneros',condicion:'Local',torneo:'Primera B Metro',nro:11,gc:'1',gr:'2'},
  {fecha:'21/4/2026',rival:'Deportivo Merlo',condicion:'Visitante',torneo:'Primera B Metro',nro:12,gc:null,gr:'2'},
]

// SESIONES (muestra representativa — las más completas)
const sesionesRaw = [
  {fecha:'5/1/2026',dia:'LUNES',turno:'Mañana',tipo:'FUERZA EN GIMNASIO',desc:'Circuito de fuerza estructural',jug:null,bloques:1,tpb:15,tt:15,metros:null,video:'https://youtu.be/JZznsNYprkU'},
  {fecha:'6/1/2026',dia:'MARTES',turno:'Mañana',tipo:'REDUCIDO',desc:'Reducido 8vs8 c/ 8 apoyos',jug:24,bloques:3,tpb:8,tt:24,metros:null,video:'https://www.youtube.com/watch?v=N4j7OrqUi-I'},
  {fecha:'9/1/2026',dia:'VIERNES',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Circuito de coord y velocidad',jug:30,bloques:1,tpb:20,tt:20,metros:null,video:'https://youtu.be/o2UJLs-AaNA'},
  {fecha:'12/1/2026',dia:'LUNES',turno:'Mañana',tipo:'ACTIVACION MOVILIDAD ARTICULAR',desc:'Activación movilidad articular',jug:33,bloques:null,tpb:null,tt:null,metros:null,video:'https://youtu.be/-MZfS9gySg8'},
  {fecha:'16/1/2026',dia:'VIERNES',turno:'Tarde',tipo:'FUTBOL FORMAL',desc:'1er Bloque vs Ayacucho',jug:null,bloques:null,tpb:null,tt:30,metros:null,video:'https://youtu.be/3aym-Xs1lkw'},
  {fecha:'20/1/2026',dia:'MARTES',turno:'Mañana',tipo:'FUERZA EN GIMNASIO',desc:'10 Estaciones de Fuerza',jug:35,bloques:null,tpb:null,tt:null,metros:null,video:'https://youtu.be/5NTy23qG6eI'},
  {fecha:'23/1/2026',dia:'VIERNES',turno:'Mañana',tipo:'ABP',desc:'ABP',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:'https://youtu.be/jpDpd-l6S8k'},
  {fecha:'30/1/2026',dia:'VIERNES',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Circuito de 4 estaciones',jug:25,bloques:1,tpb:10,tt:10,metros:10,video:'https://youtu.be/LeyJbybh7Dgv'},
  {fecha:'3/2/2026',dia:'MARTES',turno:'Mañana',tipo:'FUERZA EN GIMNASIO',desc:'Circuito de 10 estaciones',jug:30,bloques:3,tpb:10,tt:30,metros:null,video:null},
  {fecha:'4/2/2026',dia:'MIÉRCOLES',turno:'Mañana',tipo:'FUTBOL FORMAL',desc:'Amistoso 2x45min vs Central Ballester',jug:22,bloques:2,tpb:45,tt:90,metros:null,video:null},
  {fecha:'16/2/2026',dia:'DOMINGO',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Activación pre partido',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:null},
  {fecha:'20/2/2026',dia:'VIERNES',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Circuito de 4 estaciones de activacion pre partido',jug:26,bloques:1,tpb:15,tt:15,metros:10,video:'https://youtu.be/-vknucmgNVI'},
  {fecha:'27/2/2026',dia:'VIERNES',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'coord-plio-velocidad',jug:30,bloques:1,tpb:15,tt:15,metros:null,video:'https://youtu.be/q0PUD0MS-jE'},
  {fecha:'3/3/2026',dia:'MARTES',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'4 estaciones',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:null},
  {fecha:'14/3/2026',dia:'SÁBADO',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Circuito de 4 estaciones de activacion pre partido',jug:28,bloques:1,tpb:10,tt:10,metros:10,video:null},
  {fecha:'22/3/2026',dia:'DOMINGO',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'4 estaciones coor-plio-vel',jug:30,bloques:1,tpb:20,tt:20,metros:null,video:'https://youtu.be/nPAFMw8oHnM'},
  {fecha:'4/4/2026',dia:'SÁBADO',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'4 estaciones de coord + tec individual c/pelota + vel 10mts',jug:30,bloques:1,tpb:15,tt:15,metros:null,video:'https://youtu.be/VOkFxxZex_w'},
  {fecha:'15/4/2026',dia:'MIÉRCOLES',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Activación pre partido',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:null},
  {fecha:'20/4/2026',dia:'LUNES',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Activación pre partido',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:null},
  {fecha:'3/5/2026',dia:'DOMINGO',turno:'Mañana',tipo:'ACTIVACION PRE PARTIDO',desc:'Activación pre partido',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:null},
  {fecha:'1/6/2026',dia:'LUNES',turno:'Mañana',tipo:'ACTIVACION MOVILIDAD ARTICULAR',desc:'EEC',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:'https://youtu.be/39eXh_tHpug'},
  {fecha:'2/6/2026',dia:'MARTES',turno:'Mañana',tipo:'FUERZA EN GIMNASIO',desc:'Fuerza en gimnasio',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:null},
  {fecha:'3/6/2026',dia:'MIÉRCOLES',turno:'Mañana',tipo:'PARTIDO ENTRENAMIENTO',desc:'Fútbol formal',jug:null,bloques:null,tpb:null,tt:null,metros:null,video:'https://youtu.be/SiD2LbjqB8A'},
]

async function migrar() {
  console.log('🚀 Iniciando migración...\n')

  // 1. JUGADORES
  console.log('👥 Migrando jugadores...')
  const jugadoresData = jugadoresRaw.map(j => ({
    nombre: j.nombre,
    apellido: j.apellido,
    fecha_nacimiento: j.fn ? parseFecha(j.fn) : null,
    altura: j.alt ? parseAltura(j.alt) : null,
    peso: j.peso ? parsePeso(j.peso) : null,
    posicion: mapPosicion(j.pos),
    orden: null,
  }))

  const { data: jugInserted, error: jugError } = await supabase
    .from('jugadores')
    .insert(jugadoresData)
    .select()

  if (jugError) {
    console.error('❌ Error jugadores:', jugError.message)
  } else {
    console.log(`✅ ${jugInserted.length} jugadores migrados`)
  }

  // 2. PARTIDOS
  console.log('\n⚽ Migrando partidos...')
  const partidosData = partidosRaw.map(p => ({
    fecha: parseFechaPartido(p.fecha),
    rival: p.rival,
    condicion: mapCondicion(p.condicion),
    torneo: p.torneo,
    nro_fecha: p.nro || null,
    goles_comu: parseGoles(p.gc),
    goles_rival: parseGoles(p.gr),
  }))

  const { data: parInserted, error: parError } = await supabase
    .from('partidos')
    .insert(partidosData)
    .select()

  if (parError) {
    console.error('❌ Error partidos:', parError.message)
  } else {
    console.log(`✅ ${parInserted.length} partidos migrados`)
  }

  // 3. SESIONES
  console.log('\n📋 Migrando sesiones...')
  const sesionesData = sesionesRaw.map(s => ({
    fecha: parseFechaPartido(s.fecha),
    dia: s.dia,
    turno: mapTurno(s.turno),
    tipo: mapTipoSesion(s.tipo),
    descripcion: s.desc || null,
    cantidad_jugadores: s.jug || null,
    bloques: s.bloques || null,
    tiempo_por_bloque: s.tpb || null,
    tiempo_total: s.tt || null,
    metros: s.metros || null,
    link_video: s.video || null,
  }))

  const { data: sesInserted, error: sesError } = await supabase
    .from('sesiones')
    .insert(sesionesData)
    .select()

  if (sesError) {
    console.error('❌ Error sesiones:', sesError.message)
  } else {
    console.log(`✅ ${sesInserted.length} sesiones migradas`)
  }

  console.log('\n🎉 Migración completada!')
}

migrar()
