import * as ORE from 'ore-three-ts'
import * as THREE from 'three';
import { Dandelion } from './Dandelion';
import Floor from './Floor';
import MicData from './MicData';
import Background from './Background';
import NoisePostProcessing from './NoisePostProcessing';

export class DandelionScene extends ORE.BaseScene{

	private renderer: THREE.WebGLRenderer;

	private dandeilon: Dandelion;

	private micData: MicData;

	private breatFinger = 0.0;

	private background: Background;

	private noisePP: NoisePostProcessing;

	constructor(){

		super();

		this.name = "DandelionScene";
	
	}

	onBind( gPorps: ORE.GlobalProperties ){

		super.onBind( gPorps );

		this.renderer = this.gProps.renderer;

		this.micData = new MicData( window.navigator, 256 );
		
		this.camera.position.set( 2, 4 ,5 );
		this.camera.lookAt( 0.0, 1.5, 0 );
		
        let light = new THREE.DirectionalLight();
		light.position.z = 1;
		light.position.y = 3;
		light.intensity = 0.5;
		this.scene.add( light );

		let alight = new THREE.AmbientLight();
		alight.intensity = 1.0;
		this.scene.add( alight );

		this.dandeilon = new Dandelion( this.renderer );
		this.scene.add( this.dandeilon );

		let floorGeo = new THREE.CylinderGeometry( 1, 1, 0.25 );
		let mat = new THREE.MeshStandardMaterial({
			color: new THREE.Color( 0x252525 )
		});
		let floor = new THREE.Mesh( floorGeo, mat );
		floor.position.y = -0.125;
		this.scene.add( floor );

		this.background = new Background();
		this.scene.add( this.background );

		this.noisePP = new NoisePostProcessing( this.renderer );

	}

	animate( deltaTime: number ){

		this.breatFinger *= 0.97;

		this.dandeilon.update( deltaTime );		

		this.dandeilon.addBreath( this.micData.volume * 0.001 + this.breatFinger);

		this.noisePP.update( this.time );
		this.noisePP.render( this.scene, this.camera );
	
	}

	onResize( args: ORE.ResizeArgs ) {
	
		super.onResize( args );

		this.noisePP.resize( args );		

		if( args.aspectRatio> 1.0 ){
			// pc

			this.camera.position.z = 5;
			this.camera.lookAt( 0.0, 1.5, 0 );
			
			
		}else{
			// sumaho
			this.camera.position.z = 6;
			this.camera.lookAt( 0.0, 1.5, 0 );


		}
	
	}

    onTouchStart( cursor: ORE.Cursor, event: MouseEvent ) {

	}

    onTouchMove( cursor: ORE.Cursor, event: MouseEvent ) {

		this.breatFinger += cursor.delta.y * -0.0001;

		event.preventDefault();

	}

	onTouchEnd( cursor: ORE.Cursor, event: MouseEvent ) {

	}
	
	onHover( cursor: ORE.Cursor ) {

	}

}