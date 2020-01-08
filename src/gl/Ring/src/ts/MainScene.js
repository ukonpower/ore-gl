import {BaseScene} from './utils/ore-three/';
import Ring from './utils/ring';
import Background from './utils/Background';
import PostProcessing from './utils/post-processing';
import Cube from './utils/voxel-cube';

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
        this.light.intensity = 0.7;
        this.scene.add(this.light);

        this.alight = new THREE.AmbientLight();
        this.alight.intensity = 0.8;
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

        this.ring = new Ring();
        this.scene.add(this.ring.obj);

        this.cube = new Cube(1.2,10);
        this.scene.add(this.cube.obj);

        this.background = new Background();
        this.scene.add(this.background.obj);

        // this.pp = new PostProcessing(this.renderer,this.scene,this.camera);

        window.scene = this.scene;
    }

    animate() {
        this.scroll.x *= 0.96;
        this.scroll.y *= 0.96;

        let q = new THREE.Quaternion();  
        let axis = new THREE.Vector3( this.scroll.y, this.scroll.x, 0.0).normalize();

        q.setFromAxisAngle(axis, this.scroll.length());
        q.multiply(this.ring.obj.quaternion);
        q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),0.005).multiply(q);  

        this.ring.obj.quaternion.copy(q);
        this.ring.update(this.deltaTime);

        this.background.update(this.time);

        this.cube.obj.quaternion.copy(q);
        this.cube.update(this.deltaTime);

        // this.pp.render();
        this.renderer.render(this.scene,this.camera);
    }

    Resize(width,height){
        let aspect = width / height;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        if(aspect > 1.0){
            this.camera.position.z = 10;
        }else{
            this.camera.position.z = 15;
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