export default class BaseScene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
        this.camera.name = "mainCamera";
    }

    animate(){
    }

    onTouchStart(){
    }

    onTouchMove(){
    }

    onTouchEnd(){
    }
}