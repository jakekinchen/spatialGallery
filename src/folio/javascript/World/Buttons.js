import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';


export default class Button {
  constructor(_options) {
    console.log('Options: ', _options);
    this.renderer = _options.renderer;
    this.camera = _options.camera;
    this.usePredefinedGeometry = _options.usePredefinedGeometry || true;
    // Default color to white
    this.color = _options.color || 0xffffff;
    this.shadows = _options.shadows || false;
    this.text = _options.text || '';
    this.time = _options.time
      this.areas = _options.areas
    this.size = _options.size || 0.6;
    this.hoverColor = _options.hoverColor || 0xffffff;
    this.position = _options.position
    this.onClick = _options.onClick || function() {};
    this.items = []
    this.container = new THREE.Object3D();


    // Relative path to the font file from the Buttons.js file
    const fontPath = '../../javascript/Comic_Neue_Regular.json';

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

  this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

  // Calculate the centered position for the text relative to the button
  const textOffsetX = -0.5 * textWidth;
  const textOffsetY = -0.5 * textHeight;
  const textOffsetZ = 0.1; // Raise text slightly above the button to avoid z-fighting

  // Apply the text position offset based on the button position
  // Assuming this.position refers to the center of the button mesh
  this.textMesh.position.x = this.position.x + textOffsetX;
  this.textMesh.position.y = this.position.y + textOffsetY;
  this.textMesh.position.z = .3 / 2 + textOffsetZ;

  this.container.add(this.textMesh);
});

    // Conditionally create button geometry based on usePredefinedGeometry flag
    if (_options.usePredefinedGeometry) {
      this.buttonMesh = _options.base.clone(); // Clone ensures we don't modify the original
    } else {
      // Create a geometry with rounded corners
      const buttonGeometry = new RoundedBoxGeometry(this.size * 2, this.size, .3, 5, 0.1);
      buttonGeometry.rotateX(Math.PI / 2); // Make it vertical
      this.buttonMesh = new THREE.Mesh(buttonGeometry, new THREE.MeshBasicMaterial({ color: this.color }));
    }

    // Set position and add to the container
    this.buttonMesh.position.copy(this.position);
    this.container.add(this.buttonMesh);
    this.buttonMesh.area = this.areas.add({
        //Change the position of button here
        position: new THREE.Vector3(this.buttonMesh.position.x, this.buttonMesh.position.y,this.buttonMesh.position.z),
        //Change size of button here
        halfExtents: new THREE.Vector2(this.buttonMesh.position.x, 0.5)
    })
    this.buttonMesh.area.on('interact', () =>
    {
      this.buttonMesh.material.map = new THREE.TextureLoader().load("../models/projects/keppler/slideA.jpg");
      this.buttonMesh.material.needsUpdate = true;
      console.log(this.buttonMesh)
    })    // Optional: Apply the text material to the button's geometry
    if (_options.applyTextMaterial && this.textMesh) {
      this.buttonMesh.material = this.textMesh.material;
    }

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