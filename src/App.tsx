import { useEffect } from 'react';
import createExample from './game/phaserExample';
import createFirstGame from './game/firstGame';
import './App.css';

function App() {
  useEffect(() => {
    // createExample();
    createFirstGame();
  }, []);

  return <div />;
}

export default App;
