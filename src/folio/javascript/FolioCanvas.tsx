import {Canvas, useThree} from "@react-three/fiber";
import { LinearEncoding, NoToneMapping } from "three";
import Folio from "./Folio";
import {folder, useControls} from "leva";
import {LEVA_FOLDERS} from "./constants";
import CameraLogger from "./cameraLogger";
import {PerspectiveCamera} from "@react-three/drei";
import {useMemo} from "react";


export default function FolioCanvas() {
    const options = useMemo(()=> {
        return {
            x: { value: 1.135, min: -2, max: 2, step: 0.01 },
            y: { value: -1.45, min: -2, max: 2, step: 0.01 },
            z: { value: 1.15, min: -2, max: 2, step: 0.01 },
        }

    },[])

    const cameraControls = useControls('Camera', options);
    /*const { zoomIn, cameraAngleX,cameraAngleY,cameraAngleZ } =
        useControls(
            LEVA_FOLDERS.materials.label,
            {
                [LEVA_FOLDERS.camera.label]: folder(
                    {
                        zoomIn: { value: "#f5883c", label: "Zoom" },
                        cameraAngleX: { value: 0, min: -2, step:0.1, label: "x" },
                        cameraAngleY: { value: 0, min: -2,step:0.1, label: "y" },
                        cameraAngleZ: { value: 0, min: -2, step:0.1,label: "z" },

                    },
                    { collapsed: true, color: LEVA_FOLDERS.camera.color }
                ),
            },
            { collapsed: true, color: LEVA_FOLDERS.materials.color }
        );*/
    return (
    <Canvas
      gl={{
        pixelRatio: 2,
        physicallyCorrectLights: true,
        autoClear: false,
        outputEncoding: LinearEncoding,
        toneMapping: NoToneMapping,
      }}
    >
      <color attach="background" args={[0x000000]} />
      <Folio
          cameraX={cameraControls.x}
          cameraY={cameraControls.y}
          cameraZ={cameraControls.z}
      />
        <CameraLogger event='mousedown'/>
    </Canvas>
  );
}
