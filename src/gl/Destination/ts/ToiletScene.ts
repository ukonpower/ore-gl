import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { AssetManager } from './AssetManager';

import { Timeline } from './Timeline';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PostProcessing } from './PostProcessing';
import { SceneMixer } from './SceneMixer';
import { Scroller } from './Scroller';
import { ObjectManager } from './ObjectManager';


export class ToiletScene extends ORE.BaseScene {

	private assetManager: AssetManager;
	private timeline: Timeline
	private scroller: Scroller;

	private controls: OrbitControls;

	private commonUniforms: ORE.Uniforms;

	private mixer: SceneMixer;
	private postProcess: PostProcessing;

	private windowSize: THREE.Vector2;

	private objectManager: ObjectManager;

	constructor() {

		super();

		this.name = "ToiletScene";

		this.commonUniforms = {
			time: {
				value: 0
			}
		};

		this.assetManager = new AssetManager( {
			onMustAssetLoaded: () => {

				this.scene.add( this.assetManager.gltfScene );

				this.initScene();

				this.objectManager = new ObjectManager();

				window.dispatchEvent( new Event( 'resize' ) );

			}
		} );

	}

	onBind( gProps: ORE.GlobalProperties ) {

		super.onBind( gProps );

		this.renderer = this.gProps.renderer;

		this.windowSize = new THREE.Vector2( window.innerWidth, window.innerHeight );

		this.postProcess = new PostProcessing( this.renderer, this.commonUniforms );

		this.mixer = new SceneMixer( this.renderer, this.commonUniforms );

		this.scroller = new Scroller();

	}

	private initScene() {

		this.camera.near = 0.01;
		this.camera.position.set( 0, 1.0, 3 );
		this.camera.lookAt( 0, 0.4, 0 );

		this.renderer.shadowMap.enabled = true;

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
		light.position.set( 10, 20, 10 );
		light.castShadow = true;
		light.shadow.mapSize.set( 2048, 2048 );
		this.scene.add( light );

		light = new THREE.AmbientLight();
		light.intensity = 0.3;
		this.scene.add( light );

		light = new THREE.PointLight();
		light.intensity = 0.6;
		( light as THREE.PointLight ).distance = 2.0;
		( light as THREE.PointLight ).decay = 1.7;
		light.position.set( 0, 0.4, 0 );
		this.scene.add( light );

		this.timeline = new Timeline();

	}

	public animate( deltaTime: number ) {

		if ( ! this.assetManager.isLoaded ) return;

		this.commonUniforms.time.value = this.time;

		this.timeline.update( this.time * 0.25 % 1 );

		this.scroller.update( deltaTime );

		// this.camera.position.copy( this.timeline.get( 'camPos' ) );
		let t = ( this.scroller.posDelay * 1.0 + 5 ) * 0.25;

		this.updateScene( t % 1.6, Math.floor( t / 1.6 ) );
		this.mixer.renderScene( this.scene, this.camera, 0 );

		this.updateScene( ( t - 0.8 ) % 1.6, Math.floor( ( t - 0.8 ) / 1.6 ) * 30.0 );
		this.mixer.renderScene( this.scene, this.camera, 1 );

		let tex = this.mixer.composite( ( t - 0.2 ) % 1.6 / 0.8 > 1 );
		this.postProcess.render( tex );

	}

	private updateScene( time: number, seed: number = 0 ) {

		let t = time * Math.PI;
		// console.log( time , t );

		this.camera.position.set( 0.0, Math.sin( t ) * 1.0, 1.0 + Math.cos( t ) * 1.5 + 0.4 );
		this.camera.rotation.set( - time * Math.PI * ( 4 / 5 ) + Math.PI / 4, 0, t * Math.sin( seed * 3.464 ) * 1.0 );
		// this.camera.rotation.set( - ( ORE.Easings.easeInCubic( this.smoothstep( 0.1, 1.0, time ) ) * Math.PI ) * 0.7, 0, 0 );

		this.scene.getObjectByName( 'Toilet_Futa' ).rotation.set( - ( this.smoothstep( 0.2, 0.5, time ) * Math.PI ) * 0.5, 0, 0 );

	}

	private smoothstep( min: number, max: number, value: number ) {

		var x = Math.max( 0, Math.min( 1, ( value - min ) / ( max - min ) ) );
		return x * x * ( 3 - 2 * x );

	}

	public onTouchMove( cursor: ORE.Cursor, e: MouseEvent ) {

		e.preventDefault();

		this.scroller.addVelocity( - cursor.delta.y * 5.0 );

		this.checkScrolled();

	}

	public onHover( cursor: ORE.Cursor ) {


	}

	public onWheel( e: WheelEvent ) {

		this.scroller.addVelocity( e.deltaY );

		this.checkScrolled();

	}

	public checkScrolled() {

		if ( this.scroller.pos > 0.1 ) {

			document.body.setAttribute( 'data-scrolled', 'true' );

		} else {

			document.body.setAttribute( 'data-scrolled', 'false' );

		}

	}

	public onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

		if ( args.aspectRatio > 1.0 ) {

			this.camera.fov = 100;

		} else {

			this.camera.fov = 100;

		}

		if ( this.assetManager.isLoaded ) {

			this.windowSize.set( window.innerWidth, window.innerHeight );
			this.postProcess.resize();
			this.mixer.resize();

		}


	}

}
