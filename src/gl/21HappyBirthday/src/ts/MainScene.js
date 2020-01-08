import BaseScene from './utils/BaseScene';
import Background from './utils/Background';
import Floor from './utils/Floor/Floor';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

import EffectComposer,{RenderPass,ShaderPass,CopyShader} from 'three-effectcomposer-es6';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.Resize();
        this.animate();
        this.scene.background = new THREE.Color( 0x120000 );
        this.renderer.shadowMap.enabled = true;
    }

    init() {
        this.time = Math.random() * 100;
        this.clock = new THREE.Clock();

        this.light = new THREE.DirectionalLight();
        this.light.color = new THREE.Color(0xffffff);
        this.light.position.set(0,100,0);
        this.light.intensity = 0.1;
        this.light.castShadow = true;
        this.scene.add(this.light);

        this.alight = new THREE.AmbientLight();
        this.alight.color = new THREE.Color(0xffffff);
        this.alight.position.set(0,5,0);
        this.alight.intensity = 0.9;
        this.scene.add(this.alight);

        this.floor = new Floor();
        this.scene.add(this.floor.obj);

        this.back = new Background();
        this.scene.add(this.back.obj);

        let loader = new THREE.GLTFLoader();
        this.cake;

        loader.load('./models/happybirthday.glb', (gltf) => {
            this.cake = gltf.scene;
            this.cake.traverse((child) => {
                if (child.isMesh) {
                    child.receiveShadow = true;
                }
            });

            this.cake.position.y = 0.5;
            this.cake.scale.set(2.5,2.5,2.5);
            this.scene.add(this.cake);     
        });

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
        this.camera.position.set(Math.sin(this.time * 1.5) * this.r,10,Math.cos(this.time * 1.5) * this.r);
        this.camera.lookAt(0,2,0);

        this.floor.update();
        this.back.update(this.time);
        this.customPass.uniforms.time.value = this.time;

        if(this.cake){
            this.cake.position.y = Math.abs(Math.sin(this.time * 8.0));
        }
        this.composer.render();
        // this.renderer.render(this.scene,this.camera);
    }

    Resize(){
        let width = window.innerWidth;
        let height = window.innerHeight;
        let aspect = width / height;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();

        if(aspect > 1){
            this.r = 15;
        }else{
            this.r = 20;
        }
        if(this.back){
            this.back.setAspect(aspect);
        }
    }
    
    onTouchStart(){
    }

    onTouchMove(){
    }

    onTouchEnd(){

    }

}