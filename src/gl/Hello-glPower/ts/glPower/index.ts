import * as GLP from '../../../../common/ts/glpower/src';

import frag from './shaders/glpower.fs';
import vert from './shaders/glpower.vs';

export class glPower extends GLP.Empty{

	private uniforms: GLP.Uniforms;
	
	private gl: WebGLRenderingContext;
	
	private glpower: GLP.RenderingObject;
	
	constructor( gl: WebGLRenderingContext ){

		super();
		
		this.gl = gl;
		
		let geo = new GLP.Geometry;

		let loader = new GLP.GLTFLoader();

		this.uniforms = {
			time: {
				value: 0
			}
		}
		
		let mat = new GLP.Material({
			frag: frag,
			vert: vert,
			uniforms: this.uniforms,
		});
		
		loader.load( './assets/glpower.gltf', ( data ) => {
			
			geo.add( 'position', data.glpower.position.array, data.glpower.position.size );
			geo.add( 'normal', data.glpower.normal.array, data.glpower.normal.size );
			geo.add( 'index', data.glpower.indices.array, data.glpower.indices.size );
			
			this.glpower = new GLP.RenderingObject({
				geo: geo,
				mat: mat,
			});
	
			this.add( this.glpower );
			
		});
		
	}

	public update( time: number ){

		this.uniforms.time.value = time;


	}
	
}