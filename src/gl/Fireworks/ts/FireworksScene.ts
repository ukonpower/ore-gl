import * as ORE from 'ore-three-ts'
import * as THREE from 'three';
import { Fireworks } from './Fireworks';
import Background from './Background';
import { MouseVertexRotator } from 'ore-three-ts';

export class FireworksScene extends ORE.BaseScene{

	private renderer: THREE.WebGLRenderer;
	private fireworks: Fireworks;
	private bloom: ORE.BloomFilter;

	private rotator: ORE.MouseVertexRotator;
	private background: Background;

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

		this.fireworks = new Fireworks();
		this.scene.add( this.fireworks );

		this.rotator = new ORE.MouseVertexRotator( this.fireworks, this.fireworks.uniforms );

		let dlight = new THREE.DirectionalLight();
		dlight.position.set( 0, 5, 0 );
		this.scene.add( dlight );

		let aLight = new THREE.AmbientLight();
		this.scene.add( aLight );

		this.bloom = new ORE.BloomFilter( this.renderer, 0.1);
		this.bloom.threshold = 0.0;
		this.bloom.brightness = 0.7;
		this.bloom.blurRange = 10.0;
		this.bloom.renderCount = 10;

		this.background = new Background();
		this.scene.add( this.background );

	}

	animate( deltaTime: number ){

		this.fireworks.update( deltaTime );
		this.rotator.update();

		this.background.update( this.time );

		this.bloom.render( this.scene, this.camera );
	
	}

	onResize( args: ORE.ResizeArgs ) {
	
		super.onResize( args );

		this.bloom.resize( args.windowPixelSize );

		if( args.aspectRatio> 1.0 ){
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

		this.touchTime = this.time;

	}

    onTouchMove( cursor: ORE.Cursor, event: MouseEvent ) {

		this.rotator.addVelocity( cursor.delta );

		event.preventDefault();

	}

	onTouchEnd( cursor: ORE.Cursor, event: MouseEvent ) {

		if(  this.time - this.touchTime < 0.1){

			this.fireworks.changeColor(()=>{
				this.scene.remove( this.fireworks );
				this.fireworks.dispose();
				this.fireworks = new Fireworks();
				this.rotator = new MouseVertexRotator( this.fireworks, this.fireworks.uniforms );
				this.scene.add( this.fireworks );
			});

		}
	}
	
	onHover( cursor: ORE.Cursor ) {

	}

}