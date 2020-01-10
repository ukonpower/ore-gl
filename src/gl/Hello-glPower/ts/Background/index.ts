import * as GLP from '../../../../common/ts/glpower/src';

import frag from './shaders/background.fs';
import vert from './shaders/background.vs';

export class Background extends GLP.RenderingObject{

	private uniforms;

	constructor( gl: WebGLRenderingContext ){

		let uniforms = {
			time: {
				value: 0
			}
		}

		let mat = new GLP.Material({
			vert: vert,
			frag: frag,
			uniforms: uniforms,
		})										
		
		let geo = new GLP.PlaneGeometry( 2, 2 );
		
		super({
			geo: geo,
			mat: mat,
		});

		this.uniforms = uniforms;
		
	}

	public update( time: number ){

		this.uniforms.time.value = time;

	}
	
}