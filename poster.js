/* Poster crossfade — alternates the two launch posters every 7 seconds.
   The alternate image is only inserted once it has loaded, so if the file
   is missing the original poster simply stays in place. */

(function () {
  var ALT_SRC = 'Smelt11Sept2026PosterStreet.jpg';
  var INTERVAL = 7000;

  var wrap = document.querySelector('.poster-wrap');
  if (!wrap) return;

  var probe = new Image();

  probe.onload = function () {
    var alt = document.createElement('img');
    alt.src = ALT_SRC;
    alt.alt = '';
    alt.className = 'poster-alt';
    wrap.appendChild(alt);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var showing = false;
    setInterval(function () {
      showing = !showing;
      alt.classList.toggle('visible', showing);
    }, INTERVAL);
  };

  probe.src = ALT_SRC;
})();
