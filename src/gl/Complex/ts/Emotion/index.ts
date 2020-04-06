import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { Core } from './Core';
import { Barrier } from './Barrier';

export class Emotion extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;

	private commonUniforms: ORE.Uniforms;

	private core: Core;
	private barrier: Barrier;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms?: ORE.Uniforms ) {

		super();

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.init();

	}

	protected init() {

		this.core = new Core( this.commonUniforms );
		this.add( this.core );

		this.barrier = new Barrier( this.renderer, this.commonUniforms );
		this.add( this.barrier );

	}

	public update( deltaTime: number ) {

		this.barrier.update( deltaTime );

	}

}
