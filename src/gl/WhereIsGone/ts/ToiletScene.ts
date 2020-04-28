import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { AssetManager } from './AssetManager';

import { Timeline } from './Timeline';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ReflectionPlane } from './ReflectionPlane';
import { PostProcessing } from './PostProcessing';


export class ToiletScene extends ORE.BaseScene {

	private assetManager: AssetManager;
	private timeline: Timeline

	private controls: OrbitControls;

	private reflectPlane: ReflectionPlane;

	private commonUniforms: ORE.Uniforms;

	private postProcess: PostProcessing;

	private windowSize: THREE.Vector2;

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


				window.dispatchEvent( new Event( 'resize' ) );

			} } );

	}

	onBind( gProps: ORE.GlobalProperties ) {

		super.onBind( gProps );

		this.renderer = this.gProps.renderer;

		this.windowSize = new THREE.Vector2( window.innerWidth, window.innerHeight );

		this.postProcess = new PostProcessing( this.renderer, this.commonUniforms );

	}

	private initScene() {

		this.camera.position.set( 0, 1.0, 3 );
		this.camera.lookAt( 0, 0.4, 0 );

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

		light = new THREE.AmbientLight();
		light.intensity = 0.1;
		this.scene.add( light );

		light = new THREE.PointLight();
		light.intensity = 0.7;
		( light as THREE.PointLight ).distance = 2.0;
		( light as THREE.PointLight ).decay = 1.7;
		light.position.set( 0, 0.5, 0 );
		this.scene.add( light );

		this.reflectPlane = new ReflectionPlane( this.renderer, new THREE.Vector2( 100, 100 ), 0.4, this.commonUniforms );
		this.reflectPlane.position.set( 0, 0, 0 );
		this.reflectPlane.rotateX( - Math.PI / 2 );
		// this.scene.add( this.reflectPlane );

		this.timeline = new Timeline();

	}

	public animate( deltaTime: number ) {

		if ( ! this.assetManager.isLoaded ) return;

		this.commonUniforms.time.value = this.time;

		this.timeline.update( this.time * 0.25 % 1 );

		// this.camera.position.copy( this.timeline.get( 'camPos' ) );
		this.setCameraTransform( this.time * 0.25 % 1 );
		this.postProcess.render( this.scene, this.camera );

	}

	private setCameraTransform( time: number ) {

		let t = time * Math.PI;
		this.camera.position.set( 0.0, Math.sin( t ) * 1.0, 1.0 + Math.cos( t ) - 0.1 );
		this.camera.rotation.set( - ( ORE.Easings.easeInCubic( this.smoothstep( 0.1, 1.0, time ) ) * Math.PI ) * 0.7, 0, 0 );

		this.scene.getObjectByName( 'Toilet_Futa' ).rotation.set( - ( this.smoothstep( 0.2, 0.5, time ) * Math.PI ) * 0.5, 0, 0 );

	}

	private smoothstep( min: number, max: number, value: number ) {

		var x = Math.max( 0, Math.min( 1, ( value - min ) / ( max - min ) ) );
		return x * x * ( 3 - 2 * x );

	}

	public onTouchMove( cursor: ORE.Cursor ) {


	}

	public onHover( cursor: ORE.Cursor ) {


	}

	public onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

		if ( args.aspectRatio > 1.0 ) {

			this.camera.fov = 80;

		} else {

			this.camera.fov = 60;

		}

		if ( this.assetManager.isLoaded ) {

			this.windowSize.set( window.innerWidth, window.innerHeight );
			this.postProcess.resize();
			this.reflectPlane.resize( args.windowPixelSize );

		}


	}

}
