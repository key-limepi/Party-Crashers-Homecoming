function loadImg(src) {
      const img = new Image();
      img.src = src;
      return img;
    }
    const LUX = "./Assets/Images/Characters/Survivors/Lux/";

    const canvas = document.getElementById('game');
    const game = new PlatformerEngine(canvas, { width: 800, height: 450, background: '#bfe9ff' });

    // small hitbox
    const lux = game.addPlayer(60, 100, 28, 60);
    lux.drawW = 50; lux.drawH = 70;

    // fade-to-black phase transitions.
    // game logic stays synchronous (same ordering as no-fade): cover
    // instantly so the swap hides behind black, then reveal smoothly.
    // never defer the swap: roles respawn to other-map coords, and a
    // deferred switchMap strands them in the void (fall-damage spiral).
    const fadeBlackEl = document.getElementById('fadeBlack');
    let fadeBlackToken = 0;
    let fadeBlackOffT = null;
    function phaseFadeSwap(swapFn, holdMs) {
      if (!fadeBlackEl) { try { swapFn && swapFn(); } catch (_) { /* hush!! */ } return; }
      const mine = ++fadeBlackToken;
      clearTimeout(fadeBlackOffT);
      fadeBlackEl.style.transition = 'none';
      fadeBlackEl.classList.add('on');
      void fadeBlackEl.offsetWidth; // paint black next frame
      fadeBlackEl.style.transition = '';
      try { swapFn && swapFn(); } catch (_) { /* hush!! */ }
      fadeBlackOffT = setTimeout(() => {
        if (mine !== fadeBlackToken) return;
        fadeBlackEl.classList.remove('on');
      }, holdMs == null ? 150 : holdMs);
    }
