import * as THREE from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Pedestal from '../Pedestal';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

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
        this.camera = _options.camera
        this.renderer = _options.renderer
        this.scene = _options.scene
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
        this.setPedestal()
        //this.setTest()
        
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


    setPedestal(){
        this.pedestal = new Pedestal({
            camera: this.camera,
            renderer: this.renderer,
            scene: this.scene,
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            walls: this.walls,
            tiles: this.tiles,
            debug: this.debug,
            x: this.x,
            y: this.y
        });
    }





}
