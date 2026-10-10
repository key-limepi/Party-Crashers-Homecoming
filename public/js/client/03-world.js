    // big map
    const LV_SPAWN = { x: 100, y: 880 }; // west pillar-side ground
    const LV_EAST = { x: 2575, y: 1787 }; // far east floor
    game.loadLevel(LEVEL_ROUGH_DRAFT, loadImg('./Assets/Images/Levels/RoughDraft.png'), { background: '#3b2a2a', backdrop: loadImg('./Assets/Images/Levels/RoughDraft_bg.jpg') }); // rough draft
    game.mapBg.inter = '#bfe9ff';
    game.spawn = { x: LV_SPAWN.x, y: LV_SPAWN.y };
    game.evilSpawn = { x: LV_EAST.x, y: LV_EAST.y - 120 };
    // spring pads
    const SPR = './Assets/Images/Objects/';
    game.addSpring(927, 652, 1200, loadImg(SPR + 'spring_orange.png'));
    game.addSpring(1245, 480, 1200, loadImg(SPR + 'spring_orange.png'));
    game.addSpring(18, 1244, 1200, loadImg(SPR + 'spring_orange.png'));
    game.addSpring(2506, 1545, 1500, loadImg(SPR + 'spring_red.png'));
    game.addSpring(2473, 1036, 950, loadImg(SPR + 'spring_yellow.png'));
    game.addSpring(1777, 1267, 1500, loadImg(SPR + 'spring_red.png'));
    game.addSpring(2633, 887, 950, loadImg(SPR + 'spring_yellow.png'));
    game.addSpring(1560, 757, 1500, loadImg(SPR + 'spring_red.png'));
    game.addSpring(305, 1089, 1500, loadImg(SPR + 'spring_red.png'));
    game.respawn();

    // rest island
    game.addPlatform(6000, 380, 800, 80, '#8ac926', 'inter'); // island floor
    game.addPlatform(5960, 100, 40, 360, '#c084fc', 'inter'); // left wall
    game.addPlatform(6800, 100, 40, 360, '#c084fc', 'inter'); // right wall
    game.addPlatform(6200, 280, 140, 22, '#ff9f1c', 'inter');
    game.addPlatform(6480, 200, 140, 22, '#ff9f1c', 'inter');
    game.addPlatform(6340, 120, 120, 22, '#ff9f1c', 'inter');
    // lobby springs
    game.addSpring(6080, 354, 1500, loadImg(SPR + 'spring_red.png'), 'inter');
    game.addSpring(6232, 254, 1200, loadImg(SPR + 'spring_orange.png'), 'inter');
    game.addSpring(6620, 354, 950, loadImg(SPR + 'spring_yellow.png'), 'inter');

    game.start();
