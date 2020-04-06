import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { ReflectionPlane } from './ReflectionPlane';
import { Emotion } from './Emotion';

export class ComplexScene extends ORE.BaseScene {

	private reflectPlane: THREE.Mesh;
	private emotion: Emotion;

	private commonUniforms: ORE.Uniforms;

	private light: THREE.Light;

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

		this.camera.position.set( 0, 0.5, 5 );
		this.camera.lookAt( 0, 1.5, 0 );

		this.light = new THREE.DirectionalLight();
		this.light.position.set( 1, 1, 1 );
		this.scene.add( this.light );

		this.emotion = new Emotion( this.renderer, this.commonUniforms );
		this.emotion.position.set( 0, 1.5, 0 );
		this.scene.add( this.emotion );

		this.reflectPlane = new ReflectionPlane( this.renderer, new THREE.Vector2( 10, 10 ), 0.5 );
		this.reflectPlane.position.set( 0, 0, 0 );
		this.reflectPlane.rotateX( - Math.PI / 2 );
		this.scene.add( this.reflectPlane );

	}

	public animate( deltaTime: number ) {

		this.commonUniforms.time.value = this.time;

		this.emotion.update( deltaTime );

		this.renderer.render( this.scene, this.camera );

	}

	public onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

	}

}
