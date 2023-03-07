import * as Phaser from 'phaser';

import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../const';

import skyPng from '../assets/sky3.jpeg';
import groundPng from '../assets/platform.png';
import bombPng from '../assets/bomb.png';
import starPng from '../assets/star.png';
import dudePng from '../assets/dude.png';

import qimaMP3 from '../assets/audio/qima.mp3';
import jumpMP3 from '../assets/audio/jump.mp3';
import growUpMP3 from '../assets/audio/growUp.mp3';

let platforms: Phaser.Physics.Arcade.StaticGroup = null,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = null,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys = null,
  stars: Phaser.Physics.Arcade.Group = null,
  score = 0,
  scoreText: Phaser.GameObjects.Text = null,
  bombs: Phaser.Physics.Arcade.Group = null,
  gameOver = false,
  jumpTime = 0,
  clickTime = 0,
  game: Phaser.Game;

class FirstGameScene extends Phaser.Scene {
  sound: Phaser.Sound.HTML5AudioSoundManager;

  constructor() {
    super('first-game');
  }

  init() {
    this.sound = new Phaser.Sound.HTML5AudioSoundManager(game);
  }

  preload() {
    this.load.image('sky', skyPng);
    this.load.image('ground', groundPng);
    this.load.image('bomb', bombPng);
    this.load.image('star', starPng);
    this.load.spritesheet('dude', dudePng, {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.audio('qima', qimaMP3);
    this.load.audio('jump', jumpMP3, { instances: 2 });
    this.load.audio('growUp', growUpMP3, { instances: 100 });
  }

  create() {
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms
      .create(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 32, 'ground')
      .setScale(2.5)
      .refreshBody();

    platforms.create(WINDOW_WIDTH - 150, 150, 'ground');
    platforms.create(100, 350, 'ground');
    platforms.create(WINDOW_WIDTH - 200, 550, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(platforms, player);

    cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    stars = this.physics.add.group({
      key: 'star',
      repeat: 30,
      setXY: {
        x: 12,
        y: 0,
        stepX: WINDOW_WIDTH / 30,
      },
      collideWorldBounds: true,
    });

    stars.children.iterate(
      (child: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      }
    );

    this.physics.add.collider(platforms, stars);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'score:0', {
      fontSize: '32px',
      color: 'yellow',
    });

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, bombHit, null, this);

    loadSound(this);
  }

  update() {
    if (gameOver) return;

    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-350);
      jumpTime += 1;
      this.sound.play('jump', {
        detune: jumpTime % 3 ? 0 : -1200,
      });
    }
  }
}

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
  scene: FirstGameScene,
  audio: {
    disableWebAudio: true,
  },
};

function loadSound(currentScene: FirstGameScene) {
  const qimaSound = currentScene.sound.add('qima', {
    loop: true,
  });

  currentScene.sound.pauseOnBlur = true;

  currentScene.input.on('pointerdown', () => {
    clickTime += 1;
    if (clickTime === 1) {
      qimaSound.play();
    }
    qimaSound.setRate(clickTime % 2 ? 1 : 5);
  });
}

function collectStar(
  player,
  star: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
) {
  star.disableBody(true, true);
  (this as FirstGameScene).sound.play('growUp');

  score += 10;
  scoreText.setText(`score:${score}`);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(
      (child: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) => {
        child.enableBody(true, child.x, 0, true, true);
      }
    );

    const x =
      player.x < WINDOW_WIDTH / 2
        ? Phaser.Math.Between(WINDOW_WIDTH / 2, WINDOW_WIDTH)
        : Phaser.Math.Between(0, WINDOW_WIDTH / 2);
    const bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function bombHit(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');

  gameOver = true;
}

function createFirstGame() {
  game = new Phaser.Game(config);
}

export default createFirstGame;
