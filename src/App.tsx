import { Leva } from "leva";
import "./App.css";
import FolioCanvas from "./folio/javascript/FolioCanvas";
import "./folio/style/main.css";
const isLevaDebug = window.location.hash === "#leva";
import "./folio/index.js";

function ThreeScene() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-3, -3, 2]} />
      <OrbitControls />
    </Canvas>
  );
}
function App() {

  return (
    <div className="w-screen h-screen">
        {//<Leva hidden={!isLevaDebug} collapsed oneLineLabels />
            }
            <Leva collapsed oneLineLabels />
      <FolioCanvas />
    </div>
  );
}

export default App;
