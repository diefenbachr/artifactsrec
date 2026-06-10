/* Ring carousel — tiles stay flat and front-facing (no 3D skew).
   Depth is simulated with scale + stacking order along an elliptical path.
   Vanilla JS, no dependencies. Swap .tile-face content for <img>/<video> later. */

(function () {
  var TILE_COUNT = 12;

  // Media per position (1-based). Positions not listed keep the
  // numbered placeholder. .jpg/.png/.webp = image, .mp4 = video.
  var MEDIA = {
    1: 'tiles/01.jpg',
    2: 'tiles/02.mp4',
    3: 'tiles/03.jpg',
    4: 'tiles/04.mp4',
    5: 'tiles/05.mp4',
    6: 'tiles/06.mp4'
  };

  var stage = document.getElementById('ringStage');
  var ring = document.getElementById('ring');
  if (!stage || !ring) return;

  for (var i = 0; i < TILE_COUNT; i++) {
    var tile = document.createElement('div');
    tile.className = 'ring-tile';
    var inner = document.createElement('div');
    inner.className = 'tile-face';
    var src = MEDIA[i + 1];
    if (src && /\.mp4$/i.test(src)) {
      var vid = document.createElement('video');
      vid.src = src;
      vid.muted = true;
      vid.loop = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      inner.appendChild(vid);
    } else if (src) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.draggable = false;
      inner.appendChild(img);
    } else {
      inner.textContent = ('0' + (i + 1)).slice(-2);
    }
    tile.appendChild(inner);
    ring.appendChild(tile);
  }

  var tiles = ring.children;
  var step = (Math.PI * 2) / TILE_COUNT;

  var radiusX = 420; // horizontal radius of the ellipse
  var lift = 30;     // vertical rise of far tiles (subtle tilted-ring feel)

  function layout() {
    var w = stage.offsetWidth;
    var tileW = tiles[0].offsetWidth;
    radiusX = Math.min(w / 2 - tileW / 2 - 10, 480);
  }

  var angle = 0;       // radians
  var velocity = 0;
  var dragging = false;
  var lastX = 0;
  var idleSpin = 0.0012; // radians per frame when idle

  function render() {
    for (var i = 0; i < TILE_COUNT; i++) {
      var theta = angle + i * step;
      var sin = Math.sin(theta);
      var cos = Math.cos(theta);
      // cos = 1 front and centre, cos = -1 furthest back
      var x = sin * radiusX;
      var y = -(1 - cos) * 0.5 * lift;
      var scale = 0.55 + 0.45 * (cos + 1) * 0.5;
      tiles[i].style.transform =
        'translate(-50%, -50%) translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      tiles[i].style.zIndex = String(100 + Math.round(cos * 100));
    }
  }

  function frame() {
    if (!dragging) {
      velocity *= 0.95;
      if (Math.abs(velocity) < 0.00005) velocity = 0;
      angle += velocity + idleSpin;
    }
    render();
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
    var delta = dx * 0.004;
    angle += delta;
    velocity = delta;
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

  stage.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      angle -= e.deltaX * 0.002;
      velocity = -e.deltaX * 0.0005;
    }
  }, { passive: false });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    idleSpin = 0;
  }

  window.addEventListener('resize', layout);
  layout();
  requestAnimationFrame(frame);
})();
