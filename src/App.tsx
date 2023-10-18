import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import "./App.css";
import FolioCanvas from "./folio/src/javascript/FolioCanvas";

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
  return <FolioCanvas />;
}

export default App;
