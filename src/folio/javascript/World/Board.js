import * as THREE from 'three'
import TweenLite from "gsap/TweenLite";
import {Power4} from "gsap/EasePack";
import ProjectBoardMaterial from "../Materials/ProjectBoard";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";


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


        const planeGeometry = new RoundedBoxGeometry( 4.85, 2.8,.1, 8, 1);
        const planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        this.planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
        this.planeMesh.position.x = this.x
        this.planeMesh.position.y = this.y+0.1
        this.planeMesh.position.z = 3.15
        this.planeMesh.rotation.x = -4.7;
        this.planeMesh.rotation.y = 0.1;
        this.container.add(this.planeMesh);

        this.planeMesh.area = this.areas.add({
            //Change the position of button here
            position: new THREE.Vector2(this.x, this.y - 3),
            //Change size of button here
            halfExtents: new THREE.Vector2(3, 1)
        })
         // Start label
        this.setAddMediaLabel()
         
         // Make startLabel.image slightly larger
         
         
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

    setAddMediaLabel() {
        // Set up
        this.addMediaLabel = {}
    
        const loader = new FontLoader();
    
        loader.load('fonts/comic_neue.json', (font) => {
            const geometry = new TextGeometry('Add Media', {
                font: font,
                size: .7, // adjust size
                height: 0.01, // adjust depth
            });
    
            this.addMediaLabel.material = new THREE.MeshBasicMaterial({ 
                transparent: false, 
                depthWrite: false, 
                // make the color light blue
                color: 0xffffff
            });
            this.addMediaLabel.material.opacity = 0.5;
    
            this.addMediaLabel.mesh = new THREE.Mesh(
                geometry, 
                this.addMediaLabel.material
            );
            this.addMediaLabel.mesh.position.set(this.x-2.35, this.y-3.28, 0);
            this.addMediaLabel.mesh.matrixAutoUpdate = false;
            this.addMediaLabel.mesh.updateMatrix();
    
            this.container.add(this.addMediaLabel.mesh);
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

    addFloorButton() {
        const planeGeometry = new RoundedBoxGeometry( 4.85, 2.8,.1, 8, 1);
        const planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        this.planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
        this.planeMesh.position.x = this.x
        this.planeMesh.position.y = this.y+0.1
        this.planeMesh.position.z = 3.1
        this.planeMesh.rotation.x = -4.7;
        this.planeMesh.rotation.y = 0.1;
        this.container.add(this.planeMesh);
    }

    setCanvas(){
        // set a gray material and texture
        const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
        material.map = this.resources.items.areaResetTexture;
        return this.objects.add({
            base: this.resources.items.projectsBoardPlane.scene,
            collision: this.resources.items.projectsBoardCollision.scene,
            material: material,
            shadow: true,
            offset: new THREE.Vector3(this.x, this.y, 1),
            rotation: new THREE.Euler(0, 0, 18.5),
            duplicated: true,
            mass: 0
        })
    }


}
