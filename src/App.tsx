import { useEffect } from "react";
import createExample from "./phaserExample";
import "./App.css";

function App() {
  useEffect(() => {
    createExample();
  }, []);

  return <div />;
}

export default App;
