import Phaser from 'phaser';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../const';

import qimaMP3 from '../assets/audio/qima.mp3';

let game: Phaser.Game,
  clickTime = 0;

class GameObjectScene extends Phaser.Scene {
  sound: Phaser.Sound.HTML5AudioSoundManager;

  constructor() {
    super('gameobject-scene');
  }

  init() {
    this.sound = new Phaser.Sound.HTML5AudioSoundManager(game);
  }

  preload() {
    this.load.audio('qima', qimaMP3);
  }

  create() {
    this.loadSound();
  }

  loadSound() {
    let qimaSound = this.sound.add('qima', {
      loop: true,
    });

    this.sound.pauseOnBlur = true;

    this.input.on('pointerdown', () => {
      clickTime += 1;

      if (clickTime === 1) {
        this.sound.unlock();
        qimaSound.play();
        return;
      }

      if (clickTime % 2) {
        qimaSound.resume();
      } else {
        qimaSound.pause();
      }
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  scene: GameObjectScene,
  scale: {
    mode: Phaser.Scale.FIT,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 200,
      },
    },
  },
  audio: {
    disableWebAudio: true,
  },
};

function gameObjects() {
  game = new Phaser.Game(config);
}

export default gameObjects;
