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

    // fade-to-black phase transitions, world swaps hide behind black
    const fadeBlackEl = document.getElementById('fadeBlack');
    let fadeBlackToken = 0;
    let fadeBlackOffT = null;
    function fadeThroughBlack(swapFn, coverMs, holdMs) {
      if (!fadeBlackEl) { try { swapFn && swapFn(); } catch (_) { /* hush!! */ } return; }
      const mine = ++fadeBlackToken;
      coverMs = coverMs == null ? 550 : coverMs;
      holdMs = holdMs == null ? 200 : holdMs;
      fadeBlackEl.classList.add('on');
      clearTimeout(fadeBlackOffT);
      setTimeout(() => {
        if (mine !== fadeBlackToken) return;
        try { swapFn && swapFn(); } catch (_) { /* hush!! */ }
        fadeBlackOffT = setTimeout(() => {
          if (mine !== fadeBlackToken) return;
          fadeBlackEl.classList.remove('on');
        }, holdMs);
      }, coverMs);
    }
    function pulseFade(holdMs) {
      if (!fadeBlackEl) return;
      const mine = ++fadeBlackToken;
      fadeBlackEl.classList.add('on');
      clearTimeout(fadeBlackOffT);
      fadeBlackOffT = setTimeout(() => {
        if (mine !== fadeBlackToken) return;
        fadeBlackEl.classList.remove('on');
      }, 600 + (holdMs || 350));
    }
