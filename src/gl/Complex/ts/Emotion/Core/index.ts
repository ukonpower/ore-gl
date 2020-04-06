import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

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

	}

}
