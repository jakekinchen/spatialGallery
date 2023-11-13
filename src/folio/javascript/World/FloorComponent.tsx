import { Plane } from "@react-three/drei";
import { folder, useControls } from "leva";
import { LEVA_FOLDERS } from "../constants";
export default function FloorComponent() {
  const { Color } =
    useControls(
      LEVA_FOLDERS.materials.label,
      {
        [LEVA_FOLDERS.floor.label]: folder(
          {
            Color: { value: "#70c8d8", label: "Floor color" },
          },
          { collapsed: false, color: LEVA_FOLDERS.floor.color }
        ),
      },
      { collapsed: true, color: LEVA_FOLDERS.materials.color }
    );

  return (
    <Plane args={[2, 2]} frustumCulled={false} matrixAutoUpdate={false}>
      <floorMaterial
        topLeftColor={Color}
        topRightColor={Color}
        bottomRightColor={Color}
        bottomLeftColor={Color}
      />
    </Plane>
  );
}
