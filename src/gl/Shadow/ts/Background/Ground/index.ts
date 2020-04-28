import * as GLP from '@glpower';

import frag from './shaders/ground.fs';
import vert from './shaders/ground.vs';

export class Ground extends GLP.PowerObj {

	private uniforms;

	constructor( gl: WebGLRenderingContext ) {

		let uniforms = {
			time: {
				value: 0
			},
			aspect: {
				value: 1
			}
		};

		let mat = new GLP.Material( {
			vert: vert,
			frag: frag,
			uniforms: uniforms,
		} );

		let geo = new GLP.PlaneGeometry( 2, 2 );

		super( geo, mat );

		this.uniforms = uniforms;

	}

	public update( time: number ) {

		this.uniforms.time.value = time;

	}

	public resize( aspect: number ) {

		this.uniforms.aspect.value = aspect;

	}

}
