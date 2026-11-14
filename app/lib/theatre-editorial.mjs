const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rules=[
 ['esperando a godot',['Drama','Comedia','Teatro del absurdo'],'La espera y el sinsentido articulan una tragicomedia del absurdo.'],
 ['ricardo iii',['Drama','Clásicos'],'Tragedia de Shakespeare sobre poder y ambición.'],
 ['paraiso perdido',['Danza'],'Propuesta del Ballet Contemporáneo del Teatro San Martín.'],
 ['a cielo abierto',['Drama'],'Conflictos afectivos y sociales en la pieza de David Hare.'],
 ['lluvia de fuego',['Drama','Literatura en escena'],'Universo literario de Silvina Ocampo y Juan José Hernández.'],
 ['oxitocina',['Drama','Teatro contemporáneo'],'Relato íntimo y vínculos en la obra de Dennis Smith.'],
 ['todos los angeles',['Drama','Teatro contemporáneo'],'Poética escénica de La Zaranda, con dimensión trágica y grotesca.'],
 ['remigio',['Infantil y familiar','Títeres'],'Producción del Grupo de Titiriteros para grandes y chicos.'],
 ['precipicio',['Drama'],'Vejez, muerte y herencia emocional desde dos generaciones de mujeres.'],
 ['cartas a mi hijo',['Drama','Literatura en escena'],'Memoria de García Lorca a través del vínculo con su madre.'],
 ['animal o la salida',['Drama','Literatura en escena'],'Adaptación de Informe para una academia, de Kafka.'],
 ['invasiones',['Musical'],'Ópera rock narrada a través de canciones de Charly García.'],
 ['buenas palabras',['Literatura en escena'],'Propuesta escénica de Arturo Puig y Rita Terranova.'],
 ['jazz',['Música en vivo'],'Programación de jazz en sala.'],['christian sands',['Música en vivo'],'Concierto de jazz.'],['milonga',['Danza','Música en vivo'],'Encuentro de tango y baile.'],
 ['la isla',['Exposiciones'],'Muestra documental sobre el teatro durante las dictaduras.'],['poesia de lo cotidiano',['Exposiciones'],'Exhibición fotográfica.'],['jorge lavelli',['Exposiciones'],'Muestra homenaje al director.'],
 ['borzage',['Cine'],'Ciclo de largometrajes.'],['huston',['Cine'],'Retrospectiva cinematográfica.'],['herzog',['Cine'],'Ciclo de la dupla Herzog y Kinski.'],['tren fluvial',['Cine'],'Proyección cinematográfica.'],['museo de la subversion',['Cine'],'Estreno cinematográfico.'],
 ['paraiso',['Drama','Teatro contemporáneo'],'Obra de Inmaculada Alvear en versión de Dany Mañas.']
];
export function editorialGenre(e){const title=clean(e.title);const match=rules.find(([key])=>title.includes(key));return {genres:match?.[1]||['Teatro contemporáneo'],genreNote:match?.[2]||'Clasificación amplia de YOLO; subgénero pendiente de revisión.',genreSource:'Clasificación editorial de YOLO'};}
