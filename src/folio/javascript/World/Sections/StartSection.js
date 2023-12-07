import * as THREE from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Pedestal from '../Pedestal';
import RoundedBoxGeometry from 'three-rounded-box';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import Label from '../Label'


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
        //this.setLabel()
        //this.setAddThisMediaLabel()
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

    setAddThisMediaLabel() {
        // Set up
        this.addThisMediaLabel = {}
    
        const loader = new FontLoader();
    
        loader.load('fonts/comic_neue.json', (font) => {
            const geometry = new TextGeometry('Add Media', {
                font: font,
                size: 1, // adjust size
                height: .2, // adjust depth
            });

            console.log('TextGeometry created', geometry);
    
            this.addThisMediaLabel.material = new THREE.MeshBasicMaterial({ 
                transparent: false, 
                depthWrite: false, 
                // make the color light blue
                color: 0x73CBDB
            });

            console.log('Material created', this.addThisMediaLabel.material);

            this.addThisMediaLabel.material.opacity = 1;
    
            this.addThisMediaLabel.mesh = new THREE.Mesh(
                geometry, 
                this.addThisMediaLabel.material
            );

            this.addThisMediaLabel.mesh.position.set(this.x, this.y, 1);
            this.addThisMediaLabel.mesh.matrixAutoUpdate = false;
            this.addThisMediaLabel.mesh.updateMatrix();
    
            this.container.add(this.addThisMediaLabel.mesh);
        }, undefined, (error) => {
            console.error('Error loading font:', error);
        });
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
            x: this.x-6,
            y: this.y+5
        });
        
    }

    setLabel(){
        this.pedestal.label = new Label({
            objects: this.objects,
            text: 'Add Media',
            size: .6,
            height: .1,
            color: 0x000000,
            x: this.x-6,
            y: this.y+5,
            z: 0
        });
    }





}
