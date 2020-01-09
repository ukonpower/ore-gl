import {BaseScene} from './utils/ore-three/';
import CubeBox from './utils/voxel-cube';
import PostProcessing from './utils/post-processing';
import * as THREE from 'three';

export default class MainScene extends BaseScene {
    constructor(renderer) {
        super(renderer);
        this.init();
    }

    init() {
        this.camera.position.set(0,2,8);
        this.camera.lookAt(0,0,0);

        this.scroll = new THREE.Vector2(0,0);

        this.light = new THREE.DirectionalLight();
        this.light.position.y = 10;
        this.light.position.z = 5;
        this.light.intensity = 2.5;
        this.scene.add(this.light);

        this.alight = new THREE.AmbientLight();
        this.alight.intensity = 1.5;
        this.alight.position.y = 10;
        this.scene.add(this.alight);

        this.pLight = new THREE.PointLight();
        this.pLight.position.set(0,0,-3);
        this.pLight.intensity = 0;
        this.scene.add(this.pLight);

        this.voxel = new CubeBox(3,25);
        this.scene.add(this.voxel.obj);

        this.pp = new PostProcessing(this.renderer,this.scene,this.camera);
        window.scene = this.scene;
    }

    animate() {
        this.scroll.x *= 0.96;
        this.scroll.y *= 0.96;

        let q = new THREE.Quaternion();  
        let axis = new THREE.Vector3(this.scroll.y, this.scroll.x, 0.0).normalize();
        q.setFromAxisAngle(axis, this.scroll.length());
        q.multiply(this.voxel.obj.quaternion);
        q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),0.005).multiply(q);  
        this.voxel.obj.quaternion.copy(q);
        this.voxel.update(this.deltaTime);
        this.pp.render();
        // this.renderer.render(this.scene,this.camera);
    }

    Resize(width,height){
        let aspect = width / height;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        if(aspect > 1.0){
            this.camera.position.z = 8;
        }else{
            this.camera.position.z = 13;
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