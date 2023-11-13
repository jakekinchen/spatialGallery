import * as THREE from 'three'
import TweenLite from "gsap/TweenLite";
import {Power4} from "gsap/EasePack";
import ProjectBoardMaterial from "../Materials/ProjectBoard";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry";


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


        this.resources.items.areaResetTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaResetTexture.minFilter = THREE.LinearFilter

        this.setBoard()


        const planeGeometry = new RoundedBoxGeometry( 4.9, 2.9,.1, 5, 1);
        const planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        this.planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
        this.planeMesh.position.x = this.x
        this.planeMesh.position.y = this.y+0.1
        this.planeMesh.position.z = 3
        this.planeMesh.rotation.x = -4.7;
        this.planeMesh.rotation.y = 0.1;
        this.container.add(this.planeMesh);

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
            //this.objects.material.children[38].children[0].needsUpdate = true;
        })

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const texture = new THREE.TextureLoader().load(e.target.result);
                    this.planeMesh.material.map = texture
                    this.planeMesh.material.needsUpdate = true;
                }.bind(this);

                reader.readAsDataURL(file);
            }
        });


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


}
