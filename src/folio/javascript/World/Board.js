import * as THREE from 'three'
import TweenLite from "gsap/TweenLite";
import {Power4} from "gsap/EasePack";
import ProjectBoardMaterial from "../Materials/ProjectBoard";


export default class Board
{
    constructor(_options) {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.renderer = _options.renderer;
        this.camera = _options.camera;
        this.areas = _options.areas
        this.position = _options.position
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.resources.items.areaResetTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaResetTexture.minFilter = THREE.LinearFilter

        this.setBoard()
        this.setPlane()

    }
    setBoard()
    {

        this.objects.add({
            base: this.resources.items.projectsBoardStructure.scene,
            collision: this.resources.items.projectsBoardCollision.scene,
            floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 1),
            rotation: new THREE.Euler(0, 0, 18.5),
            duplicated: true,
            mass: 0
        })
    }

    setPlane()
    {
        this.planeMesh = this.resources.items.projectsBoardPlane.scene
        this.planeMesh.position.x = this.x
        this.planeMesh.position.y = this.y
        this.planeMesh.matrixAutoUpdate = false
        this.planeMesh.updateMatrix()
        this.planeMesh.material = new ProjectBoardMaterial()
        this.planeMesh.material.uniforms.uColor.value = '0xffffff'
        this.planeMesh.material.uniforms.uTextureAlpha.value = 0

        this.container.add(this.planeMesh);
        /*
        this.objects.add({
            base: this.resources.items.projectsBoardPlane.scene,
            collision: this.resources.items.projectsBoardCollision.scene,
            offset: new THREE.Vector3(this.x, this.y, 1),
            rotation: new THREE.Euler(0, 0, 18.5)
        })
        */
        this.planeMesh.area = this.areas.add({
            //Change the position of button here
            position: new THREE.Vector2(this.x, this.y - 3),
            //Change size of button here
            halfExtents: new THREE.Vector2(3, 1)
        })

        const fileInput = document.getElementById('fileInput');
        this.planeMesh.area.on('interact', () =>
        {
            fileInput.click();
            this.planeMesh.material.needsUpdate = true;
        })

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const texture = new THREE.TextureLoader().load(e.target.result);
                    var newMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
                    this.planeMesh.traverse((o) => {
                        this.planeMesh.material = newMaterial
                    });
                    this.planeMesh.material.map = texture
                    this.planeMesh.material.needsUpdate = true;
                    console.log("plane mesh: ");
                    console.log(this.planeMesh);
                }.bind(this);

                reader.readAsDataURL(file);
            }
        });
    }


}
