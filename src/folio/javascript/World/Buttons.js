import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';


export default class Button {
  constructor(_options) {
    console.log('Options: ', _options)
    this.renderer = _options.renderer;
    this.camera = _options.camera;
    // make default color a white
    this.color = _options.color || 0xffffff;
    this.text = _options.text || '';
    this.time = _options.time
      this.areas = _options.areas
    this.size = _options.size || .6;
    this.hoverColor = _options.hoverColor || 0xffffff;
    this.position = _options.position
    this.onClick = _options.onClick || function() {};
    this.items = []
    this.container = new THREE.Object3D();


    // Relative path to the font file from the Buttons.js file
    const fontPath = '../../javascript/Comic_Neue_Regular.json';

    // Load the font and create the text geometry
    const fontLoader = new FontLoader();
    fontLoader.load(fontPath, (font) => {
      const textMaterial = new THREE.MeshBasicMaterial({ color: this.hoverColor });
      const textShapes = font.generateShapes(this.text, this.size);
      const textGeometry = new THREE.ShapeGeometry(textShapes);
      textGeometry.computeBoundingBox();
      
      // Center the text geometry
      const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
      const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
      textGeometry.translate(-0.5 * textWidth, -0.5 * textHeight, 0.1); // Adjust the 0.1 if needed
      
      this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
      this.container.add(this.textMesh);
    });

    // Button geometry with rounded corners
    const buttonGeometry = new RoundedBoxGeometry(this.size * 2, this.size, .3, 5, 1);
    // Adjust the 0.1 thickness and 0.05 borderRadius as needed
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: this.color });
    // Rotate the button by 90 degrees to make it vertical
    buttonGeometry.rotateX(Math.PI / 2);
    this.buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
    this.buttonMesh.position.copy(this.position);
    this.container.add(this.buttonMesh);
    //console.log(this.buttonMesh)
    this.buttonMesh = this.areas.add({
        position: new THREE.Vector3(this.buttonMesh.position.x, this.buttonMesh.position.y,this.buttonMesh.position.z),
        halfExtents: new THREE.Vector2(this.buttonMesh.position.x, 0.5)
    })
    this.buttonMesh.on('interact', () =>
    {
      console.log(this.buttonMesh)
    })
    // Add interactivity (implementation needed)
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