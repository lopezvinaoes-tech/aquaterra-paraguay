/* Aquaterra Paraguay (solo Asunción) — fuente de contenido del prototipo.
   TODOS los inmuebles, precios y fotos son DATOS DE DEMOSTRACIÓN.
   En producción esta capa se sustituye por la API (Supabase/PostgreSQL), ver docs/ARCHITECTURE.md */
window.AQ_DATA = (function () {
    var M = {
    asuncion: [["1708007736300-89c16fa57b40","Tobias Meza","tobimezaa"],["1649275579015-5092d2ffcf2b","Alan Martinez","alansmart"],["1655775130751-981a0e343d6f","Anton Lukin","antonlukin"],["1732357284464-c9e438f2934e","André Piske","andrepiske"],["1646837599653-e39f2be8a310","Alan Martinez","alansmart"],["1600299712992-9619c73f63f3","Maurício Guardiano","duascaras"],["1548438195-5c4d002c69b0","Diego Rodriguez","diegorodriguez"],["1620736663824-18f7d3a79d54","Diego Allen","dalleng"]],
    pisos: [["1583847268964-b28dc8f51f92","Minh Pham","minhphamdesign"],["1628592102751-ba83b0314276","Huy Nguyen","huynguyen_pch"],["1484154218962-a197022b5858","Naomi Hébert","naomish"],["1653972233229-1b8c042d6d8e","dada design","dada_design"],["1624204386084-dd8c05e32226","Tobias Wilden","tobiasw"],["1515263487990-61b07816b324","Luke van Zyl","lukevz"],["1662454419716-c4c504728811","mahmoud azmy","mahmoud_azmy"],["1664372623516-0b1540d6771e","Lotus Design N Print","lotusdnp"],["1530877872966-40bb5529f558","Jonas Denil","jonasdenil"]],
    casas: [["1721815693498-cc28507c0ba2","Naksha Banwao","nakshabanwao"],["1580587771525-78b9dba3b914","Yaroslav Alekseenko","webaliser"],["1758448756207-54505680d130","Aalo Lens","aalolens"],["1613490493576-7fde63acd811","Avi Werde","aviwerde"],["1600596542815-ffad4c1539a9","Frames For Your Heart","framesforyourheart"],["1613977257363-707ba9348227","John Fornander","johnfo"],["1706808849780-7a04fbac83ef","Salman Saqib","salmansaqib"],["1758565811176-ccd94357a844","Caroline Badran","___atmos"],["1758565810954-7c97ad680715","Caroline Badran","___atmos"]]
  };
  function ph(set, i) {
    if (!set || !M[set] || !M[set][i]) return { img: '', credit: '', creditHref: '' };
    return { img: 'assets/img/' + set + '-' + i + '.webp', credit: '', creditHref: '' };
  }

  var zones = [
    { slug: 'villa-morra', name: 'Villa Morra', dept: 'Asunción', photo: ph('asuncion', 5), text: 'Barrio residencial y comercial de Asunción. Concentra edificios de departamentos, centros comerciales, restaurantes y oficinas.' },
    { slug: 'eje-corporativo', name: 'Eje corporativo', dept: 'Asunción', photo: ph('asuncion', 1), text: 'Corredor de las avenidas Aviadores del Chaco y Santa Teresa, con torres de oficinas, hoteles y proyectos residenciales en altura.' },
    { slug: 'centro', name: 'Centro', dept: 'Asunción', photo: ph('asuncion', 3), text: 'Casco histórico junto a la bahía y el río Paraguay, con edificios de gobierno, comercios y unidades compactas en edificios de distintas épocas.' }
  ];

  function P(o) { o.published = o.published !== false; return o; }
  var properties = [
    P({ id: 'AQ-001', slug: 'departamento-dos-dormitorios-villa-morra', title: 'Departamento de dos dormitorios en Villa Morra', type: 'Departamento', zone: 'villa-morra', barrio: 'Villa Morra', status: 'Disponible', price: 168000, beds: 2, baths: 2, area: 98, lot: null, year: 2023, updated: '2026-09-28', featured: true, photos: [ph('pisos', 0), ph('pisos', 2), ph('pisos', 6)], desc: 'Departamento en planta alta con salón comedor integrado, cocina abierta y balcón. Edificio con portería y estacionamiento cubierto. Zona de comercios, restaurantes y oficinas.', feats: ['Balcón con parrilla', 'Cocina integrada', '1 estacionamiento cubierto', 'Portería 24 h', 'Ascensor'], docs: ['Plano de la unidad (bajo solicitud)', 'Reglamento de copropiedad (bajo solicitud)'] }),
    P({ id: 'AQ-004', slug: 'proyecto-torre-residencial-en-asuncion', title: 'Torre residencial en preventa, Asunción', type: 'Proyecto', zone: 'eje-corporativo', barrio: 'Eje corporativo', status: 'En preventa', price: 120000, priceFrom: true, beds: 1, baths: 1, area: 52, lot: null, year: null, delivery: '2028 (estimada por el promotor)', updated: '2026-10-02', featured: true, photos: [ph('pisos', 4), ph('pisos', 3), ph('pisos', 7)], desc: 'Proyecto de departamentos de uno a tres dormitorios con amenities comunes. Precio y plazo de entrega según información del promotor, pendientes de verificación documental.', feats: ['Unidades de 1 a 3 dormitorios', 'Piscina y gimnasio comunes', 'Cowork en planta baja', 'Entrega estimada 2028'], docs: ['Memoria del proyecto (bajo solicitud)', 'Plan de pagos del promotor (bajo solicitud)'] }),
    P({ id: 'AQ-008', slug: 'monoambiente-en-asuncion', title: 'Monoambiente equipado en Asunción', type: 'Departamento', zone: 'centro', barrio: 'Centro', status: 'Disponible', price: 74000, beds: 1, baths: 1, area: 45, lot: null, year: 2022, updated: '2026-09-02', featured: false, photos: [ph('pisos', 1), ph('pisos', 5), ph('pisos', 8)], desc: 'Unidad compacta amueblada, en edificio con amenities. Adecuada como primera vivienda o pied-à-terre.', feats: ['Amueblado', 'Piscina en azotea', 'Lavandería común'], docs: [] }),
  ];

  var articles = [
    { slug: 'comprar-inmueble-en-paraguay-desde-espana', cat: 'Proceso', title: 'Comprar un inmueble en Paraguay desde España: el proceso, paso a paso', excerpt: 'De la primera consulta a la inscripción en Registros Públicos: qué ocurre en cada fase y quién interviene.', date: '2026-06-12', updated: '2026-09-30', mins: 7, photo: ph('asuncion', 0), legal: true, published: true, sections: [
      { h: 'Antes de mirar fichas', p: ['Define para qué quieres el inmueble —vivienda, segunda residencia o inversión— y con qué plazo. Esa decisión cambia la zona, el tipo de inmueble y las preguntas que conviene hacer.', 'Si resides en España, ten en cuenta también tus obligaciones fiscales allí. Consulta con un asesor fiscal antes de comprometerte.'] },
      { h: 'Selección y verificación', p: ['Una ficha no sustituye a la documentación. Antes de reservar, pide el título de propiedad y un informe actualizado de condiciones de dominio emitido por la Dirección General de los Registros Públicos.', 'Lo recomendable es que un escribano público independiente revise la documentación por ti.'] },
      { h: 'Firma e inscripción', p: ['En Paraguay, la transmisión de inmuebles se formaliza en escritura pública ante escribano y se inscribe en Registros Públicos. Si no puedes viajar, puedes otorgar un poder; normalmente requiere apostilla de La Haya. Confírmalo con el escribano.'] }
    ] },
    { slug: 'como-leer-un-precio-en-paraguay', cat: 'Costes y trámites', title: 'Cómo leer un precio inmobiliario en Paraguay', excerpt: 'Dólares, guaraníes y lo que suele quedar fuera del precio anunciado.', date: '2026-07-03', updated: '2026-09-12', mins: 5, photo: ph('asuncion', 2), legal: true, published: true, sections: [
      { h: 'La moneda', p: ['La moneda oficial de Paraguay es el guaraní (PYG), pero muchos inmuebles se anuncian en dólares estadounidenses (USD). En esta web, todos los precios se expresan en USD e indican su fecha de actualización.', 'Si piensas en euros, recuerda que el tipo de cambio varía: cualquier conversión es orientativa.'] },
      { h: 'Qué suele no estar incluido', p: ['Honorarios del escribano, impuestos y tasas de inscripción, gastos de transferencia bancaria internacional y, en su caso, comisión de intermediación. Pide siempre un desglose por escrito.'] },
      { h: 'Precios en proyectos', p: ['En proyectos en preventa, el precio «desde» corresponde a la unidad más económica. Comprueba el plan de pagos, el plazo de entrega comprometido y qué ocurre si se retrasa.'] }
    ] },
    { slug: 'escribano-y-registros-publicos', cat: 'Costes y trámites', title: 'El escribano y los Registros Públicos: quién hace qué', excerpt: 'Las figuras que dan seguridad jurídica a una compraventa en Paraguay, explicadas para lectores españoles.', date: '2026-07-21', updated: '2026-07-21', mins: 6, photo: ph('asuncion', 4), legal: true, published: true, sections: [
      { h: 'El escribano público', p: ['Es el profesional que autoriza la escritura pública de compraventa. Su papel recuerda al del notario en España, aunque las funciones no son idénticas. Puedes elegir un escribano de tu confianza.'] },
      { h: 'Registros Públicos', p: ['La Dirección General de los Registros Públicos inscribe la titularidad de los inmuebles. Un informe de condiciones de dominio permite conocer el titular registral y si existen gravámenes.'] },
      { h: 'Qué pedir', p: ['Título de propiedad, informe de condiciones de dominio reciente, certificado de no adeudo de impuesto inmobiliario municipal y, en propiedad horizontal, el reglamento de copropiedad.'] }
    ] },
    { slug: 'comprar-a-distancia-desde-espana', cat: 'Guías prácticas', title: 'Comprar a distancia: visitas, poderes y comunicación', excerpt: 'Si no puedes viajar en cada fase, estas son las piezas que conviene organizar con tiempo.', date: '2026-08-19', updated: '2026-08-19', mins: 6, photo: ph('asuncion', 6), legal: false, published: true, sections: [
      { h: 'Visitas por videollamada', p: ['Pide una visita en directo, no un vídeo editado. Solicita ver los accesos, el entorno, los medidores y las zonas comunes.'] },
      { h: 'Diferencia horaria', p: ['Paraguay mantiene el horario UTC−3 todo el año; la diferencia con la España peninsular es de 4 o 5 horas según la época del año. Agenda las llamadas a primera hora de la tarde en España.'] },
      { h: 'Poderes y documentos', p: ['Un poder otorgado en España suele necesitar apostilla para tener efectos en Paraguay. Prepara también copias legalizadas de tu documentación. Tu escribano te dirá exactamente qué necesita.'] }
    ] },
    { slug: 'preguntas-antes-de-pagar-una-reserva', cat: 'Guías prácticas', title: 'Diez preguntas antes de pagar una reserva', excerpt: 'Una reserva compromete dinero. Estas preguntas evitan la mayoría de sorpresas.', date: '2026-10-01', updated: '2026-10-01', mins: 4, photo: ph('asuncion', 7), legal: true, published: true, sections: [
      { h: 'Sobre el inmueble', p: ['¿Quién es el titular registral? ¿Existen gravámenes o embargos? ¿Coincide la superficie construida con la documentada?'] },
      { h: 'Sobre la reserva', p: ['¿Es reembolsable y en qué supuestos? ¿Quién custodia el dinero? ¿Qué plazo hay hasta la escritura? ¿Qué gastos asume cada parte?'] },
      { h: 'Sobre ti', p: ['¿Cómo vas a transferir los fondos? ¿Has consultado tus obligaciones fiscales en España? ¿Quién te representará si no puedes viajar?'] }
    ] }
  ];

  var guides = [
    { id: 'checklist', title: 'Checklist antes de comprar', desc: 'Los documentos y comprobaciones que conviene tener antes de cualquier pago.', items: ['Título de propiedad e informe de condiciones de dominio', 'Certificado de no adeudo del impuesto inmobiliario', 'Plano y superficie verificada', 'Desglose de gastos por escrito', 'Escribano independiente elegido por ti'] },
    { id: 'precio', title: 'Cómo leer un precio en Paraguay', desc: 'Monedas, qué incluye el precio y qué no, y cómo comparar entre zonas.', items: ['USD frente a guaraníes (PYG)', 'Gastos que no suelen estar incluidos', 'Precios «desde» en proyectos', 'Conversiones a euros: siempre orientativas'] },
    { id: 'distancia', title: 'Comprar a distancia desde España', desc: 'Visitas, poderes, apostilla y comunicación con diferencia horaria.', items: ['Visitas en directo por videollamada', 'Poder notarial y apostilla de La Haya', 'Calendario con 4–5 h de diferencia', 'Transferencias internacionales'] }
  ];

  var faqs = [
    { id: 'f1', cat: 'Sobre Aquaterra', q: '¿Qué es Aquaterra Paraguay?', a: 'Una plataforma que reúne oferta inmobiliaria en Paraguay y la explica a personas residentes en España: moneda, jurisdicción y fecha de actualización en cada ficha, y un asesor para resolver dudas.', visible: true },
    { id: 'f2', cat: 'Sobre Aquaterra', q: '¿Los inmuebles de esta web son reales?', a: 'No en esta versión. Es un prototipo: los inmuebles, precios y fotografías son de demostración y están señalados como tales.', visible: true },
    { id: 'f3', cat: 'Sobre Aquaterra', q: '¿Cuánto cuesta la consulta?', a: 'Las condiciones comerciales están pendientes de publicar. Te las indicaremos por escrito antes de cualquier compromiso.', visible: true },
    { id: 'f4', cat: 'Proceso desde España', q: '¿Puedo comprar en Paraguay sin residir allí?', a: 'Con carácter general, una persona extranjera puede adquirir inmuebles urbanos en Paraguay. Existen limitaciones para determinados inmuebles rurales en la franja de seguridad fronteriza. Confirma tu caso concreto con un escribano.', visible: true },
    { id: 'f5', cat: 'Proceso desde España', q: '¿En qué moneda se paga?', a: 'La moneda oficial es el guaraní (PYG), pero muchos inmuebles se anuncian y pagan en dólares (USD). En esta web, todos los precios están en USD.', visible: true },
    { id: 'f6', cat: 'Proceso desde España', q: '¿Tengo que viajar para firmar?', a: 'No necesariamente. Puedes otorgar un poder a una persona de confianza; un poder otorgado en España suele requerir apostilla. Tu escribano te indicará los requisitos.', visible: true },
    { id: 'f7', cat: 'Proceso desde España', q: '¿Cómo compruebo que el vendedor es el titular?', a: 'Con un informe de condiciones de dominio reciente de la Dirección General de los Registros Públicos, revisado por un escribano.', visible: true },
    { id: 'f8', cat: 'Propiedades', q: '¿Los precios están actualizados?', a: 'Cada ficha indica su fecha de actualización. Los precios pueden cambiar y solo son firmes cuando el vendedor los confirma por escrito.', visible: true },
    { id: 'f9', cat: 'Propiedades', q: '¿Por qué algunas fichas no tienen mapa?', a: 'Solo mostramos el mapa cuando las coordenadas están verificadas. Mientras tanto, indicamos la zona y el barrio.', visible: true },
    { id: 'f10', cat: 'Privacidad', q: '¿Qué hacéis con mis datos?', a: 'Solo los usamos para responder a tu solicitud, con tu consentimiento. Puedes consultar la política de privacidad y pedir su supresión en cualquier momento.', visible: true },
    { id: 'f11', cat: 'Privacidad', q: '¿El asistente guarda mis conversaciones?', a: 'En este prototipo, la conversación solo se mantiene en la pestaña abierta. Los mensajes se envían al proveedor de IA para generar la respuesta. No escribas datos sensibles.', visible: true },
    { id: 'f12', cat: 'Privacidad', q: '¿Cómo cambio mis preferencias de cookies?', a: 'En cualquier momento desde «Preferencias de cookies», en el pie de página.', visible: true }
  ];

  var steps = [
    { n: '01', t: 'Explora', d: 'Filtra el catálogo por zona, tipo y presupuesto. Cada ficha indica moneda y fecha de actualización.' },
    { n: '02', t: 'Pregunta', d: 'Un asesor responde por escrito con la información disponible y lo que falta por confirmar.' },
    { n: '03', t: 'Verifica', d: 'Un escribano independiente revisa título, condiciones de dominio y deudas antes de cualquier pago.' },
    { n: '04', t: 'Visita', d: 'En persona o por videollamada en directo, con acceso al entorno y zonas comunes.' },
    { n: '05', t: 'Firma', d: 'Escritura pública ante escribano e inscripción en Registros Públicos, presencial o mediante poder.' }
  ];

  var compare = [
    { k: 'Moneda', es: 'Euro (EUR)', py: 'Guaraní (PYG). Muchos inmuebles se anuncian en USD', src: 'Banco de España · Banco Central del Paraguay' },
    { k: 'Fedatario', es: 'Notario', py: 'Escribano público', src: 'Consejo General del Notariado · Colegio de Escribanos del Paraguay' },
    { k: 'Registro de inmuebles', es: 'Registro de la Propiedad', py: 'Dirección General de los Registros Públicos', src: 'Colegio de Registradores · Poder Judicial del Paraguay' },
    { k: 'Administración tributaria', es: 'Agencia Tributaria (AEAT)', py: 'Dirección Nacional de Ingresos Tributarios (DNIT)', src: 'agenciatributaria.gob.es · dnit.gov.py' },
    { k: 'Huso horario', es: 'CET / CEST (UTC+1 / +2)', py: 'UTC−3 todo el año', src: 'Calculado en tu navegador (IANA tz)' }
  ];

  var site = {
    brand: 'Aquaterra Paraguay',
    legalName: null, taxId: null, address: null, email: null, phoneES: null, phonePY: null, whatsapp: null, hours: null, socials: [],
    origin: 'https://DOMINIO-PENDIENTE'
  };

  var routes = [
    { path: '#/', label: 'Inicio', what: 'Portada con buscador rápido, propiedades destacadas, zonas, proceso y contacto.', how: ['Elige zona y tipo en el buscador de la portada y pulsa «Buscar».', 'Desliza para ver destacadas, zonas, el proceso y el formulario de contacto.'] },
    { path: '#/propiedades', label: 'Propiedades', what: 'Catálogo con búsqueda por texto, filtros, orden y paginación.', how: ['Escribe una palabra clave (barrio, tipo…) en «Buscar».', 'Combina zona, tipo, precio mínimo/máximo y dormitorios; el contador se actualiza al instante.', 'Cambia el orden en «Ordenar».', 'Usa «Limpiar filtros» para volver al listado completo.', 'La dirección de la página guarda tus filtros: puedes copiarla y compartirla.'] },
    { path: '#/propiedad/…', label: 'Ficha de propiedad', what: 'Galería, datos, descripción, documentación, propiedades relacionadas y formulario de consulta.', how: ['Abre una ficha desde cualquier tarjeta («Ver ficha»).', 'Revisa el bloque «Antes de decidir»: moneda, jurisdicción y recomendaciones.', 'Envía tu pregunta con el formulario lateral; la referencia del inmueble se adjunta sola.'] },
    { path: '#/zonas', label: 'Zonas', what: 'Los barrios de Asunción con oferta publicada y acceso al catálogo filtrado.', how: ['Pulsa «Ver inmuebles» en un barrio para abrir el catálogo ya filtrado.'] },
    { path: '#/espana-paraguay', label: 'Desde España', what: 'Globo interactivo, comparativa de jurisdicciones, proceso a distancia y solicitud de asesoramiento.', how: ['Arrastra el globo o usa las flechas del teclado para girarlo.', 'Consulta la tabla comparativa: cada fila indica jurisdicción y fuente oficial.', 'Pide asesoramiento con el formulario final.'] },
    { path: '#/guias', label: 'Guías', what: 'Guías prácticas y solicitud de guía descargable.', how: ['Despliega una guía para ver su contenido.', 'Pide la versión descargable con el formulario (se avisará al publicarla).'] },
    { path: '#/blog', label: 'Blog', what: 'Artículos con buscador y categorías.', how: ['Filtra por categoría o escribe en el buscador.', 'Dentro de un artículo, usa el índice lateral para saltar entre apartados.'] },
    { path: '#/faq', label: 'Preguntas frecuentes', what: 'Respuestas agrupadas por tema con buscador.', how: ['Escribe una palabra para filtrar las preguntas.'] },
    { path: '#/contacto', label: 'Contacto', what: 'Formulario de consulta general y canales oficiales.', how: ['Rellena nombre, correo y mensaje, acepta la política de privacidad y envía.', 'Los errores se señalan junto a cada campo.'] },
    { path: '#/cookies', label: 'Preferencias de cookies', what: 'Activa o desactiva categorías opcionales en cualquier momento.', how: ['Elige «Aceptar todo», «Rechazar todo» o configura cada categoría y guarda.'] },
    { path: 'Asistente', label: 'Asistente con IA', what: 'Botón «Asistente» abajo a la derecha. Responde con el contenido de esta web.', how: ['Abre el asistente y escribe tu pregunta o pulsa una sugerencia.', 'Si necesitas a una persona, pulsa «Hablar con un asesor» dentro del chat.', 'No compartas datos sensibles. Límite de 20 mensajes por sesión.'] }
  ];

  var adminManual = [
    { label: 'Acceso', how: ['Entra en #/admin con tu usuario. En el prototipo: admin@demo.local / demo1234 (administrador) o editor@demo.local / demo1234 (editor).', 'El editor no ve solicitudes ni ajustes.'] },
    { label: 'Solicitudes', how: ['Filtra por estado o tipo, abre una fila para ver el mensaje y el registro de consentimiento.', 'Cambia el estado: Nuevo → Pendiente de revisión → Contactado → En seguimiento → Cerrado.', 'Exporta CSV o elimina una solicitud si el interesado lo pide.'] },
    { label: 'Propiedades', how: ['«Nueva propiedad» abre el formulario; los campos obligatorios se validan.', 'Publica, despublica o archiva; el catálogo público se actualiza al momento.'] },
    { label: 'Artículos y FAQ', how: ['Cambia un artículo entre Publicado y Borrador.', 'Añade preguntas frecuentes o ocúltalas.'] },
    { label: 'Ajustes', how: ['Muestra u oculta el aviso de demostración, consulta los eventos de analítica registrados con consentimiento y restablece los datos demo.'] }
  ];

  var legal = {
    aviso: { title: 'Aviso legal', blocks: [
      { h: 'Titular del sitio web', p: ['Denominación social: [PENDIENTE]. NIF/RUC: [PENDIENTE]. Domicilio: [PENDIENTE]. Correo de contacto: [PENDIENTE]. Datos registrales: [PENDIENTE].'] },
      { h: 'Objeto', p: ['Este sitio ofrece información sobre inmuebles situados en la República del Paraguay y permite solicitar información. No constituye oferta vinculante ni asesoramiento jurídico, fiscal o financiero.'] },
      { h: 'Responsabilidad', p: ['Los datos de cada inmueble proceden de sus propietarios o promotores y se publican con su fecha de actualización. Deben verificarse documentalmente antes de cualquier decisión.'] },
      { h: 'Legislación aplicable', p: ['[PENDIENTE de determinar por asesoría jurídica: jurisdicción del titular y marco aplicable (p. ej., LSSI-CE en España).]'] }
    ] },
    privacidad: { title: 'Política de privacidad', blocks: [
      { h: 'Responsable del tratamiento', p: ['[PENDIENTE: identidad y datos de contacto del responsable y, en su caso, del delegado de protección de datos.]'] },
      { h: 'Qué datos tratamos y para qué', p: ['Nombre, correo electrónico, teléfono (opcional), país y el contenido de tu mensaje, con la única finalidad de responder a tu solicitud.', 'Si usas el asistente con IA, el texto que escribes se envía al proveedor de IA para generar la respuesta.'] },
      { h: 'Base jurídica', p: ['Tu consentimiento, que puedes retirar en cualquier momento. Registramos la fecha y la versión del texto aceptado.'] },
      { h: 'Conservación', p: ['[PENDIENTE: plazo de conservación definido por el responsable.]'] },
      { h: 'Destinatarios y transferencias', p: ['[PENDIENTE: proveedores de alojamiento, base de datos, correo e IA, y garantías aplicables a transferencias internacionales, incluidas las que puedan realizarse a Paraguay.]'] },
      { h: 'Tus derechos', p: ['Acceso, rectificación, supresión, oposición, limitación y portabilidad, escribiendo a [PENDIENTE]. Si resides en España, puedes reclamar ante la Agencia Española de Protección de Datos.'] }
    ] },
    cookies: { title: 'Política de cookies', blocks: [
      { h: 'Qué usamos', p: ['Este sitio usa almacenamiento local del navegador. No carga publicidad ni analítica de terceros. La analítica propia solo se activa si la aceptas.'] }
    ], table: [
      ['aq_consent', 'Necesaria', 'Guarda tus preferencias de cookies', '12 meses'],
      ['aq_leads · aq_submit_log', 'Necesaria (prototipo)', 'Guarda en este navegador las solicitudes enviadas y limita envíos repetidos', 'Hasta borrar el navegador'],
      ['aq_session', 'Necesaria', 'Mantiene la sesión del panel de administración', 'Sesión'],
      ['aq_cms_*', 'Necesaria (prototipo)', 'Cambios realizados desde el panel', 'Hasta restablecer'],
      ['aq_events', 'Analítica', 'Eventos de uso anónimos (páginas vistas, búsquedas, envíos)', '30 días']
    ] },
    condiciones: { title: 'Condiciones de uso', blocks: [
      { h: 'Uso del sitio', p: ['El usuario se compromete a facilitar datos veraces y a no utilizar los formularios o el asistente con fines ilícitos o para enviar contenido malicioso.'] },
      { h: 'Contenidos', p: ['Las guías y artículos son informativos y generales. Las cuestiones jurídicas, fiscales o financieras deben consultarse con un profesional habilitado.'] },
      { h: 'Propiedad intelectual', p: ['[PENDIENTE: titularidad de marca, textos e imágenes. Las fotografías actuales son de Unsplash y se muestran con atribución.]'] }
    ] }
  };

  return { zones: zones, properties: properties, articles: articles, guides: guides, faqs: faqs, steps: steps, compare: compare, site: site, routes: routes, adminManual: adminManual, legal: legal, version: '0.3.0', updated: '2026-10-16' };
})();
