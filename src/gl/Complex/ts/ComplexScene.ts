import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SmoothCameraMover } from './SmoothCameraMover';
import { ReflectionPlane } from './ReflectionPlane';
import { Emotion } from './Emotion';
import { ComplexPostProcessing } from './ComplexPostProcessing';

export class ComplexScene extends ORE.BaseScene {

	private controls: OrbitControls;
	private cameraMover: SmoothCameraMover;

	private reflectPlane: ReflectionPlane;
	private emotion: Emotion;

	private commonUniforms: ORE.Uniforms;

	private postProcess: ComplexPostProcessing;

	private windowSize: THREE.Vector2;

	constructor() {

		super();

		this.name = "FooScene";

		this.commonUniforms = {
			time: {
				value: 0
			}
		};

	}

	onBind( gProps: ORE.GlobalProperties ) {

		super.onBind( gProps );

		this.renderer = this.gProps.renderer;

		this.camera.position.set( 0, 1.8, 5 );
		this.camera.lookAt( 0, 1.0, 0 );
		this.cameraMover = new SmoothCameraMover( this.camera, Math.PI / 2, Math.PI / 12 );

		this.scene.background = new THREE.Color( 0.15, 0.15, 0.15 );

		let light: THREE.Light;
		light = new THREE.DirectionalLight();
		light.intensity = 0.005;
		light.position.set( - 0.1, 0.6, - 1.0 );
		this.scene.add( light );

		light = new THREE.DirectionalLight();
		light.intensity = 0.005;
		light.position.set( 0.8, 0.6, - 0.8 );
		this.scene.add( light );

		light = new THREE.DirectionalLight();
		light.intensity = 0.005;
		light.position.set( - 0.8, 0.6, - 0.8 );
		this.scene.add( light );

		light = new THREE.DirectionalLight();
		light.intensity = 1.0;
		light.position.set( 1, 1, 1 );
		this.scene.add( light );

		this.emotion = new Emotion( this.renderer, this.commonUniforms );
		this.emotion.position.set( 0, 1.5, 0 );
		this.scene.add( this.emotion );

		this.reflectPlane = new ReflectionPlane( this.renderer, new THREE.Vector2( 20, 30 ), 0.4, this.commonUniforms );
		this.reflectPlane.position.set( 0, 0, 0 );
		this.reflectPlane.rotateX( - Math.PI / 2 );
		this.scene.add( this.reflectPlane );

		this.windowSize = new THREE.Vector2( window.innerWidth, window.innerHeight );

		this.postProcess = new ComplexPostProcessing( this.renderer, this.commonUniforms );

		window.dispatchEvent( new Event( 'resize' ) );

	}

	public animate( deltaTime: number ) {

		this.commonUniforms.time.value = this.time;

		// this.controls.update();

		this.cameraMover.update( deltaTime );

		this.emotion.update( deltaTime );

		// this.renderer.render( this.scene, this.camera );
		this.postProcess.render( this.scene, this.camera );

	}

	public onTouchMove( cursor: ORE.Cursor ) {

		this.cameraMover.setCursor( cursor.getNormalizePosition( this.windowSize ) );

	}

	public onHover( cursor: ORE.Cursor ) {

		this.cameraMover.setCursor( cursor.getNormalizePosition( this.windowSize ) );

	}

	public onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

		if ( args.aspectRatio > 1.0 ) {

			this.camera.fov = 45;

		} else {

			this.camera.fov = 60;

		}

		this.windowSize.set( window.innerWidth, window.innerHeight );
		this.postProcess.resize();
		this.reflectPlane.resize( args.windowPixelSize );

	}

}
