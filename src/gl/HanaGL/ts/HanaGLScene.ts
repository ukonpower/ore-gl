import * as ORE from 'ore-three-ts'
import * as THREE from 'three';
import NoisePostProcessing from './NoisePostProcessing';
import { Nose } from './Nose';
import { Finger } from './Finger';
import { TouchScreen } from './TouchScreen';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export class HanaGLScene extends ORE.BaseScene{

	private renderer: THREE.WebGLRenderer;

	private nose: Nose;

	private finger: Finger;
	private touchScreen: TouchScreen;

	private noisePP: NoisePostProcessing;

	constructor(){

		super();

		this.name = "HanaGLScene";
	
	}

	onBind( gPorps: ORE.GlobalProperties ){

		super.onBind( gPorps );

		this.renderer = this.gProps.renderer;
		
		this.camera.position.set( 0, 0 ,10 );

		this.gProps.cursor.hoverMode = true;

		this.loadModels();
		
		let light = new THREE.DirectionalLight();
		light.position.set( 2.0, 10.0, 3.0 );
		light.intensity = 0.5;
		this.scene.add( light );

		let alight = new THREE.AmbientLight( 0xffffff );
		alight.intensity = 0.2;
		this.scene.add( alight );

		let plight = new THREE.PointLight();
		plight.position.set( 0.0, -3.0, 1.0 );
		this.scene.add( plight );

		this.noisePP = new NoisePostProcessing( this.renderer );
		

	}

	private loadModels(){

		let loader = new GLTFLoader();

		loader.load( './assets/model/nose.glb', ( gltf ) => {

			let scene = gltf.scene;

			this.createObjects( scene );

		});
		
	}

	private createObjects( scene: THREE.Scene ){

		this.nose = new Nose( this.renderer, scene );
		this.nose.position.y = 0.6;
		this.scene.add( this.nose );
		
		this.finger = new Finger( scene );
		this.nose.add( this.finger );

		this.touchScreen = new TouchScreen();
		this.scene.add( this.touchScreen );
		
	}

	animate( deltaTime: number ){

		this.noisePP.update( this.time );

		if( this.nose ){

			this.nose.update( deltaTime );

		}

		if( this.finger ){

			let isSplash = this.nose.updateFingerPos( this.finger.getWorldPosition( new THREE.Vector3() ) );

			this.camera.position.x = this.finger.position.x * 0.3;
			this.camera.position.y = this.finger.position.y * 0.3;
			this.camera.lookAt( this.finger.position.x * 0.00, this.finger.position.y * 0.00, 0 );

			this.finger.updatePos();
			
			this.noisePP.isGlitch( isSplash );
			
		}

		this.noisePP.render( this.scene, this.camera );
	
	}

	onResize( args: ORE.ResizeArgs ) {
	
		super.onResize( args );

		this.noisePP.resize( args );

		if( args.aspectRatio > 1.0 ){

			// pc
			this.camera.position.z = 5;
			this.camera.lookAt( 0.0, 0, 0 );
			
			
		}else{

			// sumaho
			this.camera.position.z = 6;
			this.camera.lookAt( 0.0, 0, 0 );


		}
	
	}

	onTouchStart( cursor: ORE.Cursor, event: MouseEvent ) {

		// if( cursor.position.x < window.innerWidth / 2 ){

		// 	this.nose.splash( this.scene.getObjectByName('splash_right').position );

		// }else{

		// 	this.nose.splash( this.scene.getObjectByName('splash_left').position );

		// }


	}

	onTouchMove( cursor: ORE.Cursor, event: MouseEvent ) {

		event.preventDefault();


	}

	onTouchEnd( cursor: ORE.Cursor, event: MouseEvent ) {
		
		this.nose.heal();
		
	}
	
	onHover( cursor: ORE.Cursor ) {
		
		if( this.finger ){
			
			let halfWidth = innerWidth / 2;
			let halfHeight = innerHeight / 2;
			let pos = new THREE.Vector2( ( cursor.hoverPosition.x - halfWidth ) / halfWidth, -( cursor.hoverPosition.y - halfHeight ) / halfHeight );

			let p = this.touchScreen.getTouchPos( this.camera, pos );
			
			if( p ){

				this.finger.updatePos( new THREE.Vector3( p.x, p.y, 0 ) );
				
			}

		}
		
	}

}