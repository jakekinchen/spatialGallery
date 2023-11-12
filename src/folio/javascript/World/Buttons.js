import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

export default class Button {
  constructor(scene, _options) {
    this.scene = scene;
    this.color = _options.color || 0xaaaaaa;
    this.text = _options.text || '';
    this.size = _options.size || 1;
    this.hoverColor = _options.hoverColor || 0xffffff;
    this.position = _options.position || new THREE.Vector3(0, 0, 0);
    this.onClick = _options.onClick || function() {};

    // Relative path to the font file from the Buttons.js file
    const fontPath = '../../javascript/Comic_Neue_Regular.json';

    this.loader = new FontLoader();
    this.loader.load(fontPath, (font) => {
        // Once the font is loaded, create text geometry
        this.textGeometry = new TextGeometry(this.text, {
            font: font,
            size: this.size * 0.5,
            height: this.size * 0.1
        });

        this.textMesh = new THREE.Mesh(this.textGeometry, new THREE.MeshBasicMaterial({ color: this.hoverColor }));
        this.textMesh.position.copy(this.position);

        // Center the text geometry
        this.textGeometry.computeBoundingBox();
        const textWidth = this.textGeometry.boundingBox.max.x - this.textGeometry.boundingBox.min.x;
        this.textMesh.position.x -= textWidth / 2;

        // Add the text mesh to the scene
        this.scene.add(this.textMesh);
    });

    // Create the button mesh and add it to the scene
    this.material = new THREE.MeshBasicMaterial({ color: this.color });
    this.geometry = new THREE.BoxGeometry(this.size * 2, this.size, this.size * 0.5);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    // Add interactivity (implementation needed)
    this.addInteractivity();
}



    addInteractivity(renderer) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
    
        const onMouseMove = (event) => {
          // calculate mouse position in normalized device coordinates
          // (-1 to +1) for both components
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
          // update the picking ray with the camera and mouse position
          raycaster.setFromCamera(mouse, camera);
    
          // calculate objects intersecting the picking ray
          const intersects = raycaster.intersectObjects([this.mesh]);
    
          if (intersects.length > 0) {
            this.setHover(true);
          } else {
            this.setHover(false);
          }
        };
    
        const onMouseDown = (event) => {
          // similar raycasting logic to detect if the button is clicked
          // and invoke the onClick handler if it is
          this.onClick();
        };
    
        // Add event listeners
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
      }


    setHover(isHover) {
        // Change button color when hovered
        this.mesh.material.color.set(isHover ? this.hoverColor : this.color);
    }
}