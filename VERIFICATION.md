# Habilitación de planes pagos

El catálogo de investigación se conserva completo en app/lib/catalog.json. No equivale a oferta comercial habilitada. Al 29/10/2026 ningún proveedor tiene un acuerdo comercial confirmado registrado, por eso no hay planes pagos visibles, solicitables ni elegibles para ruleta/sorpresa.

Para habilitar una ficha agregar `verification` sólo con aceptación documentada: status verified, provider idéntico a la ficha, price y currency idénticos al precio final, unit person, taxesIncluded true, commercialAgreement true, paymentAuthorized true, evidenceUrl HTTPS, includes, policy, bookingTerms, verifiedAt ISO y validUntil ISO futuro. Un contacto o precio relevado no satisface estos requisitos. Ante vencimiento/cambio de precio la ficha sale automáticamente de la oferta. No existe un botón administrativo que lo saltee.

Antes de cobrar se vuelven a verificar ficha, precio, moneda, proveedor, vigencia, consentimiento, disponibilidad y conexión de Mercado Pago. La conexión con Mercado Pago sigue siendo un requisito independiente. Las solicitudes históricas se conservan para consulta y cancelación, pero no habilitan nuevos cobros sin verificación vigente.

Para el corazón sigue visible, gratis, con inscripción directa. /demo usa un plan ficticio y no envía ni cobra. No se muestran enlaces comerciales de proveedores pendientes. El CSV público sólo contiene fichas visibles; regenerar con scripts/export-public-catalog.mjs al actualizar la investigación.
