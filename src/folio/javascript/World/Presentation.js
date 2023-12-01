import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import Button from './Button.js'
import Resources from '../Resources.js';
import Pedestal from '../Pedestal.js';
import Board from '../Board.js';


export default class Presentation {
  constructor(_options) {
    // Basic setup
    console.log("_options.position", _options.position)
    //this.renderer = _options.renderer;
    //this.camera = _options.camera;
    //this.usePredefinedGeometry = _options.usePredefinedGeometry !== undefined ? _options.usePredefinedGeometry : true;
    this.color = _options.color || 0xffffff;
    this.shadows = _options.shadows || true;
    this.text = _options.text || '';
    this.size = _options.size || .6;
    this.resources = _options.resources;
    this.objects = _options.objects;
    this.hoverColor = _options.hoverColor || 0xffffff;
    this.onClick = _options.onClick || function() {};
    this.container = new THREE.Object3D();
    this.items = [];

    // Ensure this.position is a THREE.Vector3
    this.position = _options.position instanceof THREE.Vector3 ? _options.position : new THREE.Vector3();
        setButton();
      }


    setButton() {
        // Create button geometry
        if (usePredefinedGeometry) {
        const buttonGeometry =  new RoundedBoxGeometry(2, 1, 0.1, 0.1, 0.1, 0.1, 0.05);

        // Create button material
        const buttonMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
        });

        // Create button mesh
        this.mesh = new THREE.Mesh(buttonGeometry, buttonMaterial);

        // Set position
        this.mesh.position.copy(this.position);

        // Add mesh to container
        this.container.add(this.mesh);
        }
        else {
            this.objects.add({
                base: this.resources.items.startStaticBase.scene,
                collision: this.resources.items.startStaticCollision.scene,
                floorShadowTexture: this.resources.items.startStaticFloorShadowTexture,
                offset: new THREE.Vector3(this.x, this.y, 1),
                rotation: new THREE.Euler(0, 0, 18.5)
            })

        // Add interactivity
        //this.addInteractivity();
    }
    }



/*
addInteractivity() {
  // Check if renderer and camera are available
  if (!this.renderer || !this.camera) {
      console.error('Button requires a valid renderer and camera to add interactivity.');
      return;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const onMouseMove = (event) => {

      // calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
      // update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, this.camera);

      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects([this.mesh]);

      if (intersects.length > 0) {
          this.setHover(true);
      } else {
          this.setHover(false);
      }
  };

  const onMouseDown = (event) => {
      const intersects = raycaster.intersectObjects([this.mesh]);
      if (intersects.length > 0) {
          this.onClick();
      }
  };

  // Add event listeners
  this.renderer.domElement.addEventListener('mousemove', onMouseMove, true);
  this.renderer.domElement.addEventListener('mousedown', onMouseDown, false);
}*/



    setHover(isHover) {
        // Change button color when hovered
        this.mesh.material.color.set(isHover ? this.hoverColor : this.color);
    }
}