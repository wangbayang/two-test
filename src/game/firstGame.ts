import * as Phaser from 'phaser';

import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../const';

import skyPng from '../assets/sky2.jpg';
import groundPng from '../assets/platform.png';
import bombPng from '../assets/bomb.png';
import starPng from '../assets/star.png';
import dudePng from '../assets/dude.png';

let platforms: Phaser.Physics.Arcade.StaticGroup = null,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = null,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys = null,
  stars: Phaser.Physics.Arcade.Group = null,
  score = 0,
  scoreText: Phaser.GameObjects.Text = null,
  bombs: Phaser.Physics.Arcade.Group = null,
  gameOver = false;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 200,
      },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

function preload() {
  const currentScene: Phaser.Scene = this;

  currentScene.load.image('sky', skyPng);
  currentScene.load.image('ground', groundPng);
  currentScene.load.image('bomb', bombPng);
  currentScene.load.image('star', starPng);
  currentScene.load.spritesheet('dude', dudePng, {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  const currentScene: Phaser.Scene = this;

  currentScene.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'sky');

  platforms = currentScene.physics.add.staticGroup();

  platforms
    .create(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 32, 'ground')
    .setScale(2.5)
    .refreshBody();

  platforms.create(WINDOW_WIDTH - 150, 150, 'ground');
  platforms.create(100, 350, 'ground');
  platforms.create(WINDOW_WIDTH - 200, 550, 'ground');

  player = currentScene.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  currentScene.physics.add.collider(platforms, player);

  cursors = currentScene.input.keyboard.createCursorKeys();

  currentScene.anims.create({
    key: 'left',
    frames: currentScene.anims.generateFrameNumbers('dude', {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  currentScene.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20,
  });

  currentScene.anims.create({
    key: 'right',
    frames: currentScene.anims.generateFrameNumbers('dude', {
      start: 5,
      end: 8,
    }),
    frameRate: 10,
    repeat: -1,
  });

  stars = currentScene.physics.add.group({
    key: 'star',
    repeat: 300,
    setXY: {
      x: 12,
      y: 0,
      stepX: WINDOW_WIDTH / 300,
    },
    collideWorldBounds: true,
  });

  stars.children.iterate((child: any) => {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  currentScene.physics.add.collider(platforms, stars);
  currentScene.physics.add.overlap(
    player,
    stars,
    collectStar,
    null,
    currentScene
  );

  scoreText = currentScene.add.text(16, 16, 'score:0', {
    fontSize: '32px',
    color: 'yellow',
  });

  bombs = currentScene.physics.add.group();
  currentScene.physics.add.collider(bombs, platforms);
  currentScene.physics.add.collider(player, bombs, bombHit, null, currentScene);
}

function update() {
  if (gameOver) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else if (cursors.down.isDown) {
    player.setVelocityY(3000);
    player.anims.play('turn');
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-400);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText(`score:${score}`);

  const x =
    player.x < WINDOW_WIDTH / 2
      ? Phaser.Math.Between(WINDOW_WIDTH / 2, WINDOW_WIDTH)
      : Phaser.Math.Between(0, WINDOW_WIDTH / 2);

  const bomb = bombs.create(x, 16, 'bomb').setScale(3).refreshBody();
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-5000, 5000), 3000);

  if (stars.countActive(true) === 0) {
    stars.children.iterate((child: any) => {
      child.enableBody(true, child.x, 0, true, true);
    });

    // const x =
    //   player.x < WINDOW_WIDTH / 2
    //     ? Phaser.Math.Between(WINDOW_WIDTH / 2, WINDOW_WIDTH)
    //     : Phaser.Math.Between(0, WINDOW_WIDTH / 2);
    // const bomb = bombs.create(x, 16, 'bomb').setScale(3).refreshBody();
    // bomb.setBounce(1);
    // bomb.setCollideWorldBounds(true);
    // bomb.setVelocity(Phaser.Math.Between(-500, 500), 500);
  }
}

function bombHit(player, bomb) {
  // this.physics.pause();
  player.setTint(0xff0000);
  // player.anims.play('turn');

  // gameOver = true;
}

function createFirstGame() {
  const game = new Phaser.Game(config);
}

export default createFirstGame;
