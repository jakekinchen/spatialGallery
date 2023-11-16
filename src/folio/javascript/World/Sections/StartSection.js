import * as THREE from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export default class StartSection
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

        this.resources.items.areaResetTexture.magFilter = THREE.NearestFilter
        this.resources.items.areaResetTexture.minFilter = THREE.LinearFilter

        // Assuming this is within a class that has access to this.objects, this.resources, etc.

        this.pedestal = new THREE.Scene();
        console.log('Pedestal scene created.');

        this.setStatic();
        this.setButton();
        this.setPlaceholder();
        this.addButtonFunctionality();
        //this.setObject();
       //this.setBowlingBall();
    }

setPlaceholder() {
    // Add a null object to the scene as a child of this.pedestal, it should be 3x3x3
    this.placeholder = new THREE.Object3D();
    this.placeholder.position.set(this.x-6, this.y+5, 1);
    this.placeholder.scale.set(3, 3, 3);
    this.pedestal.add(this.placeholder); // Adding directly to the pedestal scene
    console.log('Placeholder added to pedestal:', this.placeholder);
}

setStatic() {
    this.pedestal.mesh = this.objects.add({
        base: this.resources.items.pedestalBase.scene,
        collision: this.resources.items.startStaticCollision.scene,
        floorShadowTexture: this.resources.items.startStaticFloorShadowTexture,
        material: this.resources.items.startStaticMaterial,
        offset: new THREE.Vector3(this.x-6, this.y+5, 1),
        mass: 0,
        rotation: new THREE.Euler(0, 0, 0),
    });
    console.log('Static pedestal mesh added:', this.pedestal.mesh);
}

setButton() {
    this.pedestal.button = this.areas.add({
        position: new THREE.Vector2(this.x-6, this.y+5, 1),
        halfExtents: new THREE.Vector2(3, 3),
    });
    console.log('Button added to pedestal:', this.pedestal.button);
}

addButtonFunctionality() {
    const fileInput = document.getElementById('threeFileInput');
    this.pedestal.button.on('interact', () => {
        console.log('Button interacted, opening file input.');
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        console.log('File selected:', file);

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                this.setBowlingBall();
                
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
            };

            reader.readAsArrayBuffer(file);
            this.setBowlingBall();
        }
    });
}

setFailedLogic(){
    const gltfLoader = new GLTFLoader();
                gltfLoader.parse(e.target.result, '', (gltf) => {
                    console.log('GLTF parsed:', gltf);
                    gltf.scene.scale.set(3, 3, 3);
                    gltf.scene.position.set(this.x-6, this.y+5, 1);

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
