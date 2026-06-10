/* 3D ring carousel — vanilla JS, no dependencies.
   Tiles are placeholders; swap the inner content for <img>/<video> later. */

(function () {
  var TILE_COUNT = 12;

  var stage = document.getElementById('ringStage');
  var ring = document.getElementById('ring');
  if (!stage || !ring) return;

  // Build placeholder tiles
  for (var i = 0; i < TILE_COUNT; i++) {
    var tile = document.createElement('div');
    tile.className = 'ring-tile';
    var inner = document.createElement('div');
    inner.className = 'tile-face';
    inner.textContent = ('0' + (i + 1)).slice(-2);
    tile.appendChild(inner);
    ring.appendChild(tile);
  }

  var tiles = ring.children;
  var step = 360 / TILE_COUNT;

  function layout() {
    // Radius derived from tile width so tiles never overlap
    var tileW = tiles[0].offsetWidth;
    var radius = Math.round((tileW / 2) / Math.tan(Math.PI / TILE_COUNT)) + 40;
    for (var i = 0; i < TILE_COUNT; i++) {
      tiles[i].style.transform =
        'rotateY(' + (i * step) + 'deg) translateZ(' + radius + 'px)';
    }
  }

  var angle = 0;
  var velocity = 0;
  var dragging = false;
  var lastX = 0;
  var idleSpin = 0.04; // degrees per frame when idle

  function frame() {
    if (!dragging) {
      velocity *= 0.95; // friction
      if (Math.abs(velocity) < 0.01) velocity = 0;
      angle += velocity + idleSpin;
    }
    ring.style.transform = 'rotateY(' + angle + 'deg)';
    requestAnimationFrame(frame);
  }

  function pointerDown(x) {
    dragging = true;
    lastX = x;
    velocity = 0;
    stage.classList.add('dragging');
  }

  function pointerMove(x) {
    if (!dragging) return;
    var dx = x - lastX;
    lastX = x;
    angle += dx * 0.25;
    velocity = dx * 0.25;
    ring.style.transform = 'rotateY(' + angle + 'deg)';
  }

  function pointerUp() {
    dragging = false;
    stage.classList.remove('dragging');
  }

  stage.addEventListener('mousedown', function (e) {
    e.preventDefault();
    pointerDown(e.clientX);
  });
  window.addEventListener('mousemove', function (e) { pointerMove(e.clientX); });
  window.addEventListener('mouseup', pointerUp);

  stage.addEventListener('touchstart', function (e) {
    pointerDown(e.touches[0].clientX);
  }, { passive: true });
  stage.addEventListener('touchmove', function (e) {
    pointerMove(e.touches[0].clientX);
  }, { passive: true });
  stage.addEventListener('touchend', pointerUp);

  // Horizontal wheel / trackpad swipe also spins the ring
  stage.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      angle -= e.deltaX * 0.15;
      velocity = -e.deltaX * 0.05;
    }
  }, { passive: false });

  // Respect reduced-motion preference: no idle spin
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    idleSpin = 0;
  }

  window.addEventListener('resize', layout);
  layout();
  requestAnimationFrame(frame);
})();
