import * as ORE from '@ore-three-ts';
import * as THREE from 'three';
import { Boxes } from './Boxes';
import NoisePostProcessing from './NoisePostProcessing';

export default class MainScene extends ORE.BaseScene {

	private light: THREE.Light;
	private alight: THREE.Light;

	private boxes: Boxes

	private pp: NoisePostProcessing

	constructor() {

		super();

		this.name = "MainScene";

	}

	onBind( gProps: ORE.GlobalProperties ) {

		super.onBind( gProps );

		this.renderer = gProps.renderer;

		this.light = new THREE.DirectionalLight();
		this.light.position.y = 10;
		this.light.position.z = 10;
		this.scene.add( this.light );

		this.alight = new THREE.AmbientLight();
		this.alight.intensity = 0.5;
		this.scene.add( this.alight );

		this.boxes = new Boxes();
		this.scene.add( this.boxes );

		this.pp = new NoisePostProcessing( this.renderer );
		this.pp.addUniform( {
			name: 'rotVec',
			value: this.boxes.mouseVertRotator.scrollVel
		} );

	}

	animate() {

		this.boxes.update( this.time );

		this.renderer.render( this.scene, this.camera );

	}

	onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

		if ( args.aspectRatio > 1.0 ) {

			this.camera.position.z = 7;

		} else {

			this.camera.position.z = 10;

		}

		this.camera.lookAt( 0, - 0.0, 0 );
		this.pp.resize( args.windowPixelSize.x, args.windowPixelSize.y );

	}

	onTouchStart( cursor: ORE.Cursor, event:MouseEvent ) {

	}

	onTouchMove( cursor: ORE.Cursor, event:MouseEvent ) {

		this.boxes.mouseVertRotator.addVelocity( new THREE.Vector2( cursor.delta.x, cursor.delta.y ) );

		event.preventDefault();

	}

}
