import * as THREE from 'three'
import * as dat from 'dat.gui'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import World from './World/index.js'
import Resources from './Resources.js'
import Camera from './Camera.js'
import ThreejsJourney from './ThreejsJourney.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import BlurPass from './Passes/Blur.js'
import GlowsPass from './Passes/Glows.js'
import React, { Component, useRef, useCallback, useEffect } from "react";

const Folio = () => {
  useEffect(() => {
    // Set up
    time.current = new Time();
    sizes.current = new Sizes();
    resources.current = new Resources();
    setConfig();
    setDebug();
    setRenderer();
    setCamera();
    setPasses();
    setWorld();
    setTitle();
    setThreejsJourney();
    return destructor;
  }, []);
  const time = useRef<any>();
  const sizes = useRef<any>();
  const resources = useRef<any>();
  const config = useRef<any>();
  const debug = useRef<any>();
  const scene = useRef<any>();
  const renderer = useRef<any>();
  const $canvas = useRef<any>();
  const camera = useRef<any>();
  const world = useRef<any>();
  const passes = useRef<any>();
  const title = useRef<any>();
  const threejsJourney = useRef<any>();
  const setConfig = useCallback(() => {
    config.current = {};
    config.current.debug = window.location.hash === '#debug';
    config.current.cyberTruck = window.location.hash === '#cybertruck';
    config.current.touch = false;
    window.addEventListener('touchstart', () => {
      config.current.touch = true;
      config.current.controls.setTouch();
      passes.current.horizontalBlurPass.strength = 1;
      passes.current.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(passes.current.horizontalBlurPass.strength, 0);
      passes.current.verticalBlurPass.strength = 1;
      passes.current.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, passes.current.verticalBlurPass.strength);
    }, {
      once: true
    });
  },[]);
  const setDebug = useCallback(() => {
    if (config.current.debug) {
      debug.current = new dat.GUI({
        width: 420
      });
    }
  },[]);
  const setRenderer = useCallback(() => {
    // Scene
    scene.current = new THREE.Scene(); // Renderer

    renderer.current = new THREE.WebGLRenderer({
      canvas: $canvas.current,
      alpha: true
    }); // renderer.current.setClearColor(0x414141, 1)

    renderer.current.setClearColor(0x000000, 1); // renderer.current.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2))

    renderer.current.setPixelRatio(2);
    renderer.current.setSize(sizes.current.viewport.width, sizes.current.viewport.height);
    config.current.physicallyCorrectLights = true;
    config.current.gammaFactor = 2.2;
    config.current.gammaOutPut = true;
    config.current.autoClear = false; // Resize event

    sizes.current.on('resize', () => {
      renderer.current.setSize(sizes.current.viewport.width, sizes.current.viewport.height);
    });
  },[]);
  const setCamera = useCallback(() => {
    camera.current = new Camera({
      time: time.current,
      sizes: sizes.current,
      renderer: renderer.current,
      debug: debug.current,
      config: config.current
    });
    scene.current.add(config.current.container);
    time.current.on('tick', () => {
      if (world.current && config.current.car) {
        camera.current.target.x = world.current.car.chassis.object.position.x;
        camera.current.target.y = world.current.car.chassis.object.position.y;
      }
    });
  },[]);
  const setPasses = useCallback(() => {
    passes.current = {}; // Debug

    if (debug.current) {
      config.current.debugFolder = debug.current.addFolder('postprocess'); // passes.current.debugFolder.open()
    }

    config.current.composer = new EffectComposer(renderer.current); // Create passes

    config.current.renderPass = new RenderPass(scene.current, config.current.instance);
    config.current.horizontalBlurPass = new ShaderPass(BlurPass);
    passes.current.horizontalBlurPass.strength = config.current.touch ? 0 : 1;
    passes.current.horizontalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(sizes.current.viewport.width, sizes.current.viewport.height);
    passes.current.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(passes.current.horizontalBlurPass.strength, 0);
    config.current.verticalBlurPass = new ShaderPass(BlurPass);
    passes.current.verticalBlurPass.strength = config.current.touch ? 0 : 1;
    passes.current.verticalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(sizes.current.viewport.width, sizes.current.viewport.height);
    passes.current.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, passes.current.verticalBlurPass.strength); // Debug

    if (debug.current) {
      const folder = config.current.debugFolder.addFolder('blur');
      folder.open();
      folder.add(passes.current.horizontalBlurPass.material.uniforms.uStrength.value, 'x').step(0.001).min(0).max(10);
      folder.add(passes.current.verticalBlurPass.material.uniforms.uStrength.value, 'y').step(0.001).min(0).max(10);
    }

    config.current.glowsPass = new ShaderPass(GlowsPass);
    passes.current.glowsPass.color = '#ffcfe0';
    passes.current.glowsPass.material.uniforms.uPosition.value = new THREE.Vector2(0, 0.25);
    passes.current.glowsPass.material.uniforms.uRadius.value = 0.7;
    passes.current.glowsPass.material.uniforms.uColor.value = new THREE.Color(passes.current.glowsPass.color);
    passes.current.glowsPass.material.uniforms.uAlpha.value = 0.55; // Debug

    if (debug.current) {
      const folder = config.current.debugFolder.addFolder('glows');
      folder.open();
      folder.add(passes.current.glowsPass.material.uniforms.uPosition.value, 'x').step(0.001).min(-1).max(2).name('positionX');
      folder.add(passes.current.glowsPass.material.uniforms.uPosition.value, 'y').step(0.001).min(-1).max(2).name('positionY');
      folder.add(passes.current.glowsPass.material.uniforms.uRadius, 'value').step(0.001).min(0).max(2).name('radius');
      folder.addColor(config.current.glowsPass, 'color').name('color').onChange(() => {
        passes.current.glowsPass.material.uniforms.uColor.value = new THREE.Color(passes.current.glowsPass.color);
      });
      folder.add(passes.current.glowsPass.material.uniforms.uAlpha, 'value').step(0.001).min(0).max(1).name('alpha');
    } // Add passes


    config.current.composer.addPass(config.current.renderPass);
    config.current.composer.addPass(config.current.horizontalBlurPass);
    config.current.composer.addPass(config.current.verticalBlurPass);
    config.current.composer.addPass(config.current.glowsPass); // Time tick

    time.current.on('tick', () => {
      passes.current.horizontalBlurPass.enabled = passes.current.horizontalBlurPass.material.uniforms.uStrength.value.x > 0;
      passes.current.verticalBlurPass.enabled = passes.current.verticalBlurPass.material.uniforms.uStrength.value.y > 0; // Renderer

      config.current.composer.render(); // renderer.current.domElement.style.background = 'black'
      // renderer.current.render(scene, this.current.camera.instance)
    }); // Resize event

    sizes.current.on('resize', () => {
      renderer.current.setSize(sizes.current.viewport.width, sizes.current.viewport.height);
      config.current.composer.setSize(sizes.current.viewport.width, sizes.current.viewport.height);
      passes.current.horizontalBlurPass.material.uniforms.uResolution.value.x = sizes.current.viewport.width;
      passes.current.horizontalBlurPass.material.uniforms.uResolution.value.y = sizes.current.viewport.height;
      passes.current.verticalBlurPass.material.uniforms.uResolution.value.x = sizes.current.viewport.width;
      passes.current.verticalBlurPass.material.uniforms.uResolution.value.y = sizes.current.viewport.height;
    });
  },[]);
  const setWorld = useCallback(() => {
    world.current = new World({
      config: config.current,
      debug: debug.current,
      resources: resources.current,
      time: time.current,
      sizes: sizes.current,
      camera: camera.current,
      renderer: renderer.current,
      passes: passes.current
    });
    scene.current.add(config.current.container);
  },[]);
  const setTitle = useCallback(() => {
    title.current = {};
    config.current.frequency = 300;
    config.current.width = 20;
    config.current.position = 0;
    config.current.$element = document.querySelector('title');
    config.current.absolutePosition = Math.round(config.current.width * 0.25);
    time.current.on('tick', () => {
      if (config.current.physics) {
        config.current.absolutePosition += world.current.physics.car.forwardSpeed;

        if (config.current.absolutePosition < 0) {
          config.current.absolutePosition = 0;
        }
      }
    });
    window.setInterval(() => {
      config.current.position = Math.round(config.current.absolutePosition % config.current.width);
      document.title = `${'_'.repeat(config.current.width - config.current.position)}🚗${'_'.repeat(config.current.position)}`;
    }, config.current.frequency);
  },[]);
  const setThreejsJourney = useCallback(() => {
    threejsJourney.current = new ThreejsJourney({
      config: config.current,
      time: time.current,
      world: world.current
    });
  },[]);
  const destructor = useCallback(() => {
    time.current.off('tick');
    sizes.current.off('resize');
    config.current.orbitControls.dispose();
    renderer.current.dispose();
    debug.current.destroy();
  },[]);
  return null;
};

export default Folio;
