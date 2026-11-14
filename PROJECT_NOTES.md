# YOLO.BA

Aplicación Vinext / Cloudflare Workers. Identidad administrada por Sites, cuenta gratuita con ChatGPT y persistencia en D1 mediante la tabla `members`.

## Producto

- Explorar: 417 propuestas visibles, al menos 50 por cada una de las ocho categorías; ampliación con 400 fichas investigadas el 27/10/2026. Prestador, ubicación y fuente por ficha; referencias orientativas, sin inventario garantizado. Se conservan los 32 IDs iniciales para solicitudes y favoritos previos, y 15 tarjetas amplias se retiran de la exploración para reducir duplicados.
- Modo sorpresa: frecuencia semanal o mensual, fecha inicial, categorías, moneda, presupuesto por persona, zona, personas, días, intervalo horario, anticipación y vencimiento de respuesta.
- Hasta tres alternativas distintas por período, conservadas en servidor; rechazar la última no obliga a reservar. Pausar o cambiar preferencias no reinicia el período actual.
- La ronda se materializa al consultar la cuenta. No hay ejecución de un programador en segundo plano ni entrega de email/WhatsApp/push.
- Mis planes: solicitud → propuesta final → aceptación del usuario → confirmación manual con comprobante del prestador. Cancelación independiente de la pausa.
- Panel del propietario: cotización, comprobantes, indisponibilidad, resultado de cancelación y experiencia realizada. Restringido en servidor al email del propietario actual, verificado por la identidad de Sites.
- Favoritos y pasaporte privados. Comunidad con historias voluntarias, hasta cuatro fotos, me gusta, reportes y moderación. Nombre público elegido por el usuario; no se expone su email.
- Puntuación de 1 a 5 sólo con una reserva realizada en YOLO, una reseña publicada por usuario/experiencia. Ranking a partir de tres reseñas verificadas; los me gusta no alteran la nota.

## Alcance operativo

Hay un adaptador de checkout Mercado Pago Split 1:1 para un prestador piloto, deshabilitado hasta conectar credenciales y un webhook público. No hay API de reservas de proveedores. La coordinación y confirmación de disponibilidad siguen siendo manuales desde el panel. No se enviaron mensajes ni se realizaron reservas durante la creación. Las fotografías son ilustrativas y no identifican prestadores concretos.

El acceso del Site se conserva como privado del propietario. El dominio personalizado y el acceso público deben configurarse por separado cuando se decida lanzar.

## Datos y seguridad

La clave del usuario proviene de los encabezados de identidad inyectados por Sites. Nunca se acepta un identificador de usuario suministrado por el cliente para operaciones personales. Cambios con revisión optimista evitan sobrescribir solicitudes o consumir propuestas dos veces por concurrencia. Las escrituras comprueban origen cuando se presenta y requieren identidad. El cliente no confirma por sí mismo reservas ni roles.

## Ampliación del catálogo

Los conteos y fecha están en `app/lib/catalog-stats.json`. El relevamiento descargable es `public/catalogo-yolo-ba.csv` (UTF-8 con BOM y separador punto y coma). Hay 67 referencias numéricas; 350 fichas sin precio utilizable. Los importes de paquetes se normalizan sólo cuando se conocen las personas incluidas. Fechas de cursos ya iniciados y campañas puntuales requieren reconfirmación. Los cursos de varias clases se identifican y excluyen de la selección sorpresa automática.

El catálogo incorpora provincia de Buenos Aires, incluidas costa y sierras. La localidad permanece visible; no implica una salida de cercanía desde CABA. Las alternativas comerciales no constituyen alianzas ni disponibilidad confirmada.

## Verificación

- `node node_modules/typescript/bin/tsc --noEmit`
- `node scripts/test-catalog.mjs`
- `node scripts/test-domain.mjs`
- `node scripts/test-api.mjs`: ejecuta los manejadores reales con identidad simulada y SQLite en memoria como doble D1. Cubre aislamiento, permisos, límite de opciones, persistencia y estados de reserva, validación y concurrencia. No sustituye una prueba del proveedor de autenticación alojado.
- Compilar con el helper oficial `build-site.mjs` del plugin Sites.

Las migraciones de `drizzle/` se generan antes de compilar y Sites las aplica al publicar. No alterar migraciones ya aplicadas. La configuración canónica de identidad y bindings está en `.openai/hosting.json`.

## Comunidad y fotos

D1 conserva historias, likes, reportes, propiedad de fotos y órdenes de pago. R2 `BUCKET` guarda fotos. El cliente convierte JPG/PNG/WebP a WebP fijo de hasta 1600px y el servidor elimina EXIF/XMP/ICC y bytes extra; máximo cuatro fotos por historia, 5 MB por archivo preparado. Publicar exige consentimiento explícito. Fotos pendientes/ocultas/retiradas sólo son accesibles por su propietario; las publicadas respetan además la audiencia del Site. No se publica información de reservas ni preferencias privadas. La moderación retira contenido del feed; el autor puede retirar sus historias. No hay seguimiento de usuarios, comentarios ni mensajería en esta versión.

## Activación de cobros (pendiente)

No se conectó una cuenta de Mercado Pago ni se ejecutaron cobros reales. Este Site conserva acceso privado del propietario y no puede recibir webhooks anónimos del procesador. No se debe activar PAYMENTS_SITE_PUBLIC mientras esa condición continúe.

1. Crear/configurar aplicación marketplace en Mercado Pago Argentina y autorización OAuth del prestador piloto; esta versión consume su token de servidor, no implementa una pantalla OAuth multi prestador. Obtener su ID de vendedor y nombre exacto de prestador que se usará al cotizar.
2. Configurar secretos exclusivamente con variables protegidas de Sites: MP_SELLER_OAUTH_TOKEN, MP_SELLER_ID, MP_SELLER_PROVIDER, MP_WEBHOOK_SECRET. Configurar PAYMENTS_PUBLIC_BASE_URL con origen HTTPS público y PAYMENTS_SITE_PUBLIC=true sólo después de autorizar y verificar el acceso público. La URL de notificaciones será /api/payments/webhook. No usar secretos ni bypass de acceso en URLs.
3. Activar PAYMENTS_MODE=test, comprobar sandbox con las cuentas de prueba y credenciales autorizadas para Split. Probar aprobación, rechazo, devolución, reintentos y firma. Las pruebas de esta entrega usan dobles locales y no sustituyen este paso.
4. Para pasar a real, configurar credenciales adecuadas, PAYMENTS_MODE=live y PAYMENTS_LIVE_APPROVED=true después de aprobar el ensayo y acordar comisión y políticas con el prestador. Cotizar sólo con disponibilidad comprobada, referencia del cupo y plazo vigente.

El total y comisión se calculan en servidor desde la cotización aceptada. marketplace_fee es un importe monetario incluido en el total, no un recargo automático al visitante. El procesador hace el reparto, YOLO no mantiene una billetera ni ofrece escrow. Las tarifas del procesador son distintas de la comisión de YOLO. La columna de descuentos informados refleja fee_details del procesador y no representa una liquidación neta garantizada.

Cada reserva tiene una única orden persistente. Un fallo incierto de creación requiere conciliación manual antes de permitir otro checkout. Volver de Mercado Pago no acredita pago: webhook con HMAC, ventana de cinco minutos, ID canónico de query y consulta autenticada a /v1/payments verifican monto, moneda, vendedor, entorno e identidad de orden. Actualizaciones antiguas no revierten estados más recientes. Estados de pagos y reservas permanecen separados; un pago de prueba no confirma una reserva real.

Reembolsos y contracargos se reflejan cuando el procesador los informa. Cancelar o pausar no ejecuta una devolución: requiere coordinación y gestión en Mercado Pago según la política acordada y saldo del prestador. No hay reintentos de cobro automáticos, suscripciones cobradas ni captura de tarjetas en YOLO.

Fuentes de integración: documentación oficial de Mercado Pago Argentina, Split 1:1 / Integrar marketplace; SDK Node oficial, validación de webhooks. Verificación adicional: node scripts/test-social-payments.mjs (manejadores reales, SQLite/R2 e identidad de prueba; checkout y consultas PSP simulados).

## Gamificación y preparación del piloto

`app/lib/gamification.mjs` deriva XP, nivel, ocho insignias, sellos y misiones desde las reservas realizadas del usuario y sus reseñas publicadas. `/api/passport` devuelve sólo el progreso propio y no admite escritura de puntos. No requiere migración nueva. Fecha de experiencia y meses usan Buenos Aires; solicitudes/cancelaciones, importes y likes no dan XP. Reseñas retiradas o reservas corregidas ajustan el cálculo, sin duplicación por edición de perfil o actualización del navegador.

El pasaporte no tiene ranking público de usuarios ni canje monetario. Cinco niveles en 0/150/400/900/1800 XP. Reglas completas y límites de lanzamiento en LAUNCH.md, incluidas notificaciones aún no conectadas, alta OAuth multi prestador no implementada, configuración comercial pendiente y conservación del acceso privado. `/api/launch` es de lectura y sólo para el propietario; expone métricas reales y configuración, sin fingir ensayos comerciales completados.

Verificación adicional: `node scripts/test-gamification.mjs`, y pruebas de identidad de `/api/passport` y permisos de `/api/launch` en `test-social-payments.mjs`.

## Piloto comercial (28/10/2026)

Se relevaron diez candidatos económicos y se prepararon diez borradores individuales en la cuenta Gmail autorizada del propietario. Las direcciones se verificaron en webs oficiales y se comprobó el historial relevante; no hay acuerdos comerciales previos encontrados. La tarea Contactar proveedores YOLO está habilitada para el 28/10/2026 por la tarde (~15 h Buenos Aires, horario flexible), pero crear la tarea no acredita que se hayan enviado. Verificar Enviados e hilos. La tarea Seguir respuestas YOLO revisará diez días hábiles desde el 29/10, alrededor de las 10 h; informa por ChatGPT y no envía seguimientos nuevos automáticamente.

`pilot-partners.json` conserva relevamiento y manifiesto de consultas; sólo `/api/partners`, restringida al propietario, devuelve sus datos. `partner_pipeline` persiste gestión manual con revisión optimista. Marcar acuerdo requiere precio, comisión, disponibilidad, cancelación y enlace Gmail; no activa checkout ni altera la selección sorpresa. Los datos relevados no se promocionan automáticamente a inventario confirmado. El panel no sincroniza automáticamente respuestas de Gmail: los resúmenes llegan por ChatGPT.

Nueve candidatos tienen referencia pública. DODA no tiene tarifa oficial validada: se pidió un paquete objetivo hasta ARS 20.000 pp y no se computa comisión hasta recibir cotización. Graffiti: home ARS 15.000 frente a ficha ARS 14.000; se toma el mayor para planificación y se consulta español. Manifiesto: promoción ARS 25.500, lista 30.000; calendario contradictorio requiere confirmación. Escalada usa clase con instructor ARS 29.000, no descuento efectivo ni pase sin guía. Escape de dos usa 25.000 pp, total 50.000. Museos deben autorizar expresamente cualquier modalidad comercial; no hay recargo automático ni comisión garantizada.

`economics` y calculadora del panel usan un objetivo editable del 20% sobre precio final, sin aplicar cambios automáticos a cotizaciones. Comisión bruta separada de contribución tras costos ingresados; blanks son desconocidos, cero explícito es cero. Costo MP al vendedor según Split; no se hardcodea tasa. El diagnóstico `/api/payments/setup` sólo informa presencia de configuración, nunca secretos, ni acredita credenciales válidas. El agregador excluye pruebas, pagos no verificados, otras monedas, reintegros parciales/totales y contracargos; comisión acordada no equivale a liquidación ni utilidad.

La planilla YOLO_Piloto_10_Experiencias.xlsx es base inicial editable con fuentes, estados y modelo de comisión; fórmulas probadas variando comisión y costos. No se sincroniza con Gmail ni con D1. Pruebas nuevas: test-profit y permisos/validación/concurrencia de partners/setup en test-social-payments. No se realizaron cobros reales ni ensayos con una cuenta Mercado Pago conectada. La aplicación Marketplace y autorización OAuth del prestador siguen a cargo de sus titulares; no se conectaron cuentas financieras sin ellos.

## Reserva visual y precisa

La ficha del catálogo ahora abre BookingFlow en tres pasos: personas con tarjetas y contador, fecha/horario con botones y calendario alternativo, y resumen de personas/horarios/total orientativo. Un único horario alcanza; hasta tres alternativas opcionales corresponden a una sola salida. Los horarios propuestos por los botones son preferencias del visitante, nunca cupos/inventario confirmados. No se muestra una compra pagada ni confirmada al recibir la solicitud. Tras una cotización aceptada que requiera pago y con pasarela habilitada, se continúa al checkout sin otro formulario; se mantiene el consentimiento expreso a las condiciones.

Para coordinación de solicitudes del catálogo se exige al menos 24 horas de anticipación y un horizonte máximo de 90 días, en Buenos Aires. Los límites se aplican en servidor además del selector. Se corrigió validación estricta HH:mm para rechazar 24:00/12:60 en cleanDates. El modo sorpresa conserva la anticipación configurada en su perfil y sus propios límites de período.

La selección del visitante no autenticado se conserva al pulsar Ingresar y continuar en sessionStorage del navegador, por dos horas. Contiene sólo ID de experiencia, personas, horarios y clave aleatoria; ningún token de acceso. return_to lleva un indicador de reanudación, nunca datos de reserva. Se descarta si está vencida, el catálogo dejó de listar el plan o la fecha ya no cumple las reglas. Nunca se envía automáticamente tras iniciar sesión: el visitante revisa y solicita. Prueba del parser/expiración y recorrido visual completadas; no se completó un inicio de sesión real durante QA local.

El cliente genera una clave UUID para la solicitud, con generador criptográfico compatible con la vista previa HTTP. El servidor la liga a la cuenta y la selección exacta; reintentos y clics simultáneos devuelven la solicitud existente, sin crear otra. Una clave reutilizada con personas/plan/horarios distintos devuelve conflicto. Se mantiene la protección contra solicitudes abiertas duplicadas y revisión optimista de la cuenta.

Verificación: test-booking (límites, fechas, atajos y borradores), test-api (reintentos y concurrencia de solicitudes), pruebas anteriores de estados/pagos y TypeScript. QA visual en escritorio y en iframe de 390px con la app real: selección y revisión sin escribir. La página temporal de QA se retiró antes de compilar/publicar. No se generaron reservas ni cobros de prueba en producción.


## Ruleta de experiencias — 28/10/2026
- New Ruleta navigation, home shortcut and footer entry; usable without sign-in.
- Maximum per person, independent ARS/USD, budget presets, all eight categories without onboarding.
- Eligible listed surprise-compatible records only; nonnegative numeric reference prices within inclusive maximum. Unknown prices and other currencies excluded. Free plans included.
- Uniform experience draw, no repeats until selection exhausted; resets on budget/currency changes. Independent from recurring three-proposal cycle.
- SVG wheel lands on selected category, controls locked during spin, reduced-motion support, mobile scroll to wheel/result, timer cleanup.
- Result opens existing BookingFlow. No automatic bookings or charges; final price and availability require confirmation.
- Browser QA desktop and 390px iframe: within-budget draws, booking modal handoff, mobile redraw and invalid budget disabled. Temporary QA route removed.
- Checks: roulette, booking, domain, TypeScript; production build during packaging.


## Interactive booking demo — 28/10/2026
- Standalone /demo route, linked from homepage/footer and each roulette result (/demo?experience=ID).
- Reuses exact BookingFlow with optional demo flag default false, fictitious signed-in visitor and local callback. Demo submission never calls account/payment APIs, never sends email or opens checkout. Existing real booking flow stays enabled outside /demo.
- Demo flag also preserves any real sessionStorage reservation draft when finishing demo. Demo state lives only in React memory and resets on reload.
- Six stages: select, request, supplier query example, final quote/consent, mock checkout, provider confirmation. Separate client and operator panels. Explicit manual supplier-contact explanation at every stage; automation not implemented by this feature.
- Optional no-availability branch returns to form; fake payment rejection/retry; zero-priced plans bypass mock charge but still require provider confirmation. Commission example 20% is hypothetical gross before costs.
- Uses fictional provider label, no real recipient or send target, obvious DEMO banner in both page and dialog, invalid demo receipt code.
- Browser QA: desktop full paid path through receipt, rejected payment and retry; 390px actual responsive iframe form + no availability/reopen; selected free catalog item routes through no-charge confirmation. Temporary QA route removed.
- test-booking, test-roulette, test-domain, TypeScript passed. Build during packaging. No real requests/payments/messages created in QA.


## Availability coordination in batches — 28/10/2026
- Real owner-only admin action availability: 1–3 future dates checked for the full group, shared exact price/provider/place/cancellation, mandatory supplier reference and checked verification, expiry <=24h and before first slot. No automatic supplier messages or live inventory integration.
- Stores availability_options with server-generated batch/option UUIDs and maximum 2 rounds in existing members JSON (no migration). Admin and client views show round, options and expiry; history records each batch dates/total/expiry and selection/rejection.
- Client availability_choose only selects the authoritative server option, transitions to quoted for separate explicit acceptance. Stale, foreign and expired choices rejected. No automatic approval/charge/confirmation. availability_decline returns to requested for last round or replan_needed after second batch. Withdraw and explore remain available.
- Direct admin quotes still supported in pre-existing requested/quoted states; exhausted requests cannot be quoted or offered a third batch. Selected valid quotes can still be accepted. No resetting surprise's 3-proposal cycle.
- New batch UI does not activate online payments; requires existing separate provider payment setup/quote when appropriate. Currency and price never silently changed.
- Demo no-cupo branch now offers 3 fictional supplier dates per round, second batch and explicit change-experience/close exit after 2 rounds. Original booking selection stays visible until visitor picks an alternative.
- Booking text explains supplier alternatives and customer control. No true claim of held inventory; final provider confirmation still required.
- QA: test-availability, test-api (real route logic with local D1/identity doubles), test-social-payments, test-booking, test-domain and TypeScript pass. Browser desktop demo two-round exit; actual 390px iframe with AvailabilityChoices selection and AvailabilityForm validation. Fixed server/browser hour-format hydration mismatch using 24h dates. QA routes removed before packaging.


## Category guide and Para el corazón — 28/10/2026
- New Categories navigation/view explains the original 8 categories plus the free solidarity category. Heart homepage teaser; deep links ?category=corazon and ?category=todas. Responsive six-item navigation.
- 50 sourced opportunities added with stable H001–H050 IDs, direct official registration, requirements, cost evidence/source, modality and admission/task availability. 21 in-person, 4 mixed, 25 remote; includes one matching programme rather than inflating GCBA's eight cause routes into eight vacancies.
- Coverage: humanitarian volunteering (Cruz Roja branches/programmes), one GCBA programme matching route, visual assistance, CIFA urban growing/native plants, citizen science/conservation, mapping/accessibility, and seven public-hospital donation routes (distinct sites or blood/platelet modality). These are 50 opportunities/roles/sites, not 50 NGOs or guaranteed vacancies. Tandil is explicitly outside AMBA. Admission calendars and task exhaustion remain organisation-controlled.
- Researched excluded examples: Huellas assigned materials, paid volunteer tourism, completed/paused citizen-science projects, Bookshare closed intake, malformed Cruz Roja branch template pages. Sources for volunteer entry distinguished from commercial paid courses.
- All Heart price=0, commissionRate=0, nonprofit=true, surpriseEligible=false. Dedicated opportunity modal uses official registration links, never BookingFlow/checkout; no automatic messages, registrations or partner representation. Own transport/data/personal items not subsidized; source checks do not establish a booked place.
- Server commercial request and cycle acceptance reject Heart. Admin quote/availability and payment routes reject Heart by catalogue category as well as nonprofit flag; protects legacy/forged states. No random surprise assignment, transaction or XP/reward for solidarity/medical donations.
- Download public/para-el-corazon.csv with all 50 plus evidence and source URLs; master CSV/stats updated to 467 visible, 9 categories. Existing stable IDs retained. No migration/secrets/audience changes.
- QA: category guide and Heart filter/detail on desktop and actual390px iframe; source/signup links and absence of price controls/checkout verified in rendered UI. All50 records validated, commercial request/quote/payment guards tested with route logic, no charity action actually taken. test-heart, test-catalog, test-api, test-social-payments, test-gamification, TypeScript passed. Temporary QA route removed.

## Visual refresh and real photography — 28/10/2026
- Warm cream, coral, electric blue and lime palette; stronger typography; a real Caminito/Tigre/ceramics photo collage, floating postcards, rotating accents and moving ribbon. Four visual mood shortcuts lead to category filters.
- 34 distinct locally hosted, optimized progressive JPEGs (about 5MB total) with source, photographer, license and semantic topic manifest. Unsplash free photos plus one Pexels donation photo; public /fotografias.html credits and source links. Photos explicitly illustrative, never claimed to depict a contracted provider or a customer's actual booking.
- Activity-specific title matching across categories, category fallbacks and stable per-ID selection; multiple restaurant photos, distinct sushi/asado/seafood and balloon/skydiving photos. Same image follows each experience into roulette and booking/demo. Category guide now includes photographs and numbered category cards.
- Discovery catalogue interleaves the nine category shelves when browsing Todas; counts, filters, pagination and stable experience IDs retained. No changes to surprise assignment, availability, requests, payments or Heart's nonprofit safeguards.
- Scroll entrance reveals, page/dialog/result transitions, image zooms, card lift, button feedback and restrained continuous accents. IntersectionObserver reveals disconnect after first entry; mutation observer handles view/filter changes; both cleaned up. Decorative animation pause control stored locally; prefers-reduced-motion disables movement. Content remains visible without JS or when motion is off.
- Mobile 390px real iframe QA: three-line headline, collage, six-item bottom nav, catalogue, BookingFlow people/date steps; fixed backdrop-filter containing block so bottom navigation remains at viewport bottom. Desktop home/categories and roulette result checked, no broken loaded photos or horizontal overflow. QA route removed before packaging.
- Validation: all34 JPEGs decoded; test-booking, test-heart, test-roulette, test-catalog, TypeScript passed; official production build in packaging. No real booking, payment, provider contact or access change performed.

## Interactive passport collection — 28/10/2026
- New tactile booklet in Mi pasaporte: opening cover, facing paper pages, identity, eight commercial category chapters, separate Heart page, benefits page; page turns, keyboard arrows, category index/select and horizontal touch gestures. Page changes return to booklet top; mobile stacks pages legibly. Three locally remembered stamp ink colours.
- Four derived editions: Descubrimiento (1 new verified booking/category), Explorador (+1/category), Aventurero (+2/category), Golden (+3/category). Each completed booking allocated to exactly one edition/category slot; Golden unlocks after first3 books (32 balanced bookings), entire collection56. Extra category bookings prefill future editions; prior editions remain viewable. No expiry or reset; corrected booking records recalculate progression. Existing XP/levels/missions/badges retained under expandable Bitácora, independent from book quotas.
- Server /api/passport now returns version2 with collection calculated from the same authenticated, completed/past, unique booking records already used for XP. No writable client rank/count/benefit API. Heart/medical donation records remain excluded from XP, stamps, quotas and commercial benefits; dedicated informational Heart page links to free opportunities.
- Benefits identify actual in-product album/archive/edition insignia/Golden cover separately from planned commercial perks. No supplier discounts, percentages, coupons or agreements invented or activated. Planned discount/special-experience rows explain conditions will be published only after agreements exist.
- Ver un ejemplo Golden builds an explicitly fictional client-only collection; no requests or writes. Exit returns to actual API progress. Example notice plus toolbar marker; stamp details say example. Deep link ?view=passport added.
- Removed photo-reference labels/overlays from cards, category guide, home, surprise, roulette and booking/demo plus repetitive explanations. Dedicated photography credits retain author/original/license links. No change to availability/price/final reservation confirmation language.
- Validation: new test-passport-books covers quotas, skewed category counts, sequential ranks/Golden thresholds, unique allocation, cancelled/future/duplicate/Heart exclusions, corrective downgrade and planned-only discounts. Existing gamification, Heart, social/payment API mocks and booking checks passed; TypeScript passed. Desktop opening/category flip/example/stamp detail; real390px iframe identity/category/Heart/index checked. Temporary QA route removed before packaging. No real booking, charge, signup, email, or sharing change performed.

## Passport leaf turns and Plus commercial model — 29/10/2026
- Replaced whole-spread tilt with an actual directional turning leaf: front/back paper faces, bound-edge transform origin, perspective/shading, forward/backward animation. Main spread stays mounted. Duplicate decorative faces are aria-hidden/inert. Rapid flips and edition changes locked during transition; animation end plus timeout fallback release controls; timers/media/mutation listeners cleaned up. Reduced-motion/paused setting skips turn; pausing mid-turn resolves it. Scroll position is retained while booklet top is in view; offscreen changes return to booklet top.
- Reworked quotas per request: Base first4 verified outings in any commercial categories; next8 complete Plus at12 total/3 categories; next16 complete Explorador at28/5; Golden unlocks there and next24 complete the collection at52/6. Stamps allocated once, chronologically across editions. Diversity checks use whole verified history, so later category discoveries resolve a stalled earlier book. Progression is independent of purchase and old history is retained; corrections recalculate. Heart never contributes to paid benefits or ranks.
- Added public Plus proposal ARS3900/month, same price through earned levels. Plus4 monthly idea examples/3% cap1000, Explorador6/5% cap1500, Golden8/8% cap2500; one eligible titular reservation/month, ARS only, no companions/free/Heart/coupon stacking. Ideas are recommendations, not tickets or supplier availability. Existing3-alternative surprise rule preserved. Same subscription price at higher rank; no shortcut by buying rank.
- Paid service is NOT active: server membershipState always returns Base/prelaunch/active:false/checkoutEnabled:false. There is no recurring subscription billing backend, active real benefit ledger or financial redemption in this version. Need YOLO merchant recurring-payment integration (distinct from marketplace seller OAuth), authenticated paid-period ledger, consent/cancellation/reconciliation, and confirmed financial/supplier benefit conditions before charging. MEMBERSHIP_PLAN.md records research and exact activation gap.
- Real reversible membership interest saved in existing members.state via account CAS; server accepts boolean only plus its own timestamp/offer version. Clients cannot activate membership or choose price/rank. No automatic messages or notifications. Passport API exposes the authenticated member's interest and server offer.
- Added comparison cards, tier benefits, capped discount receipt simulator, complete local-only demonstration of review/express understanding/activation/monthly ideas/nonrenewal. Demo never opens checkout or modifies account. Paid period and booking cancellation are separate; progress survives nonrenewal. Link can preview corresponding fictional booklet. Demo examples interleave available priced catalogue categories and fill count4/6/8 without pretending each idea has reserved stock.
- Commercial hypothesis: recurring price3900 needs real curation value, not savings promise (caps below fee). Maximum discount contribution leaves2900/2400/1400 before processor/tax/support/operations. Unknown costs remain null in margin helper. Official local-club price pages and MercadoPago subscriptions documentation reviewed; sources in MEMBERSHIP_PLAN.md. Price is a proposal, not demand validated or guaranteed profitable.
- QA: new membership unit tests cover caps, currency/nonprofit exclusions, client-entitlement denial and margin unknowns; updated passport tests cover4/12/28/52 and category gates; API tests cover interest-only mutation and passport exposes inactive billing. Existing gamification, Heart, social/payment mocks passed; TypeScript passed. Browser desktop forward/backward busy lifecycle, subscription review/activation/cancellation; actual390px iframe turn, paused motion, membership review/scroll verified. Temporary QA route removed before build. No production booking, subscription, payment, email or sharing changes.

## Fix premature passport image reveal — 29/10/2026
- Root cause: setPage ran at turn start, so the destination image painted on the underlying spread before the leaf landed. Both the base spread and the reverse face also contained the destination photo.
- Keep the current page mounted during the turn. Store the destination in a ref and commit it atomically with overlay removal at animation end (or the existing fallback/motion-pause completion). The reverse is neutral textured paper; no destination content is rendered on it. New photo/text/seals reveal together in a brief whole-spread fade after the turn completes.
- Warm adjacent category photos on opening/navigation with Image.decode so the destination image is normally ready before the reveal. No early target DOM or separate image animation. Existing rapid-click locks, cleanup, paused/reduced motion and server-backed progress retained.
- Browser checks directly inspected actual DOM at busy=true: forward Identity→Gastronomy kept image=null and reverse face had0 images; after busy=false heading/image became Gastronomy/coffee.jpg together. Backward held Gastronomy/coffee.jpg until the turn ended, then Identity/no photo. Repeated at390px; pausing mid-turn completed Culture/city.jpg and cleared busy correctly. TypeScript and whitespace checks passed. Temporary mobile QA route removed before production build. No server, data, billing or audience change.

### 2026-10-29 — Correct destination face during passport turns
- Replaced the neutral reverse with the destination page. Forward leaves carry the new left photo face; backward leaves carry the new right stamp face. A clipped destination underlay reveals the complementary half; the resting spread swaps only when the leaf lands. Equal-width halves align the spine and crops.
- Removed brightness filter from the 3D parent because it flattens preserve-3d; separate backface-hidden, counter-rotated faces keep text/photos upright. No separate photo fade or mirrored old image. Mobile uses the full destination page on the back face.
- Browser visual QA slowed the actual animation temporarily to inspect both directions: new Agua photo appeared upright on the turning leaf, and backward Culture photo/stamps were upright. Restored 780ms timing before publication; existing locking, completion fallback and reduced-motion handling retained. No data, payment or audience changes.
