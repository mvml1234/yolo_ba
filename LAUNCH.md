# YOLO.BA — guía del piloto

## Qué está implementado

- Catálogo con 417 propuestas investigadas, ocho categorías y al menos 50 propuestas por categoría; fuentes consultables y CSV descargable desde la exploración. Valores y disponibilidad se reconfirman.
- Cuenta mediante ChatGPT, preferencias privadas, favoritos y solicitudes persistentes.
- Modo sorpresa semanal o mensual con hasta tres alternativas por período. Presupuesto, categorías, zona, días y horarios configurables. Sin obligación de aceptar, sin abono cobrado. Las rondas se actualizan al consultar la cuenta.
- Coordinación manual: solicitud → cotización final → aceptación → confirmación con comprobante → realizada. Cancelación según condiciones aceptadas.
- Comunidad con fotos voluntarias, likes, reseñas de salidas verificadas, reportes y moderación. Ranking de experiencias a partir de tres reseñas verificadas.
- Pasaporte privado con XP, cinco niveles, ocho insignias, sellos, categorías y misiones. Reglas visibles dentro del producto.
- Adaptador Mercado Pago Split 1:1 para un prestador piloto; no está habilitado para cobros reales. Detalles técnicos y variables protegidas en PROJECT_NOTES.md.
- Panel del propietario con cotización, confirmación, moderación, pagos y tablero de lanzamiento.

## Reglas del pasaporte

| Acción verificada | XP |
| --- | ---: |
| Preferencias completas, una vez | 30 |
| Experiencia realizada | 100 |
| Primera experiencia de cada categoría | 40 |
| Experiencia realizada desde modo sorpresa | 25 adicionales |
| Reseña verificada publicada, una por experiencia | 20 |

Niveles: La curiosidad (0), Primeros pasos (150), Explorador (400), Coleccionista de historias (900), Espíritu YOLO (1800). Los puntos son simbólicos, sin valor monetario ni canje. No hay premios, descuentos, competencia de gasto ni recompensas por rechazar propuestas. Las misiones no duplican los XP de las acciones. El pasaporte es privado y no hay clasificación pública de usuarios.

Los XP se derivan de los registros actuales, nunca de cantidades enviadas por el navegador. Sólo cuentan reservas realizadas, con fecha ya pasada y experiencia existente. Se eliminan duplicados. Los XP no vencen por inactividad; una corrección de reserva o una reseña retirada puede ajustar el total. La racha mide meses consecutivos con salidas en horario de Buenos Aires y se mantiene durante el mes siguiente para permitir retomarla. Saltarse un mes no quita XP. La misión de reseña no vence; las dos de salir/estrenar categoría se renuevan por mes calendario.

## Lo que requiere decisión y configuración del titular

El sitio publicado conserva la audiencia privada anterior. Estos pasos no se ejecutaron automáticamente ni se presentan como completados:

1. **Prestador piloto:** elegir uno o pocos proveedores del catálogo y acordar por escrito servicio, cupos, precio final, comisión, cancelación, reintegros, comprobantes y plazo de respuesta. Las fuentes del catálogo no equivalen a una alianza.
2. **Titular y atención:** definir quién comercializa, información de facturación, contacto de atención, tratamiento de datos y términos aplicables. Incorporar esas decisiones al producto antes de abrirlo a visitantes. No hay borradores legales presentados como contratos vigentes.
3. **Mercado Pago:** configurar aplicación, autorización OAuth del prestador, secretos de servidor y webhook accesible. Ensayar sandbox, repetir notificaciones, rechazo y devolución. Activar real sólo después de aprobarlo. Nunca pegar secretos en el chat ni incluirlos en el código.
4. **Dominio y audiencia:** conectar el dominio que posee el titular, verificar DNS/HTTPS y habilitar la audiencia que elija. No se configuró un dominio cuyo acceso DNS no se proporcionó ni se abrió el sitio al público.
5. **Avisos:** elegir email, WhatsApp o push y conectarlo si se desea envío automático. Hoy el visitante consulta la propuesta en su cuenta; no se prometen notificaciones programadas.
6. **Prueba operativa:** hacer una reserva piloto de punta a punta con el prestador y el procesador antes de abrir ventas generales. Las pruebas de software usan datos desechables y pagos simulados.

## Primera operación del equipo

1. Ingresar como propietario → Mi pasaporte → Panel de coordinación.
2. Revisar el tablero de lanzamiento y las nuevas solicitudes.
3. Consultar al prestador cupo, importe, punto de encuentro y políticas; emitir propuesta con plazo vigente.
4. El usuario acepta. Cobrar sólo si el prestador y el procesador están habilitados. La vuelta del checkout no prueba pago: el servidor espera confirmación autenticada.
5. Obtener comprobante del proveedor y confirmar. Un pago de prueba no confirma una reserva real.
6. Después de la fecha, validar asistencia y marcar realizada. Aparecen el sello y los XP; el usuario puede publicar una reseña.
7. Revisar reportes y pagos. Cancelar una solicitud no ejecuta por sí solo un reembolso; gestionarlo en el procesador y verificar el resultado.

## Ensayo del producto

- Preferencias: editar o pausar no reinicia las tres opciones del período actual.
- Propuesta: rechazar tres veces no obliga a comprar ni crea una cuarta alternativa.
- Reserva: solicitar no equivale a cotizar, pagar o confirmar.
- Privacidad: una cuenta no puede ver reservas, pasaporte ni fotos pendientes de otra.
- Comunidad: puntuar sin una salida realizada es rechazado en servidor; likes no alteran el ranking.
- Pasaporte: pedir reservas o cambiar datos enviados desde el cliente no agrega XP.
- Operación: una cotización no se confirma con un pago de prueba; una cancelación no equivale a reintegro.

Pruebas automáticas: scripts/test-domain.mjs, test-api.mjs, test-catalog.mjs, test-social-payments.mjs y test-gamification.mjs; comprobación TypeScript y compilación oficial Sites. La prueba de pasarela usa respuestas simuladas y no acredita integración con una cuenta real.

## Instalación y publicación

El código fuente está versionado en el repositorio del proyecto Sites. .openai/hosting.json retiene su project_id y bindings DB/BUCKET. Usar el flujo oficial de Sites para compilar y publicar la misma revisión del código; las migraciones existentes de drizzle/ se aplican sin modificarlas. No es un HTML que pueda subirse a un hosting estático: requiere el servidor, base de datos, almacenamiento e identidad provistos por Sites. No hay cambios de esquema en esta ampliación de gamificación.

## Avance del piloto — 28/10/2026

La base de diez candidatos y sus fuentes está en el panel del propietario → Coordinación → La base del modo sorpresa. Nueve tienen referencia publicada entre ARS 7.000 y 30.000 pp; DODA debe cotizar un paquete, con objetivo de hasta ARS 20.000 pp. Todos requieren confirmar condiciones antes de reservar. Se prepararon diez mails en Gmail y una tarea de envío para esta tarde, alrededor de las 15 h de Buenos Aires; la ejecución futura debe verificarse, no está acreditada por crear el borrador. Seguimiento de respuestas por ChatGPT durante diez días hábiles desde el 29/10, sin nuevos correos automáticos.

El panel conserva estados comerciales manuales con precio, comisión, cupos y cancelación acordados. El 20% es una hipótesis editable de ingreso bruto de YOLO. No está acordado, no se impone a prestadores ni altera cotizaciones vigentes. La calculadora distingue desconocido de cero, costo MP al vendedor, ingreso bruto y contribución tras costos ingresados. Comprobación visual con valores de prueba, pruebas API y pruebas de fórmulas completadas; no se probó un cobro real.

Se agregó yolo.com.ar a Sites en estado pendiente. Restan registros DNS en DonWeb y validación SSL; valores exactos en DOMAIN_SETUP.md. No se modificaron los DNS ni se abrió el acceso público. Mercado Pago sigue deshabilitado hasta que el titular cree/configure la aplicación Marketplace, autorice al prestador y se configure el webhook accesible.
