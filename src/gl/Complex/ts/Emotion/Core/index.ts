import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { SphereMaterial } from './SphereMaterial';

export class Core extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		super();

		this.commonUniforms = uni;

		this.init();

	}

	protected init() {

		let sphereGeo = new THREE.SphereBufferGeometry( 0.5, 30, 30 );
		let sphereMat = new SphereMaterial({
			uniforms: this.commonUniforms
		});

		let sphere = new THREE.Mesh( sphereGeo, sphereMat );
		this.add( sphere );

	}

}
