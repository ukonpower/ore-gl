import {BaseScene} from './utils/ore-three/';
import Sumo from './utils/sumo';
import PostProcessing from './utils/post-processing';

export default class MainScene extends BaseScene {
    constructor(renderer) {
        super(renderer);
        this.init();
    }

    init() {
        this.camera.position.set(0,1.5,8);
        this.camera.lookAt(0,0,0);

        this.scroll = new THREE.Vector2(0,0);
        this.light = new THREE.DirectionalLight();
        this.light.position.y = 10;
        this.light.position.z = 5;
        this.light.intensity = 0.5;
        this.scene.add(this.light);

        this.alight = new THREE.AmbientLight();
        this.alight.intensity = 0.2;
        this.alight.position.y = 10;
        this.scene.add(this.alight);

        // this.pLight = new THREE.PointLight(0xff00ff);
        // this.pLight.position.set(0,5,0);
        // this.pLight.intensity = 2.0;
        // this.scene.add(this.pLight);

        // this.pl2 = new THREE.PointLight(0x00ffff);
        // this.pl2.position.set(0,-5,0);
        // this.pl2.intensity = 2.0;
        // this.scene.add(this.pl2);

        this.othello = new Sumo();
        this.scene.add(this.othello.obj);

        this.pp = new PostProcessing(this.renderer,this.scene,this.camera);

        window.scene = this.scene;
    }

    animate() {
        this.scroll.x *= 0.96;
        this.scroll.y *= 0.96;

        let q = new THREE.Quaternion();  
        let axis = new THREE.Vector3( this.scroll.y, this.scroll.x, 0.0).normalize();
        q.setFromAxisAngle(axis, this.scroll.length());
        q.multiply(this.othello.obj.quaternion);
        q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),0.005).multiply(q);  
        this.othello.obj.quaternion.copy(q);
        this.othello.update(this.deltaTime);
        this.pp.render();
    }

    Resize(width,height){
        let aspect = width / height;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        if(aspect > 1.0){
            this.camera.position.z = 8;
        }else{
            this.camera.position.z = 12;
        }
        this.camera.lookAt(0,0,0);
    }
    
    addScroll(c){
        this.scroll.x += c.deltaX * 0.001;
        this.scroll.y += c.deltaY * 0.001;
    }

    onTouchStart(c){
        this.addScroll(c);
    }

    onTouchMove(c){
        this.addScroll(c);
    }

    onTouchEnd(c){
        this.addScroll(c);
    }

}