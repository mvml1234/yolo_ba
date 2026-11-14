# YOLO.BA — exportación del código publicado

Fecha de exportación: 14/11/2026. Versión Sites: 54.
Commit: bf95afa82fe0d325e8bf3a0b1047f9c3073aeea9.
Proyecto: appgprj_6adcc992474c8191a6467050f9df1a66.
Publicación verificada como succeeded: appgdep_6af82047e6c88191a95b66699801bb2b.
Sitio: https://yolo.com.ar (plataforma: https://yolo-ba.matete.chatgpt.site).

## Alcance
Este repositorio contiene los archivos versionados del commit publicado, incluyendo public/ con imágenes, dependencias declaradas y lockfiles, configuración, esquema Drizzle, migraciones SQL y catálogo. No se modificó, publicó ni borró el Site. README.md es documentación añadida a esta exportación; el README original está en README_ORIGINAL.md. .env.example contiene sólo nombres con valores vacíos. EXPORT_MANIFEST.json identifica origen y comprobaciones.
No incluye .git, node_modules, credenciales, sesiones, archivos locales ignorados, copia de D1 en producción ni objetos privados/subidos en R2. El esquema exportado describe las tablas declaradas por el código; no se consultó el inventario real de producción. No se ejecutaron las APIs de agendas porque sus GET pueden refrescar y persistir datos.

## Catálogo
Catálogo base: app/lib/catalog.json. Otros archivos de app/lib/ contienen referencias y metadatos de fotos, clasificaciones y reglas. Se incluyen todos los JSON versionados, sin reconstruir ni actualizar datos.
Las agendas dinámicas se obtienen en app/api/eventos, shows, ampliacion y gratis. Consultan fuentes externas y conservan resultados en R2 (binding BUCKET), por ejemplo public-agenda/official-theatre-v4.json. Esos snapshots operativos no forman parte del repositorio y NO están incluidos. Las tarifas del catálogo son referencias, no garantía de vigencia ni disponibilidad. El Excel comercial de ChatGPT Library es un recurso separado y no está incluido.

## Ingreso de usuarios
app/chatgpt-auth.ts lee los headers de identidad oai-authenticated-user-id/email/full-name suministrados por el hosting Sites. Inicio y salida usan /signin-with-chatgpt y /signout-with-chatgpt. No es un sistema autónomo de usuario/contraseña ni un login con Google.
En desarrollo portable hay simulación de identidad en loopback, documentada en README_ORIGINAL.md. Esa simulación no es autenticación de producción. Al migrar fuera de Sites hay que implementar un proveedor de identidad y adaptar estas funciones. No confiar en headers de identidad enviados directamente por clientes: deben ser eliminados y establecidos por infraestructura confiable.
Estado de miembros: app/api/account/route.ts, persistido en members; usa revisiones para controlar actualizaciones concurrentes. Revisar también rutas passport, admin y community.

## Base de datos y archivos
Cloudflare D1/SQLite mediante binding DB; definición completa en db/schema.ts y migraciones en drizzle/*.sql. Se agrega database/schema.sql como concatenación ordenada de migraciones para inspección; para aplicar cambios usar un único método de migración, no aplicar el agregado además de las migraciones originales.
Tablas declaradas:
- members: identidad, email, estado JSON, revisión y creación.
- community_posts: publicaciones, experiencia, alias, texto, medios, valoración y estado.
- community_media: propietario y referencia del objeto almacenado.
- community_likes: likes por usuario y publicación.
- community_reports: reportes y motivo.
- payment_orders: estructura histórica de órdenes y conciliación; su existencia no implica cobros activos.
- partner_pipeline: estado comercial del proveedor, precio, comisión propuesta, condiciones y referencia de hilo.
Índices y columnas exactos están en el esquema y migraciones.
Cloudflare R2 mediante binding BUCKET almacena medios de comunidad y snapshots de agendas. DB y BUCKET son bindings de recursos, no cadenas que se resuelvan poniendo valores en .env.

## Servicios externos
Hosting actual: ChatGPT Sites sobre Cloudflare Workers. Framework Vinext con React, Vite y convenciones Next. Base D1, objetos R2, autenticación suministrada por Sites y soporte de conectores incluido en scripts/ y worker/.
Las APIs consultan sitios oficiales culturales y de entradas; ver las URLs y lógica exactas en app/api/ y app/lib/. Mapas: ver assets Leaflet y componentes de mapa incluidos. Hay imágenes y metadatos de fuentes externas en public/ y app/lib/: conservar atribuciones y comprobar derechos antes de reutilizar fuera del proyecto.
Gmail/Library usados para gestión comercial son conexiones externas del asistente, no conexiones transferidas por este ZIP.

## Pagos
NO hay checkout activo en esta versión: paymentsConfiguration() en app/lib/payments.mjs devuelve ready:false y mode:disabled de forma incondicional. YOLO deriva al proveedor, que reserva/cobra directamente.
Existen tablas, diagnóstico y código de webhook de Mercado Pago de etapas anteriores. No constituyen prueba de pagos activos y no deben activarse sólo por configurar variables. .env.example enumera los nombres referenciados, sin valores ni credenciales. No se leyeron secretos de producción.

## Instalación y ejecución
Node >=22.13.0. package.json declara pnpm@11.25.0 y contiene scripts dev/build/start/db:generate. Conservar los lockfiles incluidos y seguir README_ORIGINAL.md y scripts/ para el perfil portable o managed-linux; no mezclar gestores ni actualizar dependencias durante la primera reproducción.
El comando de desarrollo es npm run dev; build: npm run build; npm start ejecuta el Worker construido localmente mediante Wrangler, NO publica. Requiere dependencias y perfil de ejecución configurados. Este export no ejecutó instalación ni build y no acredita portabilidad inmediata a otro hosting.

## Publicación
La configuración de identidad y bindings está en .openai/hosting.json. Vite usa plugins de Sites y Cloudflare. Worker de entrada: worker/index.ts. Salida de servidor esperada: dist/server/index.js.
En Sites: preparar dependencias/perfil, validar y construir, sincronizar la fuente exacta, guardar una versión y desplegarla mediante herramientas autorizadas de Sites. No crear otro proyecto ni cambiar audiencia por accidente.
Fuera de Sites: crear y enlazar D1/R2 propios, aplicar migraciones en una base nueva de prueba, adaptar autenticación y dependencias de plataforma, configurar secretos por canal seguro y desplegar un staging antes de tocar DNS. Los IDs de recursos de ejemplo no migran recursos reales. El ZIP no transfiere dominio, base, usuarios o archivos privados.

## Comprobación
Integridad ZIP y presencia de catálogo, public/, package.json, lockfile, esquema y migraciones verificadas al exportar. No se hicieron modificaciones remotas ni despliegues. Revisar EXPORT_MANIFEST.json y SHA256SUMS.txt para integridad.

## Correcciones de versión 54
Puesto Viejo Xc7ec8ee7427 sin tarifa neta ni moneda en catálogo/CSV; ruleta exige language exactamente es; E05 mantiene publicación pero surpriseEligible=false. Se conserva vigencia máxima de precios de 30 días.

## Excepciones de esta transferencia a GitHub
Se eliminaron los valores de verificación DNS de DOMAIN_SETUP.md. La revisión automática rechazó copiar scripts/vite/sites-vite-plugin.LICENSE (licencia preexistente del plugin); ese archivo NO se incluyó. No se otorga una licencia nueva al proyecto. Resolver la inclusión del aviso original antes de redistribuir o migrar el componente; no asumir que la omisión elimina sus obligaciones.
