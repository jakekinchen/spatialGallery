import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TweenLite } from 'gsap/TweenLite'
import { Power1 } from 'gsap/EasePack'
import React, { Component, useRef, useCallback } from 'react';
import {PerspectiveCamera} from "@react-three/drei";
import {useThree} from "@react-three/fiber";
const CameraComponent = () => {
  const angle = useRef<any>();
  const debug = useRef<any>();
  const debugFolder = useRef<any>();
  const instance = useRef<any>();
  const container = useRef<any>();
  const sizes = useRef<any>();
  const time = useRef<any>();
  const easing = useRef<any>();
  const targetEased = useRef<any>();
  const zoom = useRef<any>();
  const pan = useRef<any>();
  const orbitControls = useRef<any>();
  const { gl: renderer, scene } = useThree();

  const setAngle = useCallback(() => {
    // Set up
    angle.current = {}; // Items

    angle.current.items = {
      default: new THREE.Vector3(1.135, -1.45, 1.15),
      projects: new THREE.Vector3(0.38, -1.4, 1.63) // Value

    };
    angle.current.value = new THREE.Vector3();
    angle.current.value.copy(angle.items.default); // Set method

    angle.current.set = _name => {
      const angle = angle.current.items[_name];

      if (typeof angle !== 'undefined') {
        TweenLite.to(angle.current.value, 2, { ...angle,
          ease: Power1.easeInOut
        });
      }
    }; // Debug

/*
    if (debug.current) {
      debugFolder.current.add(this, 'easing').step(0.0001).min(0).max(1).name('easing');
      debugFolder.current.add(props.value, 'x').step(0.001).min(-2).max(2).name('invertDirectionX').listen();
      debugFolder.current.add(props.value, 'y').step(0.001).min(-2).max(2).name('invertDirectionY').listen();
      debugFolder.current.add(props.value, 'z').step(0.001).min(-2).max(2).name('invertDirectionZ').listen();
    }*/
  },[]);
  const setInstance = useCallback(() => {
    // Set up
    instance.current = new THREE.PerspectiveCamera(40, sizes.current.viewport.width / sizes.current.viewport.height, 1, 80);
    instance.current.up.set(0, 0, 1);
    instance.current.position.copy(instance.current.value);
    instance.current.lookAt(new THREE.Vector3());
    container.current.add(instance.current); // Resize event

    sizes.current.on('resize', () => {
      sizes.current.aspect = sizes.current.viewport.width / sizes.current.viewport.height;
      instance.current.updateProjectionMatrix();
    }); // Time tick

    time.current.on('tick', () => {
      if (!time.current.enabled) {
        time.current.x += (time.current.x - time.current.x) * easing.current;
        time.current.y += (time.current.y - time.current.y) * easing.current;
        time.current.z += (time.current.z - time.current.z) * easing.current; // Apply zoom

        time.current.position.copy(targetEased.current).add(time.current.value.clone().normalize().multiplyScalar(time.current.distance)); // Look at target

        instance.current.lookAt(targetEased.current); // Apply pan

        instance.current.position.x += pan.current.value.x;
        instance.current.position.y += pan.current.value.y;
      }
    });
  },[]);
  const setZoom = useCallback(() => {
    // Set up
    zoom.current = {};
    zoom.current.easing = 0.1;
    zoom.current.minDistance = 14;
    zoom.current.amplitude = 15;
    zoom.current.value = zoom.current.cyberTruck ? 0.3 : 0.5;
    zoom.current.targetValue = zoom.current.value;
    zoom.current.distance = zoom.current.minDistance + zoom.current.amplitude * zoom.current.value; // Listen to mousewheel event

    document.addEventListener('mousewheel', _event => {
      zoom.current.targetValue += _event.deltaY * 0.001;
      zoom.current.targetValue = Math.min(Math.max(zoom.current.targetValue, 0), 1);
    }, {
      passive: true
    }); // Touch

    zoom.current.touch = {};
    zoom.current.touch.startDistance = 0;
    zoom.current.touch.startValue = 0;
    zoom.current.domElement.addEventListener('touchstart', _event => {
      if (_event.touches.length === 2) {
        zoom.current.touch.startDistance = Math.hypot(_event.touches[0].clientX - _event.touches[1].clientX, _event.touches[0].clientX - _event.touches[1].clientX);
        zoom.current.touch.startValue = zoom.current.targetValue;
      }
    });
    zoom.current.domElement.addEventListener('touchmove', _event => {
      if (_event.touches.length === 2) {
        _event.preventDefault();

        const distance = Math.hypot(_event.touches[0].clientX - _event.touches[1].clientX, _event.touches[0].clientX - _event.touches[1].clientX);
        const ratio = distance / zoom.current.touch.startDistance;
        zoom.current.targetValue = zoom.current.touch.startValue - (ratio - 1);
        zoom.current.targetValue = Math.min(Math.max(zoom.current.targetValue, 0), 1);
      }
    }); // Time tick event

    time.current.on('tick', () => {
      zoom.current.value += (zoom.current.targetValue - zoom.current.value) * zoom.current.easing;
      zoom.current.distance = zoom.current.minDistance + zoom.current.amplitude * zoom.current.value;
    });
  },[]);
  const setPan = useCallback(() => {
    // Set up
    pan.current = {};
    pan.current.enabled = false;
    pan.current.active = false;
    pan.current.easing = 0.1;
    pan.current.start = {};
    pan.current.start.x = 0;
    pan.current.start.y = 0;
    pan.current.value = {};
    pan.current.value.x = 0;
    pan.current.value.y = 0;
    pan.current.targetValue = {};
    pan.current.targetValue.x = pan.current.value.x;
    pan.current.targetValue.y = pan.current.value.y;
    pan.current.raycaster = new THREE.Raycaster();
    pan.current.mouse = new THREE.Vector2();
    pan.current.needsUpdate = false;
    pan.current.hitMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 1, 1), new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      visible: false
    }));
    container.current.add(pan.current.hitMesh);

    pan.current.reset = () => {
      pan.current.targetValue.x = 0;
      pan.current.targetValue.y = 0;
    };

    pan.current.enable = () => {
      pan.current.enabled = true; // Update cursor

      renderer.domElement.classList.add('has-cursor-grab');
    };

    pan.current.disable = () => {
      pan.current.enabled = false; // Update cursor

      renderer.domElement.classList.remove('has-cursor-grab');
    };

    pan.current.down = (_x, _y) => {
      if (!pan.current.enabled) {
        return;
      } // Update cursor


      renderer.domElement.classList.add('has-cursor-grabbing'); // Activate

      pan.current.active = true; // Update mouse position

      pan.current.mouse.x = _x / sizes.current.viewport.width * 2 - 1;
      pan.current.mouse.y = -(_y / sizes.current.viewport.height) * 2 + 1; // Get start position

      pan.current.raycaster.setFromCamera(pan.current.mouse, instance.current);
      const intersects = pan.current.raycaster.intersectObjects([pan.current.hitMesh]);

      if (intersects.length) {
        pan.current.start.x = intersects[0].point.x;
        pan.current.start.y = intersects[0].point.y;
      }
    };

    pan.current.move = (_x, _y) => {
      if (!pan.current.enabled) {
        return;
      }

      if (!pan.current.active) {
        return;
      }

      pan.current.mouse.x = _x / sizes.current.viewport.width * 2 - 1;
      pan.current.mouse.y = -(_y / sizes.current.viewport.height) * 2 + 1;
      pan.current.needsUpdate = true;
    };

    pan.current.up = () => {
      // Deactivate
      pan.current.active = false; // Update cursor

      renderer.domElement.classList.remove('has-cursor-grabbing');
    }; // Mouse


    window.addEventListener('mousedown', _event => {
      pan.current.down(_event.clientX, _event.clientY);
    });
    window.addEventListener('mousemove', _event => {
      pan.current.move(_event.clientX, _event.clientY);
    });
    window.addEventListener('mouseup', () => {
      pan.current.up();
    }); // Touch

    pan.current.domElement.addEventListener('touchstart', _event => {
      if (_event.touches.length === 1) {
        pan.current.down(_event.touches[0].clientX, _event.touches[0].clientY);
      }
    });
    pan.current.domElement.addEventListener('touchmove', _event => {
      if (_event.touches.length === 1) {
        pan.current.move(_event.touches[0].clientX, _event.touches[0].clientY);
      }
    });
    pan.current.domElement.addEventListener('touchend', () => {
      pan.current.up();
    }); // Time tick event

    time.current.on('tick', () => {
      // If active
      if (pan.current.active && pan.current.needsUpdate) {
        // Update target value
        pan.current.raycaster.setFromCamera(pan.current.mouse, instance.current);
        const intersects = pan.current.raycaster.intersectObjects([pan.current.hitMesh]);

        if (intersects.length) {
          pan.current.targetValue.x = -(intersects[0].point.x - pan.current.start.x);
          pan.current.targetValue.y = -(intersects[0].point.y - pan.current.start.y);
        } // Update needsUpdate


        pan.current.needsUpdate = false;
      } // Update value and apply easing


      pan.current.value.x += (pan.current.targetValue.x - pan.current.value.x) * pan.current.easing;
      pan.current.value.y += (pan.current.targetValue.y - pan.current.value.y) * pan.current.easing;
    });
  },[]);
  const setOrbitControls = useCallback(() => {
    // Set up
    orbitControls.current = new OrbitControls(instance.current, orbitControls.current.domElement);
    orbitControls.current.enabled = false;
    orbitControls.current.enableKeys = false;
    orbitControls.current.zoomSpeed = 0.5; // Debug

    if (debug.current) {
      debugFolder.current.add(orbitControls.current, 'enabled').name('orbitControlsEnabled');
    }
  },[]);

  return null;
};
export default CameraComponent;
