import BaseScene from './utils/BaseScene';
import BoxTrails from './utils/BoxTrails/BoxTrails';
import Floor from './utils/Floor/Floor';

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

        this.light = new THREE.DirectionalLight();
        this.light.color = new THREE.Color(0xffffff);
        this.light.position.set(0,100,0);
        this.light.intensity = 1.0;
        this.light.castShadow = true;
        this.scene.add(this.light);

        this.alight = new THREE.AmbientLight();
        this.alight.color = new THREE.Color(0xffffff);
        this.alight.position.set(0,5,0);
        this.alight.intensity = 0.9;
        this.scene.add(this.alight);

        this.bTrails = new BoxTrails(this.renderer,1000,15,0.5);
        this.scene.add(this.bTrails.obj);

        this.floor = new Floor();
        this.scene.add(this.floor.obj);

        let loader = new THREE.GLTFLoader();

        loader.load('./assets/models/ramen.glb', (gltf) => {
            var object = gltf.scene;
            object.traverse((child) => {
                if (child.isMesh) {
                    child.receiveShadow = true;
                }
            });

            object.position.y = 0.5;
            object.scale.set(2,2,2);
            this.scene.add(object);     
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

        let r = 15;
        this.camera.position.set(Math.sin(this.time * 0.5) * r,7,Math.cos(this.time * 0.5) * r);
        this.camera.lookAt(0,5,0);

        this.floor.update();
        this.bTrails.update();

        this.composer.render();
        // this.renderer.render(this.scene,this.camera);
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