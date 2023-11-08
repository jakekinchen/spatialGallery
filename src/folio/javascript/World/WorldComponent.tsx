import FloorComponent from "./FloorComponent";
import IntroSectionComponent from "./Sections/IntroSectionComponent";
import {OrbitControls} from "@react-three/drei";

export default function WorldComponent() {
  return (
    <>
      <FloorComponent />
      <IntroSectionComponent />
    </>
  );
}
