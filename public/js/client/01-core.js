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
