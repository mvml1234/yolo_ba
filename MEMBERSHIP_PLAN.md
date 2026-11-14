# YOLO Plus — propuesta de lanzamiento, 29/10/2026

## Oferta que muestra el producto
Base gratis, libreta inicial de4 sellos. La cuenta gratuita conserva catálogo, ruleta, modo sorpresa y coordinación; cuatro sellos no equivalen a entradas incluidas ni limitan compras futuras.
Una sola membresía Plus propuesta a ARS3.900 finales por mes. Sin salto promocional oculto, paquete anual ni venta de rangos. El pago activaría ventajas según el rango ganado, empezando por ventajas Plus incluso si todavía está completando Base.

Rangos y progresión desde registros actuales verificados:
- Base: primeras4 salidas; cualquier categoría comercial.
- Plus: siguientes8, objetivo12 acumuladas y3 categorías en el historial.
- Explorador: siguientes16, objetivo28 acumuladas y5 categorías.
- Golden: siguientes24, objetivo52 acumuladas y6 categorías. Golden se desbloquea con28/5, no recién con52.
Las visitas extra ya se almacenan en futuras libretas; cada reserva suma una sola vez. Suscribirse/cancelar no cambia los logros. Los XP continúan como recorrido independiente. Para el corazón, donaciones médicas y voluntariado no generan puntos, sellos ni ventajas comerciales.

## Ventajas propuestas, todavía sin canje
| Nivel de ventajas con Plus activa | Ideas mensuales | Beneficio sobre una reserva del titular | Tope mensual |
| --- | ---: | ---: | ---: |
| Plus |4|3%|ARS1.000|
| Explorador, desde12/3|6|5%|ARS1.500|
| Golden, desde28/5|8|8%|ARS2.500|

Las ideas son recomendaciones, no entradas, turnos confirmados ni actividades incluidas. La regla histórica de hasta3 alternativas por ronda sorpresa sigue intacta.
Una reserva elegible al mes en ARS para una persona titular; no acompañantes, no actividades gratuitas, no Heart, no conversión USD, no acumulación con cupones, no efectivo/saldo transferible. Falta acordar con prestadores la elegibilidad y quién financia cada descuento. El escenario prudente de costos asume aporte100% de YOLO.
No hay invitaciones gratuitas, precios de proveedores o regalos prometidos. Las futuras ventajas Golden especiales se publicarán sólo con acuerdo, cupo y condiciones.

## Precio y límites económicos
Fuentes oficiales consultadas29/10/2026:
- Club LA NACION: https://suscripciones.lanacion.com.ar/club/suscribirme anuncia ARS2.200 mensuales por6 meses y luego ARS22.380; promoción y precio posterior son distintos.
- Clarín365: https://www.clarin.com/suscripciones/landing.html?ob=1 anuncia precios introductorios pero incluye abono adicional desde segundo mes en sus condiciones. No se usa el precio del banner como costo final comparable.
Estas ofertas no validan demanda porYOLO; ARS3.900 es hipótesis para probar un piloto con servicios/beneficios efectivos. No presentar YOLO como el club más barato ni como ahorro garantizado.

Antes de procesador, impuestos, soporte, reembolsos y operación, a uso máximo del beneficio quedarían:
- Plus:3900−1000=ARS2900.
- Explorador:3900−1500=ARS2400.
- Golden:3900−2500=ARS1400.
No son ganancia neta. Costos desconocidos no son cero; membershipMargin devuelve contribución desconocida hasta ingresar todos. No se presupone comisión por reserva: ningún prestador la acordó mediante esta tarea.
El tope de ahorro es menor que la cuota, así que el valor principal debe ser la selección/acompañamiento útil. No cobrar por una promesa de descuentos vacía. Evitar atención manual ilimitada o regalos caros con este precio; medir costo por miembro y retención antes de escalar. Un piloto pago necesita costos finales y valor real confirmado.

## Estado implementado y frontera real
- Pasaporte y progresión reales derivados del servidor; no endpoint para comprar rango.
- Modelo público de precios/beneficios en prelanzamiento; simulador por importe y nivel con topes, sin efecto en checkout.
- Demo de revisión, entendimiento del ejemplo, activación y cancelación de próxima renovación; no tarjeta ni Mercado Pago, no efectos en cuenta. El rango de ejemplo es explícitamente ficticio.
- Interés real y reversible guardado por cuenta en members.state.membershipInterest bajoCAS, únicamente booleano/fecha/versión; no mensajes automáticos. No acepta active/rank/price del cliente.
- /api/passport expone membresía Base inactiva, checkoutEnabled:false. No hay cobros, abonos activos, descuento real o backend de suscripciones recurrentes implementado en esta versión.

## Para activar servicio pago
Requiere cuenta comercial deYOLO distinta de los OAuth de proveedores del marketplace; configurar cobro recurrente y sus notificaciones autenticadas, ledger de cuotas pagadas y vigencia, autorización explícita del comprador, baja de renovación verificable e idempotente, cupón/reserva elegible con aplicación atómica y exclusiones, ajustes ante anulaciones/reembolsos, condiciones fiscales/comerciales finales y acuerdos de proveedores.
No reutilizar la preferencia CheckoutPro de reservas como si fuese una suscripción ni el token de un prestador para cobrar la membresía deYOLO.
Mercado Pago oficial:
- Crear preapproval: https://www.mercadopago.com.ar/developers/es/reference/online-payments/subscriptions/create-preapproval/post
- Gestión: https://www.mercadopago.com.ar/developers/es/docs/subscriptions/subscription-management
La documentación distingue pausar/cancelar/reactivar; el estado autorizado no prueba que una cuota esté pagada. Antes del alta real, ensayar pagos, cuotas fallidas, duplicados, vigencia y baja; un regreso del navegador o una bandera del cliente nunca activa ventajas financieras.
El acceso de la web sigue siendo privado. Sin publicación accesible para las notificaciones y autorización de apertura, no intentar recibir webhooks de Mercado Pago.
