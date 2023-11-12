import {useThree} from "@react-three/fiber";
import {useEffect, useRef} from "react";
function CameraLogger({event} = {}) {
    const {camera} = useThree()
    const cameraRef = useRef(camera)
    useEffect(() => {
        const logCameraPosition = () => {
            const {x, y, z} = cameraRef.current.position
            console.log(cameraRef);
            console.log(`Camera Position x: ${x}, y: ${y}, z:${z}`)

        }
        cameraRef.current = camera;
        window.addEventListener(event, logCameraPosition)
        return () => {
            window.removeEventListener(event, logCameraPosition)
        }

    }, [])
    return null
}
export default CameraLogger