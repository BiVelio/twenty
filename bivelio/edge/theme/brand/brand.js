/* ==========================================================================
   brand.js — marca «CRM by BiVelio» sobre Twenty v2.45.0 (núcleo SIN modificar)

   Lo inyecta el edge (caddy.snippet, replace-response) como
   <script src="/bivelio/brand/brand.js" defer> antes de </head>. Mismo origen:
   vale con cualquier CSP que permita 'self' (hoy ni Twenty ni el snippet fijan
   script-src). Solo toca lo que Twenty no deja configurar:

   1. Título de la pestaña. Twenty lo pone con react-helmet: «Twenty» por
      defecto (title-utils.ts → default) y «<Página> - Settings» en ajustes.
      Aquí: «Twenty»/vacío → «CRM by BiVelio»; el resto → «<título> · CRM by BiVelio».
   2. Favicon. Twenty usa el logo del workspace (bootstrap.sh lo sube); si falta,
      cae a un PNG de twentyhq.github.io (bloqueado por la CSP img-src): se cambia
      por el isotipo de BiVelio.
   3. Rutas de acceso (/welcome, /verify, /invite/…, /reset-password/…):
      - html[data-bivelio-auth] para el CSS del tema;
      - el título «Bienvenido, CRM by BiVelio.» (texto de Twenty con el nombre del
        workspace) se marca con data-bivelio-wordmark y el CSS lo pinta como el
        wordmark (CRM en Geist 600 + « by BiVelio» en Onest 500).
   4. Pie «Código fuente · AGPL-3.0» en TODAS las rutas (decisión crm-1): enlace al
      fork público BiVelio/twenty. En el acceso, como hasta ahora; dentro de la app,
      más pequeño (twenty-theme.css). El mismo enlace está en One, Ajustes › Créditos y
      licencias (apps/web/src/features/perfil-ajustes/lib/creditos.ts: CRM_SOURCE_URL;
      una prueba de One comprueba que los dos coinciden). Cómo publicar en el fork la
      versión exacta desplegada: infra/crm/fork/README.md.

   Nunca crea, mueve ni borra nodos del árbol de React (#root): solo atributos
   data-* y el título del documento. El enlace AGPL cuelga de <body>, fuera de #root.
   Idempotente: cada pasada comprueba antes de escribir (sin bucles con Helmet).
   ========================================================================== */
(function () {
  'use strict';

  var BRAND = 'CRM by BiVelio';
  var SEP = ' · ';
  var FAVICON = '/bivelio/brand/icon-48.png';
  // Fork público con el código de la versión desplegada (AGPL-3.0 §13): la rama exacta
  // bivelio/v2.45.0 (infra/crm/fork/README.md). El mismo enlace que CRM_SOURCE_URL de creditos.ts.
  var SOURCE_URL = 'https://github.com/BiVelio/twenty/tree/bivelio/v2.45.0';
  // «Welcome, CRM by BiVelio.» / «Bienvenido, CRM by BiVelio.»: con la coma del saludo.
  // No casa «Entra en CRM by BiVelio» (fSPjtl, reescrito en el edge) ni
  // «Bienvenido a CRM by BiVelio» (nTuObL): esos se leen como frase, no como logotipo.
  var WELCOME = /,\s*CRM by BiVelio\.?$/;
  var AUTH_PATH = /^\/(welcome|verify|verify-email|invite\/|reset-password\/)/;

  function fixTitle() {
    var t = (document.title || '').trim();
    if (t === BRAND || t.slice(-(SEP.length + BRAND.length)) === SEP + BRAND) return;
    var base = t.replace(/\s*[-|·]\s*Twenty$/, '');
    var want = base === '' || base === 'Twenty' ? BRAND : base + SEP + BRAND;
    if (document.title !== want) document.title = want;
  }

  function fixFavicon() {
    var links = document.querySelectorAll('link[rel~="icon"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      if (href.indexOf('twentyhq.github.io') !== -1 || href === '') {
        links[i].setAttribute('href', FAVICON);
      }
    }
  }

  function sourceLink() {
    var a = document.getElementById('bivelio-source');
    if (a || !document.body) return;
    a = document.createElement('a');
    a.id = 'bivelio-source';
    a.href = SOURCE_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = 'Twenty v2.45.0 — GNU AGPL-3.0. Código publicado por BiVelio';
    a.textContent = 'Código fuente · AGPL-3.0';
    document.body.appendChild(a);
  }

  // Marca como wordmark el elemento cuyo texto propio es el título de bienvenida
  // con el nombre del workspace. Solo en rutas de acceso y solo textos cortos.
  function tagWordmark() {
    var root = document.getElementById('root');
    if (!root) return;
    var tagged = root.querySelectorAll('[data-bivelio-wordmark]');
    for (var i = 0; i < tagged.length; i++) {
      if (!WELCOME.test((tagged[i].textContent || '').trim())) {
        tagged[i].removeAttribute('data-bivelio-wordmark');
      }
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var v = n.nodeValue || '';
      // «Welcome, CRM by BiVelio.» / «Bienvenido, CRM by BiVelio.»; no «Entra en CRM by BiVelio».
      if (v.length < 64 && WELCOME.test(v.trim())) {
        var el = n.parentElement;
        // Nunca un campo de formulario ni un enlace/botón.
        if (el && !el.closest('input,textarea,button,a,label') && !el.hasAttribute('data-bivelio-wordmark')) {
          el.setAttribute('data-bivelio-wordmark', '');
        }
      }
    }
  }

  function tick() {
    try {
      fixTitle();
      fixFavicon();
      sourceLink();
      var html = document.documentElement;
      var isAuth = AUTH_PATH.test(location.pathname);
      if (isAuth) {
        if (!html.hasAttribute('data-bivelio-auth')) html.setAttribute('data-bivelio-auth', '');
        tagWordmark();
      } else if (html.hasAttribute('data-bivelio-auth')) {
        html.removeAttribute('data-bivelio-auth');
      }
    } catch (e) {
      /* la marca nunca debe romper la app */
    }
  }

  // Helmet cambia <title>/<link rel=icon> en <head>: se corrige al instante.
  new MutationObserver(function () {
    try { fixTitle(); fixFavicon(); } catch (e) { /* idem */ }
  }).observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href'] });

  // Ruta (SPA, pushState) y título de bienvenida: sondeo barato.
  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  setInterval(tick, 400);
})();
