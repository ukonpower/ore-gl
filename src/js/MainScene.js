import BaseScene from './utils/BaseScene';
import Background from './utils/Background';
import MainObj from './utils/MainObj';
import Fish from './utils/Fish';

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

        this.aLight = new THREE.AmbientLight();
        this.aLight.intensity = 0.5;
        this.scene.add(this.aLight);

        this.dLight = new THREE.DirectionalLight();
        this.dLight.intensity = 0.7;
        this.dLight.position.set(0.1,10,-10);
        this.scene.add(this.dLight);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0xff0044);
        this.light.position.set(20,0,5);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0x4400ff);
        this.light.position.set(-10,0,5);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.bg = new Background();
        this.scene.add(this.bg.obj);

        this.mobj = new MainObj();
        this.scene.add(this.mobj.obj);
        this.mobj.obj.position.set(3,0,0);

        this.fish = new Fish(this.renderer,2000,10);
        this.fish.setAvoidObje(this.mobj.obj.position,3);
        this.scene.add(this.fish.obj);

        window.scene = this.scene;
    }

    animate() {
        this.time += this.clock.getDelta();

        if(this.bg){
            this.bg.update(this.time);
        }

        if(this.mobj){
            this.mobj.update(this.time);
        }

        if(this.fish){
            this.fish.update();
        }
        // let r = 13;
        // this.camera.position.set(Math.sin(this.time * 0.5) * r,0,Math.cos(this.time * 0.5) * r);
        this.camera.position.set(0,0,10);
        this.camera.lookAt(0,0,0);
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