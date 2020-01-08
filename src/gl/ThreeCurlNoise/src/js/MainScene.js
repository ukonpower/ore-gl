import BaseScene from './utils/BaseScene';
import Particle from './utils/Particles/Particles';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

import EffectComposer,{RenderPass,ShaderPass,CopyShader} from 'three-effectcomposer-es6';


export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
    }

    init() {
        this.time = 0;
        this.clock = new THREE.Clock();
        this.camera.position.set(0,3,10);
        this.camera.lookAt(0,0,0);
        
        this.particles = new Particle(this.renderer,new THREE.Color(0xffffff));
        this.scene.add(this.particles.obj);

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
    }

    animate() {
        this.time += this.clock.getDelta();
        this.particles.update();

        this.camera.position.z = Math.sin(this.time * 0.3) * 10;
        this.camera.position.x = Math.cos(this.time * 0.3) * 10;
        this.camera.lookAt(0,0,0);
        // this.renderer.render(this.scene,this.camera);

        // this.customPass.uniforms.time.value = this.time;
        this.composer.render();
        requestAnimationFrame(this.animate.bind(this));
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