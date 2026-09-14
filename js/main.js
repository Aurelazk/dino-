/* TerraChamp — animations GSAP + ScrollTrigger & scène 3D Three.js */
(function () {
  'use strict';

  var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function ready(fn) {
    document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* Navbar : compactée au scroll */
    var nav = document.querySelector('[data-nav]');
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle('is-scrolled', (window.scrollY || 0) > 12);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* Menu mobile */
    var burger = document.querySelector('[data-menu-btn]');
    var menu = document.querySelector('[data-menu]');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.innerHTML = open
          ? '<svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
          : '<svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
      });
    }

    /* Apparitions au scroll (GSAP) */
    if (!REDUCED && window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('[data-anim="fade"]').forEach(function (el) {
        gsap.fromTo(el, { y: 26, opacity: 0 }, {
          y: 0, opacity: 1, duration: .75, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
        });
      });

      gsap.utils.toArray('[data-anim="group"]').forEach(function (group) {
        var kids = group.children;
        if (!kids.length) return;
        gsap.fromTo(kids, { y: 28, opacity: 0 }, {
          y: 0, opacity: 1, stagger: .08, duration: .65, ease: 'power2.out',
          scrollTrigger: { trigger: group, start: 'top 86%', toggleActions: 'play none none reverse' }
        });
      });

      gsap.utils.toArray('[data-anim="bars"]').forEach(function (chart) {
        var bars = Array.prototype.slice.call(chart.querySelectorAll('.bar'));
        if (!bars.length) return;
        var heights = bars.map(function (b) {
          var m = (b.getAttribute('style') || '').match(/height:\s*([^;]+)/);
          return m ? m[1].trim() : '40%';
        });
        gsap.fromTo(bars, { height: '0%' }, {
          height: function (i) { return heights[i]; },
          duration: .75, ease: 'power2.out', stagger: .06,
          scrollTrigger: { trigger: chart, start: 'top 88%', once: true }
        });
      });

      /* Compteurs animés */
      gsap.utils.toArray('[data-count]').forEach(function (el) {
        var target = parseFloat((el.getAttribute('data-count') || '0').replace(/[^0-9.]/g, ''));
        var suffix = el.getAttribute('data-suffix') || '';
        var obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.5, ease: 'power1.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: function () {
            el.textContent = Math.round(obj.v).toLocaleString('fr-FR') + suffix;
          }
        });
      });

      /* Entrée du hero */
      var hero = document.querySelector('[data-hero]');
      if (hero) {
        var els = hero.querySelectorAll('[data-hero-el]');
        if (els.length) {
          gsap.fromTo(els, { y: 36, opacity: 0 }, {
            y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out'
          });
        }
      }
    }

    /* Scène 3D Three.js dans le hero */
    if (!REDUCED && window.THREE) {
      window.addEventListener('load', initScene);
    }
  });

  function initScene() {
    var el = document.getElementById('agri-scene');
    if (!el) return;
    var wrap = el.parentElement;
    var dims = wrap ? wrap.getBoundingClientRect() : { width: 0, height: 0 };
    var W = dims.width || 400, H = dims.height || 300;
    if (W < 120 || H < 120) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      if (!renderer.getContext()) return;
    } catch (e) { return; }

    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    el.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, W / H, .1, 100);
    camera.position.set(0, 0, 46);

    scene.add(new THREE.AmbientLight(0xffffff, .85));

    var d1 = new THREE.DirectionalLight(0xffffff, .8);
    d1.position.set(8, 10, 10);
    scene.add(d1);

    var d2 = new THREE.DirectionalLight(0xFFC61A, .55);
    d2.position.set(-9, -5, 8);
    scene.add(d2);

    var palette = [0x2E7D32, 0x1C5B2E, 0x4CAF50, 0x7FC47F, 0xFFC61A, 0xFFD75E, 0xBFE0BE];
    var meshes = [];
    var count = Math.max(14, Math.min(30, Math.floor(W / 34)));
    var i;

    for (i = 0; i < count; i++) {
      var color = palette[(Math.random() * palette.length) | 0];
      var mat = new THREE.MeshLambertMaterial({ color: color, flatShading: true });
      var r = Math.random();
      var geo;
      if (r < .34) geo = new THREE.IcosahedronGeometry(1, 0);
      else if (r < .6) geo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      else if (r < .8) geo = new THREE.CylinderGeometry(.8, .95, 1.7, 8);
      else geo = new THREE.TorusGeometry(.9, .3, 6, 12);

      var m = new THREE.Mesh(geo, mat);
      var s = .55 + Math.random() * .95;
      m.scale.set(s, s, s);
      m.position.set((Math.random() - .5) * 18, (Math.random() - .5) * 20, (Math.random() - .5) * 10);
      m.userData = {
        baseY: m.position.y,
        ry: (Math.random() - .5) * 1.1,
        rx: (Math.random() - .5) * .9,
        sp: .5 + Math.random() * .9,
        ph: Math.random() * Math.PI * 2
      };
      scene.add(m);
      meshes.push(m);
    }

    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function onResize() {
      var d = wrap.getBoundingClientRect();
      if (d.width > 0 && d.height > 0) {
        camera.aspect = d.width / d.height;
        camera.updateProjectionMatrix();
        renderer.setSize(d.width, d.height);
      }
    }
    window.addEventListener('resize', onResize);

    (function tick() {
      requestAnimationFrame(tick);
      var t = performance.now() / 1000;
      for (var j = 0; j < meshes.length; j++) {
        var m = meshes[j];
        m.rotation.x += m.userData.rx * .02;
        m.rotation.y += m.userData.ry * .02;
        m.position.y = m.userData.baseY + Math.sin(t * m.userData.sp + m.userData.ph) * 1.6;
        if (m.position.y > 15) m.position.y = -15;
        if (m.position.y < -15) m.position.y = 15;
      }
      camera.position.x += (mouseX * 3.2 - camera.position.x) * .04;
      camera.position.y += (mouseY * 2.6 - camera.position.y) * .04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })();
  }
})();