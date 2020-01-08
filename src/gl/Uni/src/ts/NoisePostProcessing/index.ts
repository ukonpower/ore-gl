import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import ppFrag from './shaders/pp.fs';

export default class NoisePostProcessing extends THREE.Object3D{
	
	private pp: ORE.PostProcessing;
	private renderer: THREE.WebGLRenderer;
	private ppParam: any;


	constructor(renderer: THREE.WebGLRenderer){
		super();
		
		this.renderer = renderer;

		this.ppParam = [
			{
				fragmentShader: ppFrag,
				uniforms:{
					time: { 
						value: 0,
					},
					aspect:{
						value: window.innerWidth / window.innerHeight
					}
				}
			}
		]

		this.pp = new ORE.PostProcessing(this.renderer,this.ppParam)
	}

	addUniform(uni:any){
		this.ppParam[0].uniforms[uni.name] = {value: uni.value};
	}

	update(time){
		this.ppParam[0].uniforms.time.value = time;
	}

	render(scene:THREE.Scene,camera:THREE.Camera){
		this.pp.render(scene,camera);
	}

	addNoise(){
		this.ppParam[0].uniforms.nw.value = 1.0;
	}

	resize(width,height){
		this.ppParam[0].uniforms.aspect.value = width / height;
	}
}