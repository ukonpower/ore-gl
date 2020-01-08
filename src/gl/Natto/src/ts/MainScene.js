import BaseScene from './utils/BaseScene';
import Voxel from './utils/Voxel/Voxel';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

import EffectComposer,{RenderPass,ShaderPass,CopyShader} from 'three-effectcomposer-es6';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
        this.scene.background = new THREE.Color( 0x120000 );
        this.renderer.shadowMap.enabled = true;
    }

    init() {
        this.time = Math.random() * 100;
        this.clock = new THREE.Clock();
        this.camera.position.set(0,1,3);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0xffffff);
        this.light.position.set(0,0,0);
        this.light.intensity = 1.0;
        this.light.castShadow = true;
        this.scene.add(this.light);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0xffffff);
        this.light.position.set(0,0,-4);
        this.light.intensity = 1.0;
        this.light.castShadow = true;
        this.scene.add(this.light);

        var planeGeo = new THREE.PlaneGeometry(15,15,100);
        var planeMat = new THREE.MeshNormalMaterial({
            side: THREE.DoubleSide,
        });
        planeMat.visible = false;
        this.plane = new THREE.Mesh(planeGeo,planeMat);
        this.scene.add(this.plane);
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector3(0,0,0);

        this.voxel = new Voxel(this.renderer,1,1,1,15);
        this.scene.add(this.voxel.obj);

        let loader = new THREE.GLTFLoader();

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene,this.camera));

        var effect = {
            uniforms:{
                tDiffuse:{
                    value: null,
                    type:'t',
                },
                time: {
                    value: 0,
                    type: "f",
                }
            },
            vertexShader: ppVert,
            fragmentShader: ppFrag,
        }
        this.customPass = new ShaderPass(effect);
        this.customPass.renderToScreen = true;
        this.composer.addPass(this.customPass);

        window.scene = this.scene;
    }

    animate() {
        this.time += this.clock.getDelta();

        // let r = 15;
        // this.camera.position.set(Math.sin(this.time * 0.5) * r,2,Math.cos(this.time * 0.5) * r);
        this.camera.position.set(0,0,-15);
        this.camera.lookAt(0,0,0);

        this.voxel.update();

        // this.composer.render();
        this.renderer.render(this.scene,this.camera);
    }

    Resize(width,height){
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    movePointer(cursor){
        var halfWidth = innerWidth / 2;
        var halfHeight = innerHeight / 2;
        var pos = new THREE.Vector2((cursor.x - halfWidth) / halfWidth, (cursor.y - halfHeight) / halfHeight);
        
        pos.y *= -1;

        this.raycaster.setFromCamera(pos, this.camera); 
        var intersects = this.raycaster.intersectObjects([this.plane]);
        if(intersects.length > 0){
            var point = intersects[0].point;   
            this.pointer.copy(point);
        }
    }
    
    onTouchStart(c){
        this.movePointer(c);
        this.voxel.setPoint(this.pointer);
    }

    onTouchMove(c){
        this.movePointer(c);
        this.voxel.setPoint(this.pointer);
    }

    onTouchEnd(){
        this.pointer.set(0,0,0);
        this.voxel.setPoint(this.pointer);
    }

}