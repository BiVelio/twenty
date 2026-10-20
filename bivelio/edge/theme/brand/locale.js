/* ==========================================================================
   locale.js — idioma por defecto de las pantallas de acceso de «CRM by BiVelio»

   Twenty v2.45.0 elige el idioma ANTES del login así (index-*.js, initialI18nActivate):
     1. ?locale=<código> en la URL (y lo guarda en localStorage «locale»);
     2. localStorage «locale» (lo escribe también Ajustes → Experiencia → Idioma);
     3. navigator.language;   4. «en».
   Con un navegador en inglés, el acceso (correo, contraseña, 2FA, «Join … team»)
   salía en inglés aunque el catálogo es-ES lo tiene todo traducido. Después del
   login manda el idioma del miembro (bootstrap.sh lo da de alta en es-ES).

   Este script lo inyecta el edge (caddy.snippet) como <script> CLÁSICO justo
   después de <head>, así que se ejecuta antes que el módulo de Twenty (los
   módulos son diferidos). Solo escribe «es-ES» si no hay ya un idioma guardado
   ni ?locale= en la URL: quien elija otro idioma en Ajustes lo conserva.
   Mismo origen ('self'); nunca lanza: sin localStorage, Twenty sigue como siempre.
   ========================================================================== */
(function () {
  'use strict';
  try {
    if (new URLSearchParams(window.location.search).get('locale')) return;
    if (!window.localStorage.getItem('locale')) window.localStorage.setItem('locale', 'es-ES');
  } catch (e) {
    /* almacenamiento bloqueado: se queda el idioma del navegador */
  }
})();
