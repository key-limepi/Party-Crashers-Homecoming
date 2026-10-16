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

    // test hitboxes
    game.loadInterLevel(LEVEL_INTERMISSION, loadImg('./Assets/Images/Levels/Intermission.png'), 1, loadImg('./Assets/Images/Levels/IntermissionBG.png'), loadImg('./Assets/Images/Levels/Intermission_Props.png')); // built art
    // inter springs
    game.addSpring(246, 1820, 1200, loadImg(SPR + 'spring_orange.png'), 'inter'); // low floor
    game.addSpring(166, 1446, 950, loadImg(SPR + 'spring_yellow.png'), 'inter'); // mid shelf
    game.addSpring(2282, 1058, 1500, loadImg(SPR + 'spring_red.png'), 'inter'); // east ledge
    game.addSpring(2367, 564, 1500, loadImg(SPR + 'spring_red.png'), 'inter'); // high deck
    game.respawn();

    game.start();
