import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';


export default class Button {
  constructor(_options) {
    // Basic setup
    console.log("_options.position", _options.position)
    this.renderer = _options.renderer;
    this.camera = _options.camera;
    this.usePredefinedGeometry = _options.usePredefinedGeometry !== undefined ? _options.usePredefinedGeometry : true;
    this.color = _options.color || 0xffffff;
    this.shadows = _options.shadows || false;
    this.text = _options.text || '';
    this.size = _options.size || .6;
    this.size = _options.size || 1;

    this.hoverColor = _options.hoverColor || 0xffffff;
    this.onClick = _options.onClick || function() {};
    this.container = new THREE.Object3D();
    this.items = [];

    // Ensure this.position is a THREE.Vector3
    this.position = _options.position instanceof THREE.Vector3 ? _options.position : new THREE.Vector3();

    // Load the font and create the text geometry
    const fontLoader = new FontLoader();
    fontLoader.load(_options.fontPath || '/font.json', (font) => {
      const textMaterial = new THREE.MeshBasicMaterial({ color: this.hoverColor });
      const textShapes = font.generateShapes(this.text, this.size);
      const textGeometry = new THREE.ShapeGeometry(textShapes);

      // Center the text geometry
      textGeometry.computeBoundingBox();
      const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
      const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

      // Adjust the size of the text here as needed to fit the button
      const desiredTextWidth = this.size * 1.6; // for example, make the text width a bit less than the button width
      const scale = desiredTextWidth / textWidth;
      this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Apply scale to the text mesh
      this.textMesh.scale.set(scale, scale, 1);

      // Adjust position offsets
      this.textMesh.position.set(
        this.position.x - (textWidth * scale) / 2,
        this.position.y - (textHeight * scale) / 2 - 0.3,
        this.position.z  // You might need to adjust this to ensure the text is not intersecting the button
      );

      this.textMesh.rotation.x = Math.PI / 2;

      this.container.add(this.textMesh);
    });

    // Create button geometry
    this.buttonMesh = this.usePredefinedGeometry && _options.base ? 
      _options.base.clone() : 
      new THREE.Mesh(
        new RoundedBoxGeometry(this.size * 2, this.size, 0.3, 5, 0.1),
        new THREE.MeshBasicMaterial({
          color: this.color,
          specular: 0x050505,
          shininess: 100
        })
        
      );
      // rotate it by 90 degrees on X
      this.buttonMesh.rotation.x = Math.PI / 2;
      // increase the y position a bit
      this.buttonMesh.position.y = 10;

    // Position the button mesh
    this.buttonMesh.position.copy(this.position);
    this.container.add(this.buttonMesh);

    // Add interactivity
    //this.addInteractivity();
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