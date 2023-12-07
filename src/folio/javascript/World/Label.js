import * as THREE from 'three';
import RoundedBoxGeometry from 'three-rounded-box';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader';

export default class Label {
    constructor(_options) {
        // Options
        this.materials = _options.materials
        this.objects = _options.objects;
        this.text = _options.text || 'Add Media';
        this.size = _options.size || .6;
        this.height = _options.height || .1;
        this.color = _options.color || 0x000000;
        this.x = _options.x || 0;
        this.y = _options.y || 0;
        this.z = _options.z || 0;

        // Set up
        this.label = new THREE.Object3D();
        this.label.matrixAutoUpdate = false;

        // Load font and create label
        this.loadFontAndCreateLabel();
    }

    loadFontAndCreateLabel() {
        const loader = new FontLoader();
        loader.load('fonts/comic_neue.json', (font) => {
            this.createAddLabel(font);
        }, undefined, (error) => {
            console.error('Error loading font:', error);
        });
    }

    createAddLabel(font){
        const geometry = new TextGeometry(this.text, {
            font: font,
            size: this.size,
            height: this.height,
        });

        const material = new THREE.MeshBasicMaterial({ 
            transparent: false, 
            depthWrite: false, 
            color: 0x000000
        });
        material.opacity = 1;

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(this.x-1.8, this.y-.3, this.z);
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();

        this.label.new = this.objects.add({
            base: { children: [mesh] },
            collision: { children: [mesh] },
            mass: 0,
            offset: new THREE.Vector3(0, 0, 1),
            rotation: new THREE.Euler(0, 0, 0),
            sleep: true
        });

    }
}
