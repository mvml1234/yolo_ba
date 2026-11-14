export const venueDirectory=[
{name:'Complejo Teatral · San Martín, Regio, Alvear, Sarmiento, Ribera y El Plata',url:'https://complejoteatral.gob.ar/',type:'Teatro'},
{name:'Paseo La Plaza',url:'https://www.paseolaplaza.com.ar/obras',type:'Teatro'},
{name:'Multiteatro y Multitabarís',url:'https://www.multiteatro.com.ar/programas/',type:'Teatro'},
{name:'Teatro Nacional Cervantes',url:'https://www.teatrocervantes.gob.ar/cartelera/',type:'Teatro'},
{name:'Teatro Avenida',url:'https://teatroavenida.com/cartelera-entradas/',type:'Teatro'},
{name:'Teatro Colón',url:'https://teatrocolon.org.ar/',type:'Teatro'},
{name:'Teatro Gran Rex',url:'https://teatro-granrex.com.ar/',type:'Shows'},
{name:'Movistar Arena',url:'https://www.movistararena.com.ar/',type:'Shows'},
{name:'Estadio Obras',url:'https://estadioobras.com.ar/',type:'Shows'},
{name:'Niceto Club, Humboldt y Bar',url:'https://nicetoclub.com/agenda',type:'Shows'},
{name:'La Trastienda',url:'https://www.latrastienda.com/',type:'Shows'}];
const plaza='https://www.paseolaplaza.com.ar/obras';
export const plazaSeeds=[
['Cecilia Ce · Encendé tu motor',47000,'Viernes','Charlas'],['El tiempo todo entero',51000,'20, 21 y 27 de noviembre de 2026','Drama'],['The Old Man & The Old Moon',45000,'Miércoles','Musical'],['Notworking · Nacho Navarrete',45000,'3 de noviembre de 2026','Comedia'],['El escritor de todas las cosas',62000,'Estreno enero de 2027 · viernes y sábados','Teatro contemporáneo'],['Con la nuestra',58000,'Jueves a domingos','Comedia'],['Nanutria · Opiniones varias',43000,'Jueves','Stand up'],['La desgracia',44000,'Martes','Musical'],['La profecía del albergue',42000,'5, 12 y 19 de noviembre de 2026','Comedia'],['Los Raviolis · Piyama Party',38000,'21 de noviembre de 2026','Infantil y familiar'],['Extremos',55000,'6 y 13 de enero de 2027','Teatro contemporáneo'],['Por el placer de volver a verla',62000,'Viernes a domingos','Drama'],['Lucas Lauriente',43000,'Sábados','Stand up'],['Dribbling',55000,'Miércoles','Teatro contemporáneo'],['Yipio · Patotera',44000,'7 de noviembre de 2026','Stand up'],['Julián Hernández · Tu cuerpo no miente',60000,'28 de noviembre de 2026','Charlas']
].map(([title,amount,schedule,genre])=>({id:plaza+'#'+encodeURIComponent(title),title,source:plaza,venue:'Paseo La Plaza',address:'Av. Corrientes 1660, CABA',scheduleText:schedule,genres:[genre],genreNote:'Clasificación editorial YOLO. Referencia de cartelera oficial consultada el 02/11/2026.',tariffs:[{label:'Desde · tarifa publicada 02/11/2026',amount,currency:'ARS'}],priceText:'Referencia pública; cargos y función a confirmar',availability:'unknown',bookingUrl:null,checkedAt:'2026-11-02T07:12:00Z',imageUrl:null,editorial:true}));
export const additionalTheatreSeeds=[
{title:'Santos Vega',source:'https://www.teatrocervantes.gob.ar/obra/santos-vega/',venue:'Teatro Nacional Cervantes · María Guerrero',address:'Libertad 815, CABA',scheduleText:'Jueves a domingos, 20 h · hasta 13/12/2026',endAt:'2026-12-13T23:59:59-03:00',genres:['Musical','Literatura en escena']},
{title:'El movimiento',source:'https://www.teatrocervantes.gob.ar/obra/el-movimiento/',venue:'Teatro Nacional Cervantes · Orestes Caviglia',address:'Libertad 815, CABA',scheduleText:'Jueves a domingos, 21 h · hasta 13/12/2026',endAt:'2026-12-13T23:59:59-03:00',genres:['Drama','Teatro contemporáneo']},
{title:'La verbena de la paloma',source:'https://teatroavenida.com/cartelera-entradas/',venue:'Teatro Avenida',address:'Av. de Mayo 1222, CABA',scheduleText:'Noviembre de 2026 · consultar función',endAt:'2026-11-30T23:59:59-03:00',genres:['Zarzuela','Musical']},
{title:'La Traviata',source:'https://teatroavenida.com/cartelera-entradas/',venue:'Teatro Avenida',address:'Av. de Mayo 1222, CABA',scheduleText:'7 y 13 de noviembre de 2026',endAt:'2026-11-13T23:59:59-03:00',genres:['Ópera']},
{title:'Zarzuela & flamenco',source:'https://teatroavenida.com/cartelera-entradas/',venue:'Teatro Avenida',address:'Av. de Mayo 1222, CABA',scheduleText:'14 de noviembre de 2026',endAt:'2026-11-14T23:59:59-03:00',genres:['Zarzuela','Danza']}
].map(e=>({...e,id:e.source+'#'+encodeURIComponent(e.title),genreNote:'Clasificación editorial YOLO sobre anuncio oficial consultado el 02/11/2026.',tariffs:[],priceText:'Consultar precio oficial',availability:'unknown',bookingUrl:null,imageUrl:null,editorial:true,checkedAt:'2026-11-02T07:15:00Z'}));
