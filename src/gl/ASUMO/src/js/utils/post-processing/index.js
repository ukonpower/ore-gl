import EffectComposer, { RenderPass, ShaderPass } from 'three-effectcomposer-es6'
import ppFrag from './shaders/post-processing.fs';
import ppVert from './shaders/post-processing.vs';

export default class effect{
	constructor(renderer,scene,camera){
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

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

	render(){
		this.composer.render();
	}
}