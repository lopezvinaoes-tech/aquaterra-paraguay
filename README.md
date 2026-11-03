# Aquaterra Paraguay

Web de inmuebles en Asunción (Paraguay) explicados para residentes en España.

## Publicar en Vercel

1. Sube **el contenido de esta carpeta** a un repositorio de GitHub (con `index.html` en la raíz).
2. En vercel.com → **Add New → Project** → elige el repositorio → **Deploy** (sin framework ni build).
3. Cada cambio en GitHub se publica solo.

## Estructura

```
index.html                     Entrada (abre la web principal)
Aquaterra Paraguay v5.dc.html  Web principal
PropertyCard / ArticleCard / LeadForm .dc.html   Componentes
Video Departamento.dc.html     Vídeo animado de la ficha
  video-apartamento.jsx, animations-v3.jsx
ascenso3d.html                 Portada 3D (vuelo de dron)
globo.html                     Globo Madrid – Asunción
aq-data-asuncion.js            Datos (inmuebles, artículos, FAQ)
aq-3d.js                       Gráficos y mapa 3D
aquaterra-theme.css            Tema (día / noche)
image-slot.js, support.js      Runtime
assets/                        Icono, vídeo de respaldo, img/ (fotos WebP 1200×800)
_ds/                           Sistema de diseño (no editar)
docs/                          Auditoría y tareas
vercel.json                    Caché y cabeceras
```

## Funciones

Modo día/noche · conversor USD/EUR/PYG · mapa de inmuebles · comparador en Propiedades · simulador de financiación · horarios Paraguay–España · galería tipo baraja · buscador con asistente.

Todos los inmuebles y precios son de demostración. Las fotos son de stock con fines ilustrativos.
