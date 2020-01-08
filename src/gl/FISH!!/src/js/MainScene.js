import BaseScene from './utils/BaseScene';
import Fish from './utils/Fish/Fish';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
        this.scene.background = new THREE.Color( 0x120012 );
    }

    init() {
        this.time = Math.random() * 100;
        this.clock = new THREE.Clock();
        this.camera.position.set(0,1,3);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0xff0044);
        this.light.position.set(20,0,16);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0x4400ff);
        this.light.position.set(-20,0,16);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0xffffff);
        this.light.position.set(0,0,0);
        this.light.intensity = 1.0;
        this.scene.add(this.light);

        this.fish = new Fish(this.renderer,3000,10);
        this.scene.add(this.fish.obj);

        window.scene = this.scene;
    }

    animate() {
        this.time += this.clock.getDelta();

        let r = 13;
        this.camera.position.set(Math.sin(this.time * 0.5) * r,0,Math.cos(this.time * 0.5) * r);
        this.camera.lookAt(0,0,0);
        this.fish.update();

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