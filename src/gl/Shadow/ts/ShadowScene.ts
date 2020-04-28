import * as GLP from '@glpower';

import { Background } from './Background';

import cubeVert from './shaders/cube.vs';
import cubeFrag from './shaders/cube.fs';

export class ShadowScene extends GLP.BaseScene {

	private background: Background;
	private commonUniforms: GLP.Uniforms;

	constructor() {

		super();

		this.commonUniforms = {
			time: {
				value: 0
			}
		};

	}

	public onBind( gProps: GLP.GlobalProperties ) {

		super.onBind( gProps );

		this.initScene();

	}

	private initScene() {

		this.camera.position.set( 0, 0, 5 );

		let geo = new GLP.CubeGeometry();
		let mat = new GLP.Material( {
			vert: cubeVert,
			frag: cubeFrag,
			uniforms: this.commonUniforms
		} );

		let cube = new GLP.PowerObj( geo, mat );
		this.scene.add( cube );



		this.background = new Background( this.gl );
		this.background.resize( this.camera.aspect );
		this.scene.add( this.background );

	}

	public animate() {



		this.background.update( this.time );

		this.renderer.render( this.scene, this.camera );

	}

	public onResize( args: GLP.ResizeArgs ) {

		super.onResize( args );

		this.background.resize( this.camera.aspect );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	public onTouchStart( cursor: GLP.Cursor, event: MouseEvent ) { }

	public onTouchMove( cursor: GLP.Cursor, event: MouseEvent ) { }

	public onTouchEnd( cursor: GLP.Cursor, event: MouseEvent ) { }

	public onHover( cursor: GLP.Cursor ) { }

	public onWheel( event: WheelEvent ) { }


}
