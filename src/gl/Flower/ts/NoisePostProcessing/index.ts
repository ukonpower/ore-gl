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
					nw: { 
						value: 0,
					}
				}
			}
		]

		this.pp = new ORE.PostProcessing(this.renderer,this.ppParam)
	}

	update(time){
		this.ppParam[0].uniforms.time.value = time;
		this.ppParam[0].uniforms.nw.value *= 0.8;
	}

	render(scene:THREE.Scene,camera:THREE.Camera){
		this.pp.render(scene,camera);
	}

	addNoise(){
		this.ppParam[0].uniforms.nw.value = 1.0;
	}
}