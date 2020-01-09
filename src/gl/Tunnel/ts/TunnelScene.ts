import * as ORE from 'ore-three-ts'
import * as THREE from 'three';
import { Tunnel } from './Tunnel';
import Background from './Background';
import { Heart } from './Heart';
import NoisePostProcessing from './NoisePostProcessing';
import { MeshBasicMaterial } from 'three';
import { MouseVertexRotator } from './MouseVertexRotator';

export class TunnelScene extends ORE.BaseScene{

	private renderer: THREE.WebGLRenderer;

	private tunnel: Tunnel;
	private heart: Heart;

	private bloom: ORE.BloomFilter;

	private rotator: MouseVertexRotator;
	private background: Background;
	private pp: NoisePostProcessing;

	private touchTime: number = 0;

	constructor(){

		super();

		this.name = "FireworksScene";
	
	}

	onBind( gPorps: ORE.GlobalProperties ){

		super.onBind( gPorps );

		this.renderer = this.gProps.renderer;
		
		this.camera.position.set( 0, 0 ,5 );
		this.camera.lookAt( 0.0, 0, 0 );

		this.tunnel = new Tunnel();
		this.tunnel.position.z
		this.scene.add( this.tunnel );

		this.heart = new Heart( this.renderer, 30 );
		this.scene.add( this.heart );
		this.rotator = new MouseVertexRotator( this.heart, this.heart.uniforms )

		let dlight = new THREE.PointLight();
		dlight.position.set( 0, 5, 0 );
		// this.scene.add( dlight );

		let aLight = new THREE.AmbientLight();
		aLight.intensity = 1.0;
		this.scene.add( aLight );

		let pLight = new THREE.PointLight();
		// this.scene.add( pLight );

		this.bloom = new ORE.BloomFilter( this.renderer, 0.2);
		this.bloom.threshold = 0.2;
		this.bloom.brightness = 0.7;
		this.bloom.blurRange = 10.0;
		this.bloom.renderCount = 10;

		this.pp = new NoisePostProcessing( this.renderer );

		this.background = new Background();
		this.scene.add( this.background );

	}

	animate( deltaTime: number ){

		this.background.update( this.time );

		this.tunnel.update( this.time );

		this.heart.update( deltaTime );

		this.rotator.update();

		this.pp.render( this.scene, this.camera );
		// this.bloom.render( this.scene, this.camera );
		// this.renderer.render( this.scene, this.camera );
		this.pp.update( this.time );
	}

	onResize( args: ORE.ResizeArgs ) {
	
		super.onResize( args );
		
		this.bloom.resize( args.windowPixelSize );
		this.pp.resize( args );

		if( args.aspectRatio > 1.0 ){
			// pc

			this.camera.position.z = 5;
			this.camera.lookAt( 0.0, 0, 0 );
			
			
		}else{
			
			// sumaho
			this.camera.position.z = 8;
			this.camera.lookAt( 0.0, 0, 0 );

		}
	
	}

    onTouchStart( cursor: ORE.Cursor, event: MouseEvent ) {

		this.touchTime = this.time;

	}

    onTouchMove( cursor: ORE.Cursor, event: MouseEvent ) {

		this.rotator.addVelocity( cursor.delta );

		event.preventDefault();

	}

	onTouchEnd( cursor: ORE.Cursor, event: MouseEvent ) {

	}
	
	onHover( cursor: ORE.Cursor ) {

	}

}