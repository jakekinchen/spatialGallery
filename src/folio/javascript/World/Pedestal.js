import * as THREE from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { Loader } from 'three';

export default class Pedestal
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.walls = _options.walls
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.camera = _options.camera
        this.scene = _options.scene
        this.renderer = _options.renderer
        this.x = _options.x
        this.y = _options.y

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('startSection')
            // this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        const ambientLight = new THREE.AmbientLight( 0xFFFFFF, 1 );

        this.scene.add( ambientLight );
        const dirLight = new THREE.DirectionalLight( 0xefefff, 10 );
        dirLight.position.set(this.x - 1, -5, 8 );
        this.scene.add( dirLight );
        console.log(ambientLight.position);
        console.log(dirLight.position);
        console.log(dirLight);
        this.resources.items.areaResetTexture.magFilter = THREE.NearestFilter;
        this.resources.items.areaResetTexture.minFilter = THREE.LinearFilter;

        // Assuming this is within a class that has access to this.objects, this.resources, etc.

        this.pedestal = new THREE.Scene();
        console.log('Pedestal scene created.');

        this.setStatic();
        this.setButton();
        //this.setPlaceholder();
        this.addButtonFunctionality();
        //this.setTest();
        this.setAddThisMediaLabel();
        //this.setObject();
       //this.setBowlingBall();
       //this.setBoard();
    }

    setAddThisMediaLabel() {
        const loader = new FontLoader();

        loader.load('fonts/comic_neue.json', (font) => {
            const geometry = new TextGeometry('Add Media', {
                font: font,
                size: .6, // adjust size
                height: .1, // adjust depth
            });

            const material = new THREE.MeshBasicMaterial({ 
                transparent: false, 
                depthWrite: false, 
                color: 0x000000
            });

            material.opacity = 1;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(this.x-1.675, this.y-.4, .2);
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();

            this.pedestal.label = this.objects.add({
                base: { children: [mesh] },
                material: material,
                collision: { children: [mesh] },
                mass: 0,
                offset: new THREE.Vector3(0, 0, 1),
                rotation: new THREE.Euler(0, 0, 0),
                sleep: true
            });
        }, undefined, (error) => {
            console.error('Error loading font:', error);
        });
    }

    setTest(){
        const buttonGeometry =  new RoundedBoxGeometry(2, 1, 0.1, 0.1, 0.1, 0.1, 0.05);

        // Create button material
        const buttonMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: false,
            opacity: 0.5,
            side: THREE.DoubleSide,
        });

        // Create button mesh
        this.mesh = new THREE.Mesh(buttonGeometry, buttonMaterial);

        // Add mesh to container
        this.container.add(this.mesh);
    }

    setActivities()
    {
        // Set up
        this.activities = {}
        this.activities.x = 0
        this.activities.y = 0 
        this.activities.multiplier = 5.5

        // Geometry
        this.activities.geometry = new THREE.PlaneBufferGeometry(2 * this.activities.multiplier, 1 * this.activities.multiplier, 1, 1)

        // Texture
        this.activities.texture = this.resources.items.informationActivitiesTexture
        this.activities.texture.magFilter = THREE.NearestFilter
        this.activities.texture.minFilter = THREE.LinearFilter

        // Material
        this.activities.material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: this.activities.texture, transparent: false })

        // Mesh
        this.activities.mesh = new THREE.Mesh(this.activities.geometry, this.activities.material)
        this.activities.mesh.position.x = this.activities.x
        this.activities.mesh.position.y = this.activities.y
        this.activities.mesh.matrixAutoUpdate = false
        this.activities.mesh.updateMatrix()
        this.container.add(this.activities.mesh)
    }

    setBoard(){
        const planeGeometry = new RoundedBoxGeometry( 4.85, 2.8,1, 8, 1);
        const planeMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        this.planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
        this.planeMesh.position.x = 0.0;
        this.planeMesh.position.y = 0;
        this.planeMesh.position.z = 2.1;
        this.planeMesh.rotation.x = -4.7;
        this.planeMesh.rotation.y = 0.1;
        this.planeMesh.matrixAutoUpdate = false;
        this.planeMesh.updateMatrix();
        this.container.add(this.planeMesh);
    }

    setAddMediaLabel() {
        // Set up
        this.addMediaLabel = {}
    
        const loader = new FontLoader();
    
        loader.load('fonts/comic_neue.json', (font) => {
            const geometry = new TextGeometry('Add Media', {
                font: font,
                size: 100, // adjust size
                height: 1, // adjust depth
            });
    
            this.addMediaLabel.material = new THREE.MeshBasicMaterial({ 
                transparent: false, 
                depthWrite: false, 
                // make the color light blue
                color: 0xB0C4DE
            });
            this.addMediaLabel.material.opacity = 1;
    
            this.addMediaLabel.mesh = new THREE.Mesh(
                geometry, 
                this.addMediaLabel.material
            );
            this.addMediaLabel.mesh.position.set(this.x-10, this.y, 2);
            this.addMediaLabel.mesh.matrixAutoUpdate = false;
            this.addMediaLabel.mesh.updateMatrix();
            console.log('Position of addMediaLabel:', this.addMediaLabel.mesh.position)
    
            this.container.add(this.addMediaLabel.mesh);
        });
    }
setPlaceholder() {
    // Add a null object to the scene as a child of this.pedestal, it should be 3x3x3
    this.placeholder = new THREE.Object3D();
    this.placeholder.position.set(this.x, this.y, 1);
    this.placeholder.scale.set(3, 3, 3);
    this.pedestal.add(this.placeholder); // Adding directly to the pedestal scene
  //  console.log('Placeholder added to pedestal:', this.placeholder);
}

setStatic() {
    this.pedestal = this.objects.add({
        base: this.resources.items.pedestalBase.scene,
        collision: this.resources.items.startStaticCollision.scene,
        floorShadowTexture: this.resources.items.startStaticFloorShadowTexture,
        material: this.resources.items.startStaticMaterial,
        offset: new THREE.Vector3(this.x, this.y, 1),
        mass: 0,
        rotation: new THREE.Euler(0, 0, 0),
    });
   // console.log('Static pedestal mesh added:', this.pedestal.mesh);
}

setButton() {
    this.pedestal.button = this.areas.add({
        position: new THREE.Vector2(this.x, this.y, 1),
        halfExtents: new THREE.Vector2(3, 3),
    });
   // console.log('Button added to pedestal:', this.pedestal.button);
}

addButtonFunctionality() {
    let prevObject = "";
    const fileInput = document.getElementById('threeFileInput');
    this.pedestal.button.on('interact', () => {
        console.log('Button interacted, opening file input.');

        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const scene = this.scene;
        console.log('Scene selected: ', scene );
        const camera = this.camera;

        console.log('Camera selected: ', camera );
        const renderer = this.renderer;

        console.log('Renderer selected: ', renderer );
        const file = event.target.files[0];
        console.log('File selected:', file);
        if (file) {
            if (prevObject !== ""){
                prevObject.visible = false;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const gltfLoader = new GLTFLoader();
                const dracoLoader = new DRACOLoader()
                    .setDecoderPath('draco/')
                    .setDecoderConfig({ type: 'js' });
                const KTX2_LOADER = new KTX2Loader()
                    .setTranscoderPath('basis/')
                    .detectSupport( renderer );
                gltfLoader.setDRACOLoader( dracoLoader )
                    .setKTX2Loader(KTX2_LOADER)
                    .setMeshoptDecoder(MeshoptDecoder);


                gltfLoader.parse(e.target.result, '', (gltf) => {

                    this.pedestal.label.container.visible = false;
                    gltf.scene.scale.set(1, 1, 1);
                    gltf.scene.position.set(this.x, this.y, 1);
                    scene.add( gltf.scene );
                    prevObject = gltf.scene;
                    const bboxHelper = new THREE.BoxHelper(gltf.scene, 0xff0000);
                    this.container.add(bboxHelper);
                    renderer.outputEncoding = THREE.sRGBEncoding;
                    renderer.render( scene, camera );
                    // Trigger a render/update if necessary
                    // yourRenderFunction(); // Uncomment or modify as needed
                });
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
            };
            reader.readAsArrayBuffer(file);
        }
    });
}

setImportedObject(){
    

}

setFailedLogic(){
    const gltfLoader = new GLTFLoader();
                gltfLoader.parse(e.target.result, '', (gltf) => {
                    console.log('GLTF parsed:', gltf);
                    gltf.scene.scale.set(3, 3, 3);
                    gltf.scene.position.set(6, 5, 1);

                    this.pedestal.add(gltf.scene); // Adding loaded scene to the pedestal
                    this.pedestal.placeholder = gltf.scene; // Updating placeholder
                    console.log('New GLTF scene set as placeholder.');
                }, (error) => {
                    console.error('Error parsing GLTF:', error);
                });
}

setObject() {
    // Check if carCyberTruckChassis is defined
    if (!this.resources.items.carCyberTruckChassis) {
        console.error('carCyberTruckChassis resource is not available.');
        // Optionally, load or initialize the resource here
        return;
    }
        
        // Add the object with the updated base object
        this.pedestal.mesh = this.objects.add({
            base: this.resources.items.carCyberTruckChassis.scene,
            offset: new THREE.Vector3(0, 0, -0.28),
            mass: 0,
            rotation: new THREE.Euler(0, 0, 0),
        });

        console.log('Cyber Truck Chassis added to pedestal:', this.pedestal.mesh);
}

setBowlingBall(){

   this.pedestal = this.objects.add({
        base: this.resources.items.bowlingBallBase.scene,
        collision: this.resources.items.bowlingBallCollision.scene,
        offset: new THREE.Vector3(this.x-6, this.y+5, 2),
        rotation: new THREE.Euler(Math.PI * 0.5, 0, 0),
        duplicated: true,
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.15, alpha: 0.35 },
        mass: 0,
        soundName: 'bowlingBall'
        // sleep: false
    })
}


setCar(){
    this.models = {}
            this.models.chassis = this.resources.items.carCyberTruckChassis
            this.models.antena = this.resources.items.carCyberTruckAntena
            this.models.backLightsBrake = this.resources.items.carCyberTruckBackLightsBrake
            this.models.backLightsReverse = this.resources.items.carCyberTruckBackLightsReverse
            this.models.wheel = this.resources.items.carCyberTruckWheel

            this.chassis = {}
            this.chassis.offset = new THREE.Vector3(0, 0, - 0.28)
            this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children)
            this.pedestal.add(this.chassis.object)

            this.antena = {}
    
            this.antena.object = this.objects.getConvertedMesh(this.models.antena.scene.children)
            this.chassis.object.add(this.antena.object)

            this.wheels = {}
            this.wheels.object = this.objects.getConvertedMesh(this.models.wheel.scene.children)
            this.wheels.items = []
    
            for(let i = 0; i < 4; i++)
            {
                const object = this.wheels.object.clone()
    
                this.wheels.items.push(object)
                this.pedestal.add(object)
            }
}



}
