import * as THREE from 'three'

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

        this.setStatic()

    }

    setStatic()
    {

        this.objects.add({
            base: this.resources.items.startStaticBase.scene,
            collision: this.resources.items.startStaticCollision.scene,
            floorShadowTexture: this.resources.items.startStaticFloorShadowTexture,
            material : this.resources.items.startStaticMaterial,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0,
            rotation: new THREE.Euler(Math.PI * 0.5, 0, 0),
        })
    }


}
