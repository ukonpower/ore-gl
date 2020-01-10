import * as GLP from '../../../../common/ts/glpower/src';

import vert from './shaders/floatingObj.vs';
import frag from './shaders/floatingObj.fs';

export class FloatingObj extends GLP.Empty{

	private gl: WebGLRenderingContext;
	private uni: GLP.Uniforms;
	
	constructor( gl: WebGLRenderingContext ){

		super();

		this.gl = gl;
		
		this.initMesh();
		
	}

	private initMesh(){

		let loader = new GLP.GLTFLoader();

		this.uni = {
			time: {
				value: 0
			},

		}

		let mat = new GLP.Material({
			vert: vert,
			frag: frag,
			uniforms: this.uni
		})
		
		loader.load( './assets/glpower.gltf', ( data ) => {

			let geo = new GLP.Geometry();
			let cube = new GLP.CubeGeometry( 0.5, 0.5, 0.5 );
			
			geo.add( 'normal', cube.attributes['normal'].vert, cube.attributes['normal'].stride );
			geo.add( 'position', cube.attributes['position'].vert, cube.attributes['position'].stride );
			geo.add( 'index',  cube.attributes['index'].vert, cube.attributes['index'].stride );
			
			let offsetPos = [];
			let n = [];
			
			for( let i = 0; i < 1000; i++ ){

				n.push( i );
				
				offsetPos.push(
					( Math.random() - 0.5 ) * 10.0,
					( Math.random() - 0.5 ) * 10.0,
					( Math.random() - 0.5 ) * 100.0 - 10.0,
				)
				
			}

			geo.add( 'offsetPos', offsetPos, 3, true );
			geo.add( 'num', n, 1, true );
			
			let obj = new GLP.RenderingObject({
				geo: geo,
				mat: mat,
				drawType: this.gl.TRIANGLES
			});
			obj.name = 'floating obj';
	
			this.add( obj );
			
		});
		
	}

	public update( time: number ){

		this.uni.time.value = time;
		
	}


	
}