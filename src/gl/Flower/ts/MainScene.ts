import * as ORE from 'ore-three-ts'
import * as THREE from 'three';

import Flower from './Flower';
import NoisePostProcessig from './NoisePostProcessing';
import Background from './Background';

export default class MainScene extends ORE.BaseScene{

	private renderer: THREE.WebGLRenderer;

	private light: THREE.Light;
	private alight: THREE.Light;
	private flower: Flower;
	private flower2: Flower;
	private rotator: ORE.MouseRotator;

	private touchStart: number;

	private npp: NoisePostProcessig;
	private bg: Background;

	constructor(){

		super();
		
		this.name = "MainScene";
	
	}

	onBind( gProps: ORE.GlobalProperties ){
		
		super.onBind( gProps );

		this.renderer = gProps.renderer;
		
        this.light = new THREE.DirectionalLight();
        this.light.position.y = 10;
        this.light.position.z = 10;
		this.scene.add(this.light);

		this.alight = new THREE.AmbientLight();
		this.alight.intensity = 0.5;
		this.scene.add(this.alight);

		this.bg = new Background();
		this.scene.add(this.bg);

		this.flower = new Flower();
		this.scene.add(this.flower);

		this.flower2 = new Flower();
		this.flower2.rotateX(Math.PI);
		this.flower2.scale.set(0.7,0.7,0.7);

		this.flower.add(this.flower2);
		this.flower.rotateX(0.7);
		this.flower.rotateZ(-0.3);

		this.rotator = new ORE.MouseRotator(this.flower);

		this.npp = new NoisePostProcessig(this.renderer);
	}

	animate(){

		this.flower.update(this.time);
		this.flower2.update(this.time + Math.PI + 0.2);
		this.rotator.update();

		this.npp.update(this.time);
		this.npp.render(this.scene,this.camera);

		this.bg.update(this.time);
		
	}

	onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );
		
		if(args.aspectRatio > 1.0){
		
			this.camera.position.z = 3;
		
		}else{
		
			this.camera.position.z = 5;
		
		}
		
		this.camera.lookAt(0,-0.0,0);
	
	}

    onTouchStart( cursor: ORE.Cursor, event:MouseEvent) {
	
		this.touchStart = this.time;
	
	}

    onTouchMove( cursor: ORE.Cursor, event:MouseEvent) {

		this.rotator.addVelocity (new THREE.Vector2( cursor.delta.x, cursor.delta.y ) );
		event.preventDefault();
	
	}

    onTouchEnd( cursor: ORE.Cursor, event:MouseEvent ) { 

		if(this.time - this.touchStart < 0.1){

			let c = new THREE.Vector3( Math.random() ,Math.random(), Math.random() );
			
			this.flower.setCol(c);
			this.flower2.setCol(c);
			this.npp.addNoise();
			
		}
		
	}
}