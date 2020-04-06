import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import bgFrag from './shaders/bg.fs';

export default class Background extends THREE.Object3D {

	private bg: ORE.Background;
	private uni: any;

	constructor() {

		super();

		this.uni = {
			time: {
				value: 0
			},
			tex: {
				value: null
			}
		};

		this.bg = new ORE.Background( { fragmentShader: bgFrag, uniforms: this.uni } );

		this.add( this.bg );

		let loader = new THREE.TextureLoader();

		loader.load( './assets/img/tex.jpg', ( tex ) => {

			this.uni.tex.value = tex;

		} );

	}

	public update( time: number ) {

		this.uni.time.value = time;

	}

}
