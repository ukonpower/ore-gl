import * as ORE from 'ore-three-ts'
import * as THREE from 'three';
import NoisePostProcessing from './NoisePostProcessing';
import { Nose } from './Nose';
import { Finger } from './Finger';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export class DandelionScene extends ORE.BaseScene{

	private renderer: THREE.WebGLRenderer;

	private nose: Nose;

	private finger: Finger;

	private noisePP: NoisePostProcessing;

	constructor(){

		super();

		this.name = "DandelionScene";
	
	}

	onBind( gPorps: ORE.GlobalProperties ){

		super.onBind( gPorps );

		this.renderer = this.gProps.renderer;
		
		this.camera.position.set( 0, 0 ,10 );

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

		// DRACOLoader.setDecoderPath( './assets/draco/' );

		let loader = new GLTFLoader();
		// loader.setDRACOLoader( new DRACOLoader() );

		// DRACOLoader.getDecoderModule();

		loader.load( './assets/model/nose.glb', ( gltf ) => {

			let scene = gltf.scene;

			this.createObjects( scene );

		});
		
	}

	private createObjects( scene: THREE.Scene ){

		this.nose = new Nose( this.renderer, scene );
		this.scene.add( this.nose );
		
		// this.finger = new Finger( scene );
		// this.scene.add( this.finger );

	}

	animate( deltaTime: number ){

		this.noisePP.update( this.time );

		if( this.nose ){

			this.nose.update( deltaTime );

		}

		if( this.finger ){

			// this.finger.position.y = Math.sin( this.time * 3.0 ) * 0.8;

			// this.nose.updateFingerPos( this.finger.position );

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

		if( cursor.position.x < window.innerWidth / 2 ){

			this.nose.splash( this.scene.getObjectByName('splash_right').position );

		}else{

			this.nose.splash( this.scene.getObjectByName('splash_left').position );

		}


	}

    onTouchMove( cursor: ORE.Cursor, event: MouseEvent ) {

		event.preventDefault();

	}

	onTouchEnd( cursor: ORE.Cursor, event: MouseEvent ) {
		
		this.nose.heal();
		
	}
	
	onHover( cursor: ORE.Cursor ) {

	}

}