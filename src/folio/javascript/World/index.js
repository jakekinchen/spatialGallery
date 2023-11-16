import * as THREE from 'three'
import Materials from './Materials.js'
import Shadows from './Shadows.js'
import Physics from './Physics.js'
import Zones from './Zones.js'
import Objects from './Objects.js'
import Car from './Car.js'
import Areas from './Areas.js'
import Tiles from './Tiles.js'
import Walls from './Walls.js'
import IntroSection from './Sections/IntroSection.js'
import ProjectsSection from './Sections/ProjectsSection.js'
import Button from './Buttons.js'
import CrossroadsSection from './Sections/CrossroadsSection.js'
import InformationSection from './Sections/InformationSection.js'
import PlaygroundSection from './Sections/PlaygroundSection.js'
import StartSection from './Sections/StartSection.js'
import Board from './Board'
import Controls from './Controls.js'
//import Sounds from './Sounds.js'
import { TweenLite } from 'gsap/TweenLite'
import { Power2 } from 'gsap/EasePack'
import EasterEggs from './EasterEggs.js'

export default class
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.sizes = _options.sizes
        this.camera = _options.camera
        this.renderer = _options.renderer
        this.passes = _options.passes

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // this.setAxes()
        //this.setSounds()
        this.setControls()
        this.setAreas()
        this.setStartingScreen()
    }

    start()
    {
        window.setTimeout(() =>
        {
            this.camera.pan.enable()
        }, 2000)

        this.setReveal()
        this.setMaterials()
        this.setShadows()
        this.setPhysics()
        this.setZones()
        this.setObjects()
        this.setCar()
       // this.setButtons()
        this.areas.car = this.car
        this.setTiles()
        this.setWalls()
        this.setSections()
        //this.setEasterEggs()
    }

    setReveal()
    {
        this.reveal = {}
        this.reveal.matcapsProgress = 0
        this.reveal.floorShadowsProgress = 0
        this.reveal.previousMatcapsProgress = null
        this.reveal.previousFloorShadowsProgress = null

        // Go method
        this.reveal.go = () =>
        {
            TweenLite.fromTo(this.reveal, 3, { matcapsProgress: 0 }, { matcapsProgress: 1 })
            TweenLite.fromTo(this.reveal, 3, { floorShadowsProgress: 0 }, { floorShadowsProgress: 1, delay: 0.5 })
            TweenLite.fromTo(this.shadows, 3, { alpha: 0 }, { alpha: 0.5, delay: 0.5 })

            if(this.sections.intro)
            {
                TweenLite.fromTo(this.sections.intro.instructions.arrows.label.material, 0.3, { opacity: 0 }, { opacity: 1, delay: 0.5 })
                if(this.sections.intro.otherInstructions)
                {
                    TweenLite.fromTo(this.sections.intro.otherInstructions.label.material, 0.3, { opacity: 0 }, { opacity: 1, delay: 0.75 })
                }
            }

            // Car
            this.physics.car.chassis.body.sleep()
            this.physics.car.chassis.body.position.set(0, 0, 12)

            window.setTimeout(() =>
            {
                this.physics.car.chassis.body.wakeUp()
            }, 300)

            // Sound
            //TweenLite.fromTo(this.sounds.engine.volume, 0.5, { master: 0 }, { master: 0.7, delay: 0.3, ease: Power2.easeIn })
            window.setTimeout(() =>
            {
                //this.sounds.play('reveal')
            }, 400)

            // Controls
            if(this.controls.touch)
            {
                window.setTimeout(() =>
                {
                    this.controls.touch.reveal()
                }, 400)
            }
        }

        // Time tick
        this.time.on('tick',() =>
        {
            // Matcap progress changed
            if(this.reveal.matcapsProgress !== this.reveal.previousMatcapsProgress)
            {
                // Update each material
                for(const _materialKey in this.materials.shades.items)
                {
                    const material = this.materials.shades.items[_materialKey]
                    material.uniforms.uRevealProgress.value = this.reveal.matcapsProgress
                }

                // Save
                this.reveal.previousMatcapsProgress = this.reveal.matcapsProgress
            }

            // Matcap progress changed
            if(this.reveal.floorShadowsProgress !== this.reveal.previousFloorShadowsProgress)
            {
                // Update each floor shadow
                for(const _mesh of this.objects.floorShadows)
                {
                    _mesh.material.uniforms.uAlpha.value = this.reveal.floorShadowsProgress
                }

                // Save
                this.reveal.previousFloorShadowsProgress = this.reveal.floorShadowsProgress
            }
        })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.reveal, 'matcapsProgress').step(0.0001).min(0).max(1).name('matcapsProgress')
            this.debugFolder.add(this.reveal, 'floorShadowsProgress').step(0.0001).min(0).max(1).name('floorShadowsProgress')
            this.debugFolder.add(this.reveal, 'go').name('reveal')
        }
    }

    setStartingScreen()
    {
        this.startingScreen = {}

        // Area
        this.startingScreen.area = this.areas.add({
            position: new THREE.Vector2(0, 0),
            halfExtents: new THREE.Vector2(2.35, 1.5),
            hasKey: false,
            testCar: false,
            active: false
        })

        // Loading label
        this.startingScreen.loadingLabel = {}
        this.startingScreen.loadingLabel.geometry = new THREE.PlaneBufferGeometry(2.5, 2.5 / 4)
        this.startingScreen.loadingLabel.image = new Image()
        this.startingScreen.loadingLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///9ra2ucnJzR0dH09PQmJiaNjY24uLjp6end3d1CQkLFxcVYWFiqqqp9fX3nQ5qrAAAEVUlEQVRo3u3YT08TQRQA8JEtW6CATGnDdvljaTwYE2IBI/HGRrwSetGTsZh4MPFQYiQe229gE++WePFY9Oqh1cRzieEDYIgXLxjPJu5M33vbZQszW+fgoS+B7ewO836znRl2lg1jGMP4P2Okw0yFvaKsklr3I99Tvl3iPPelGbQhKqxB4eN6N/7gVcsvbEAz1F4RLn67zzl/v6/oLvejGBQ9LsNphio4UFjmEAsVJuOK/zkDtc6w+gyTcZ3LyP6IAzjBDA+pj6LkEgAjW4kANsMAC6vmOvqAMU5RgVOTskQACicCmCcA9AXjkT5gj1MswqlxWcoTgKJ6HuAQAD5guNoAu8QpMnBul1ONMGD2PCBbRgDAKYq6AEtmXvtdj3S6GhRyW1t1DvkAgM0ggG7mu1t3xWFHFzAqv3wYCi0mY1UCGgiQPU+1oWIY8LoXcAA3qeYfr+kClvHW14PJ5OfCAgHYNAoDAORBQIrDvHjqH5c0ANTbORzBacbAQgUC2IAKAzI9gCSHlWEMLmgBPJxMvyARpIICALDm4nkAbwIA71EZx5UOgO48JnLoOhQIAN9sOgKoBoAE5r0aB8ARcNhtFzrg0VQmwCp8CAMeAADGc44S5GMBsF1aCEU2LcAcAPDCvwFytBDehCaUgJxRAKeF8BNUUQJ43iiAUlqwFKoBrTCAHjiagwEgU0YM5IYWYD4KoIgPwIXQwUbVgCXzgLpIBJNeDciWTQNskVsq1ADX/6kYBdCTjse5owbMiX+IpgGWOCPSuWpA2vN/TAMm5QTYg5IC4FdbMA0YF5Nb5s2rAaLyhzBgektGZWDArrgqi0U1QHxf38OABDwUDgTAjGfyPlTVgJT/67FBACbqyGYaaoBctQwD2vI4DecVAPkgZRhQlxPQks2rAePGAbZsRlaa1QBYEQBUHRCAmaXD0QDYxgFWdye05R9cDQCrmQYkeBA6gGXTgNEeQF4DMG4S4MLjOUZRA5A0CcjADgmjqgGwSwSg9wK1GIBS74KTgTxv/EHoiaVQsTOS5RoCJuiZyosB8EIrHpyowFiYofO0i4wCjhCQwL0hq2sCaFNM22S4JXloLk0AuLDTBzCBAAt3xykeA7CHe/mDbgdTvQ9GswSAwdbqA0giYASHjQUJnhQKhQ6z/d8rDA4hAG2Dsk042ejubHMM2nV6AMf93pCkaRjhh0WsWuz+6aasl2FwiAImReEts1/CSaFfwFouAJxC4RW+I4oCThBQE1X2WbKkBFDkqYDtJ0SHaYKq3pJJwCECjjiFPoC1w+2P0gumurgeBjT6AhIIGKOelGIAngWlFnRnMZjMIYBb7gtIIsAuYU+8GICpEhYyZVgIZ2g9rYYAX1lfAKvjnxzjnWrHALDn9K1h2k2aoI1ewGd2AWAVAVMHcKdW4wDYje739pNufJXhkJohgLu9zy4CHCKAJYUge4ddCojGyPrp9kaHmYjUi9N7+2wYwxjGZfEXMKxGE0GkkfIAAAAASUVORK5CYII='
        this.startingScreen.loadingLabel.texture = new THREE.Texture(this.startingScreen.loadingLabel.image)
        this.startingScreen.loadingLabel.texture.magFilter = THREE.NearestFilter
        this.startingScreen.loadingLabel.texture.minFilter = THREE.LinearFilter
        this.startingScreen.loadingLabel.texture.needsUpdate = true
        this.startingScreen.loadingLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.startingScreen.loadingLabel.texture })
        this.startingScreen.loadingLabel.mesh = new THREE.Mesh(this.startingScreen.loadingLabel.geometry, this.startingScreen.loadingLabel.material)
        this.startingScreen.loadingLabel.mesh.matrixAutoUpdate = false
        this.container.add(this.startingScreen.loadingLabel.mesh)

        // Start label
        this.startingScreen.startLabel = {}
        this.startingScreen.startLabel.geometry = new THREE.PlaneBufferGeometry(4.5, 5.75 / 6)
        this.startingScreen.startLabel.image = new Image()
        this.startingScreen.startLabel.image.src = 'data:image/png;base64,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'
        // Start 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///+cnJxra2vR0dHd3d0mJib09PRYWFjp6em4uLhCQkKqqqqNjY19fX3FxcV3XeRgAAADsklEQVRo3u3YsU9TQRwH8KNgLSDQg9ZCAak1IdE4PKPu1NTEsSzOMDl3I3GpcXAxBhLjXFxNjJgQJ2ON0Rnj4uAAEyv8B/L7tV++5/VN+CM69Ldwfa+534d7d793VzeIQQzi/49c4v5lPF/1vvhFm++rjIpcyErrmrSCuz+cxng1iL/If8drPJD2Lc/Iy4VhaZWlFd4tLPfuMc6e/5LvRilJA2SkVSQA8c0OsI0uNtIAU9rsB8y1rAAZjyimAUa1mQDAeGwF+MA+9lIA69qs9AMKVoDP8vhf35A+NiMAc7YJKFSrX7tcI8BW9+k/O/kz6zSunjSnncMHiQYBcmdXrh3xCVbc2WO8N/YZZI0AxxwMArKivmwAwFKSPmV0UwBbCpj5E+C+yzUbQAaJVwUSA9SFjwFgHQ0jAMrBWgzAPCtHgFFbQAlpEwKC2zWUQgJGbAH+naSdu/fTxQAthPL5/ADD6OCpQwCAsb6LsbEGcBluOAYBmG2fkMIawHVWXEsDIGUGpZCAIRsAS93DPgDbhUmUQgKe2NUB90hfhK0YwEJYHkYpJGDbqBKiB86CGLAlzd6/S8CEvh8sACiBvrSXCshKblWEgNy2vkAMAHwGfjECcJHOu5qUQgDm6vXulshZAXJNL9GJAeg+LxeKPQBj1gzgdlnuCWAhbOi7LwaU9u0A2VWPpUgAC+GR5k0iwBtnB3Bj3qMaRYB17X0IOQhYcjYA7guxxyIAGfd1HNqchPfly7aACQUshAA2W1r5G1yG415YpgB3qIIkAHBH2D075QnQ10fHDsCl+CoGSKpiN8kMAVqIN00BsitnVgKyPIBMB4ADKU92AA5BKQIgszjKBGBLagpwB5xZBGS6pbcuizQAXMA6NAK86OCQ3okAI55BQPe7VoDxXzU/iwPASgS4GAASAiYxWgYAzvAa1loA2AkAFQIU2zEELCJtDDgIAG0CFLvp7LblC2kAtF6eTEJJ2CBAr88bAXKY4WkASbzXmwt5AvTvohHA4WSUBmj2Jt+IThQChrAOLQC13vPFMAOAQwuyTAeAKVQto3OBDOdESh2YxNZPbpYBQNbEAoBfod7e1i1BiwB0voSZWgwAOWgtAGPhD18E8ASIiRIAXNPwXJBtcqMbAFAIr5weIJMAcIx1aAAIqk0lAuycompyFwBMHAsAZlj/lgw0rsy2AkhbsgK4Q+70CUBjxeFXsUb0G1HJDJC9rketZRcCWCJwHM8DgJm7b7ch+XizXm25QQxiEOcXvwGCWOhbCZC0qAAAAABJRU5ErkJggg=='
        // Make startLabel.image slightly larger
        this.startingScreen.startLabel.texture = new THREE.Texture(this.startingScreen.startLabel.image)
        this.startingScreen.startLabel.texture.magFilter = THREE.NearestFilter
        this.startingScreen.startLabel.texture.minFilter = THREE.LinearFilter
        this.startingScreen.startLabel.texture.needsUpdate = true
        this.startingScreen.startLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.startingScreen.startLabel.texture })
        this.startingScreen.startLabel.material.opacity = 0
        this.startingScreen.startLabel.mesh = new THREE.Mesh(this.startingScreen.startLabel.geometry, this.startingScreen.startLabel.material)
        this.startingScreen.startLabel.mesh.matrixAutoUpdate = false
        this.container.add(this.startingScreen.startLabel.mesh)

        // Progress
        this.resources.on('progress', (_progress) =>
        {
            // Update area
            this.startingScreen.area.floorBorder.material.uniforms.uAlpha.value = 1
            this.startingScreen.area.floorBorder.material.uniforms.uLoadProgress.value = _progress
        })

        // Ready
        this.resources.on('ready', () =>
        {
            window.requestAnimationFrame(() =>
            {
                this.startingScreen.area.activate()

                TweenLite.to(this.startingScreen.area.floorBorder.material.uniforms.uAlpha, 0.3, { value: 0.3 })
                TweenLite.to(this.startingScreen.loadingLabel.material, 0.3, { opacity: 0 })
                TweenLite.to(this.startingScreen.startLabel.material, 0.3, { opacity: 1, delay: 0.3 })
            })
        })

        // On interact, reveal
        this.startingScreen.area.on('interact', () =>
        {
            this.startingScreen.area.deactivate()
            TweenLite.to(this.startingScreen.area.floorBorder.material.uniforms.uProgress, 0.3, { value: 0, delay: 0.4 })

            TweenLite.to(this.startingScreen.startLabel.material, 0.3, { opacity: 0, delay: 0.4 })

            this.start()

            window.setTimeout(() =>
            {
                this.reveal.go()
            }, 600)
        })
    }

    setButtons()
    {
        this.button = new Button({
            renderer: this.renderer,
            camera: this.camera,
            resources: this.resources,
            time: this.time,
            debug: this.debugFolder
        })
        this.container.add(this.button.container)
    }

    setSounds()
    {
        this.sounds = new Sounds({
            debug: this.debugFolder,
            time: this.time
        })
    }

    setAxes()
    {
        this.axis = new THREE.AxesHelper()
        this.container.add(this.axis)
    }

    setControls()
    {
        this.controls = new Controls({
            config: this.config,
            sizes: this.sizes,
            time: this.time,
            camera: this.camera,
            sounds: this.sounds
        })
    }

    setMaterials()
    {
        this.materials = new Materials({
            resources: this.resources,
            debug: this.debugFolder
        })
    }

    setShadows()
    {
        this.shadows = new Shadows({
            time: this.time,
            debug: this.debugFolder,
            renderer: this.renderer,
            camera: this.camera
        })
        this.container.add(this.shadows.container)
    }

    setPhysics()
    {
        this.physics = new Physics({
            config: this.config,
            debug: this.debug,
            time: this.time,
            sizes: this.sizes,
            controls: this.controls,
            sounds: this.sounds
        })

        this.container.add(this.physics.models.container)
    }

    setZones()
    {
        this.zones = new Zones({
            time: this.time,
            physics: this.physics,
            debug: this.debugFolder
        })
        this.container.add(this.zones.container)
    }

    setAreas()
    {
        this.areas = new Areas({
            config: this.config,
            resources: this.resources,
            debug: this.debug,
            renderer: this.renderer,
            camera: this.camera,
            car: this.car,
            sounds: this.sounds,
            time: this.time
        })

        this.container.add(this.areas.container)
    }

    setTiles()
    {
        this.tiles = new Tiles({
            resources: this.resources,
            objects: this.objects,
            debug: this.debug
        })
    }

    setWalls()
    {
        this.walls = new Walls({
            resources: this.resources,
            objects: this.objects
        })
    }

    setObjects()
    {
        this.objects = new Objects({
            time: this.time,
            resources: this.resources,
            materials: this.materials,
            physics: this.physics,
            shadows: this.shadows,
            sounds: this.sounds,
            debug: this.debugFolder
        })
        this.container.add(this.objects.container)

        // window.requestAnimationFrame(() =>
        // {
        //     this.objects.merge.update()
        // })
    }

    setCar()
    {
        this.car = new Car({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            shadows: this.shadows,
            materials: this.materials,
            controls: this.controls,
            sounds: this.sounds,
            renderer: this.renderer,
            camera: this.camera,
            debug: this.debugFolder,
            config: this.config
        })
        this.container.add(this.car.container)
    }

    setSections()
    {
        this.sections = {}

        // Generic options
        const options = {
            config: this.config,
            time: this.time,
            resources: this.resources,
            camera: this.camera,
            passes: this.passes,
            objects: this.objects,
            areas: this.areas,
            zones: this.zones,
            walls: this.walls,
            tiles: this.tiles,
            debug: this.debugFolder
        }
        //setButtons() {
        // this.sections.startButton = new Button( {
        //     ...options,
        //     position: new THREE.Vector3(1, 3, 3),
        //     renderer: this.renderer,
        //     camera: this.camera,
        //     // ...other options...
        // });
        // this.container.add(this.sections.startButton.container);


        // // Distinction A
        // this.sections.distinctionA = new DistinctionASection({
        //     ...options,
        //     x: 0,
        //     y: - 15
        // })
        // this.container.add(this.sections.distinctionA.container)

        // // Distinction B
        // this.sections.distinctionB = new DistinctionBSection({
        //     ...options,
        //     x: 0,
        //     y: - 15
        // })
        // this.container.add(this.sections.distinctionB.container)

        // // Distinction C
        // this.sections.distinctionC = new DistinctionCSection({
        //     ...options,
        //     x: 0,
        //     y: 0
        // })
        // this.container.add(this.sections.distinctionC.container)

        // // Distinction D
        // this.sections.distinctionD = new DistinctionDSection({
        //     ...options,
        //     x: 0,
        //     y: 0
        // })
        // this.container.add(this.sections.distinctionD.container)

        // Intro
        // this.sections.intro = new IntroSection({
        //     ...options,
        //     x: 30,
        //     y: - 30,
        //     renderer: this.renderer,
        //     camera: this.camera,
        // })
        // this.container.add(this.sections.intro.container)

        // Crossroads
        // this.sections.crossroads = new CrossroadsSection({
        //     ...options,
        //     x: 0,
        //     y: - 30
        // })
        // this.container.add(this.sections.crossroads.container)

        // Projects
        /*
        this.sections.projects = new ProjectsSection({
            ...options,
            x: 10,
            y: 0
            // x: 0,
            // y: 0
        })
        this.container.add(this.sections.projects.container)
            */
        // Information
        /*this.sections.information = new InformationSection({
            ...options,
            x: 1.2,
            y: - 55
            // x: 0,
            // y: - 10
        })
        this.container.add(this.sections.information.container)


        //Playground
        this.sections.pedestal = new PlaygroundSection({
            ...options,
            x: - 38,
            y: - 34
            // x: - 15,
            // y: - 4
        })
        //this.container.add(this.sections.playground.container)
        */

        // Pedestal
        this.sections.start = new StartSection({
            ...options,
            x: 10,
            y: 2
        })
        this.container.add(this.sections.start.container)
        //Board
        this.sections.board = new Board({
            ...options,
            renderer: this.renderer,
            camera: this.camera,
            position: new THREE.Vector3(-11, 4, 0),
            x: - 7,
            y: 8
            // x: - 15,
            // y: - 4
        })
        this.container.add(this.sections.board.container)
        /*
        //Playground
        this.sections.playground = new PlaygroundSection({
            ...options,
            x: - 38,
            y: - 34
            // x: - 15,
            // y: - 4
        })
        this.container.add(this.sections.playground.container)
        */
    }
/*
    setEasterEggs()
    {
        this.easterEggs = new EasterEggs({
            resources: this.resources,
            car: this.car,
            walls: this.walls,
            objects: this.objects,
            materials: this.materials,
            areas: this.areas,
            config: this.config,
            physics: this.physics
        })
        this.container.add(this.easterEggs.container)
    }
    */
}
