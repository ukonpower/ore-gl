import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import ppFrag from './shaders/pp.fs';

export default class NoisePostProcessing extends THREE.Object3D {

	private pp: ORE.PostProcessing;
	private renderer: THREE.WebGLRenderer;
	private ppParam: any;


	constructor( renderer: THREE.WebGLRenderer ) {

		super();

		this.renderer = renderer;

		this.ppParam = [
			{
				fragmentShader: ppFrag,
				uniforms: {
					time: {
						value: 0,
					},
					splash: {
						value: 0
					},
					nw: {
						value: 0
					}
				}
			}
		];

		this.pp = new ORE.PostProcessing( this.renderer, this.ppParam );

	}

	update( time: number, splash: number ) {

		this.ppParam[ 0 ].uniforms.time.value = time;
		this.ppParam[ 0 ].uniforms.splash.value = splash;

	}

	isGlitch( isGlitch: boolean ) {

		this.ppParam[ 0 ].uniforms.nw.value = isGlitch ? 1 : 0;

	}

	render( scene:THREE.Scene, camera:THREE.Camera ) {

		this.pp.render( scene, camera );

	}

	resize( args: ORE.ResizeArgs ) {

		this.pp.resize( args.windowPixelSize );

	}

}
