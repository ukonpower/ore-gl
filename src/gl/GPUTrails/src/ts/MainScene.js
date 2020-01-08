import BaseScene from './utils/BaseScene';
import Trails from './utils/Trails/Trails';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
    }

    init() {
        this.time = Math.random() * 100;
        this.clock = new THREE.Clock();
        this.camera.position.set(0,1,3);

        this.trails = new Trails(this.renderer,2000,30);
        this.scene.add(this.trails.obj);
    }

    animate() {
        this.time += this.clock.getDelta();

        let r = 13;
        this.camera.position.set(Math.sin(this.time * 0.5) * r,0,Math.cos(this.time * 0.5) * r);
        this.camera.lookAt(0,0,0);
        this.trails.update();

        this.renderer.render(this.scene,this.camera);
    }

    Resize(width,height){
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    
    onTouchStart(){
    }

    onTouchMove(){
    }

    onTouchEnd(){

    }

}