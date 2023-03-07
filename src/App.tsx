import { useEffect } from 'react';
import createExample from './game/phaserExample';
import createFirstGame from './game/firstGame';
import loadTexturePacker from './game/loadTexturePacker';
import { events, gameObjects } from './familiarPhaserApi';
import './App.css';

function App() {
  useEffect(() => {
    // createExample();
    // createFirstGame();
    // loadTexturePacker();
    // events();
    gameObjects();
  }, []);

  return <div />;
}

export default App;
