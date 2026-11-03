# Aquaterra Paraguay — árbol de tareas

Leyenda: ✅ completada · 🟡 parcial (prototipo) · ⛔ bloqueada

## 01. Auditoría de la referencia
- ⛔ Auditoría de La Dolce Casa — falta la URL exacta. Ver `docs/REFERENCE_AUDIT.md`.

## 02. Arquitectura y diseño
- ✅ Sitemap con rutas limpias (hash en prototipo): `#/`, `#/propiedades`, `#/buscar`, `#/propiedad/:slug`, `#/zonas`, `#/espana-paraguay`, `#/guias`, `#/blog`, `#/blog/:slug`, `#/faq`, `#/nosotros`, `#/contacto`, `#/legal/{aviso|privacidad|cookies|condiciones}`, `#/cookies`, `#/manual`, `#/admin`, 404.
- ✅ Sistema visual: Organic + `aquaterra-theme.css` (azul cielo, títulos negro/blanco).
- ✅ Responsive (menú móvil < 1180 px, rejillas fluidas).

## 03. Frontend
- ✅ Cabecera, menú principal, menú móvil, migas de pan, footer en 4 columnas.
- ✅ Inicio: vídeo a pantalla completa, buscador, destacadas, zonas, proceso, España–Paraguay, blog, FAQ, contacto.
- ✅ Catálogo: texto, zona, tipo, precio mín./máx., dormitorios, orden, paginación, limpiar, contador, estado vacío, filtros en la URL.
- ✅ Ficha: galería, datos, descripción, características, ubicación (sin mapa hasta verificar coordenadas), documentación, relacionadas, formulario.
- ✅ Blog con categorías, buscador, artículo con índice, fechas, autor, CTA y relacionados.

## 04. Backend y datos
- 🟡 Datos en `aq-data.js` (DEMO) + cambios del panel en `localStorage`. Pendiente: Supabase (credenciales).
- 🟡 Autenticación simulada (admin / editor). Pendiente: Supabase Auth + RLS en servidor.
- ✅ Panel: solicitudes (estados, detalle, CSV, supresión), propiedades (crear/editar/publicar/archivar), artículos (publicar/borrador), FAQ (añadir/ocultar), ajustes.

## 05. IA
- ✅ Asistente con IA (solo en este entorno): contexto de la web + herramienta `buscar_inmuebles` sobre datos reales del catálogo, límite 20 mensajes, derivación a asesor.
- ✅ Manual de usuario desde el inventario de rutas + guía rápida generada con IA (marcada como borrador), imprimible.
- ⛔ Producción: proveedor de IA vía backend propio (clave en servidor).

## 06. SEO
- ✅ Title, description, robots, canonical, Open Graph y JSON-LD (Organization, BreadcrumbList, Article, FAQPage) por ruta.
- ⛔ sitemap.xml / robots.txt / SSR: requieren dominio y despliegue.

## 07. España–Paraguay
- ✅ Globo interactivo (d3, teclado, reduced-motion, fallback), relojes y distancia calculados, comparativa con fuente por fila, asesoramiento.

## 08. Legal y privacidad
- 🟡 Textos legales en borrador con campos [PENDIENTE]; requieren revisión jurídica.
- ✅ Banner con Aceptar/Rechazar equivalentes, preferencias editables, analítica solo con consentimiento.

## 09. Pruebas
- 🟡 Revisión en navegador del prototipo. Sin suite automatizada (no hay repositorio de código).
