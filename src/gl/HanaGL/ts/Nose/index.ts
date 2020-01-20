import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { Blood } from './Blood';

import meshFrag from './shaders/noseMesh.fs';
import wireFrag from './shaders/noseWire.fs';

import meshVert from './shaders/noseMesh.vs';
import wireVert from './shaders/noseWire.vs';

export class Nose extends THREE.Object3D{

	private renderer: THREE.WebGLRenderer;

	private time: number = 0;

	private wireNose: THREE.Mesh;
	private meshNose: THREE.Mesh;

	private leftPoint: THREE.Object3D;
	private rightPoint: THREE.Object3D;

	private blood: Blood;

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private meshUniforms: ORE.Uniforms;

	private isSplash: boolean = false;

	constructor( renderer: THREE.WebGLRenderer, gltfScene: THREE.Scene ){

		super();

		this.renderer = renderer;

		this.animator = new ORE.Animator();

		this.craeteObjects( gltfScene );

	}

	private craeteObjects( gltfScene: THREE.Scene ){

		this.commonUniforms = {
			opacity: {
				value: 0
			},
			splash: {
				value: 0
			},
			time: {
				value: 0
			}
		}

		/*-------------------------
			Mesh
		--------------------------*/

		this.meshUniforms = THREE.ShaderLib.standard.uniforms;
		this.meshUniforms.opacity = this.commonUniforms.opacity;
		this.meshUniforms.splash = this.commonUniforms.splash;
		this.meshUniforms.time = this.commonUniforms.time;


		// let uni = {
		// 	opacity: this.commonUniforms.opacity
		// }

		// this.meshUniforms = THREE.UniformsUtils.merge( [ THREE.ShaderLib.standard.uniforms, uni ])
		
		this.meshNose = ( gltfScene.getObjectByName( 'Nose' ) as THREE.Mesh ).clone();
		this.meshNose.material = new THREE.ShaderMaterial({
			fragmentShader: meshFrag,
			vertexShader: meshVert,
			uniforms: this.meshUniforms,
			lights: true,
			extensions: {
				derivatives: true
			},
			transparent: true
		});

		this.animator.addVariable('opacity', 0.0 );
		this.animator.animate( 'opacity', 1.0, 3 );

		this.animator.addVariable('pos', 1 );
		this.animator.animate('pos', 0 );

		this.animator.addVariable('splash', 0, { func: ORE.Easings.easeOutCubic } );

		this.add( this.meshNose );

		/*-------------------------
			Wire
		--------------------------*/

		this.wireNose = ( gltfScene.getObjectByName( 'Nose' ) as THREE.Mesh ).clone();
		this.wireNose.material = new THREE.ShaderMaterial({
			fragmentShader: wireFrag,
			vertexShader: wireVert,
			uniforms: this.meshUniforms,
			lights: true,
			extensions: {
				derivatives: true
			},
			transparent: true,
			wireframe: true
		});
		this.add( this.wireNose );

		/*-------------------------
			Positions
		--------------------------*/

		this.rightPoint = ( this.meshNose.getObjectByName( 'splash_right' ) as THREE.Mesh );
		this.leftPoint = ( this.meshNose.getObjectByName( 'splash_left' ) as THREE.Mesh );


		/*-------------------------
			Blood
		--------------------------*/

		this.blood = new Blood( this.renderer );
		this.meshNose.add( this.blood );

	}

	public update( time: number, deltaTime: number ){

		this.blood.update( deltaTime );

		this.animator.update( deltaTime );

		this.commonUniforms.time.value = time;
		
		this.commonUniforms.opacity.value = this.animator.getValue( 'opacity' );
		this.commonUniforms.splash.value = this.animator.getValue( 'splash' );

	}

	public splash( pos: THREE.Vector3 ){

		if( this.isSplash ) return;

		this.isSplash = true;
		
		this.animator.animate( 'splash', 1, 0.3 );

		this.blood.splash( pos );

	}

	public heal(){

		if( !this.isSplash ) return;

		this.isSplash = false;

		this.animator.animate( 'splash', 0, 0.3 );

		this.blood.heal( );

	}

	public updateFingerPos( fingerPos: THREE.Vector3 ){

		let lenRight = new THREE.Vector3().subVectors( fingerPos, this.rightPoint.getWorldPosition( new THREE.Vector3() ) ).length();
		let lenLeft = new THREE.Vector3().subVectors( fingerPos, this.leftPoint.getWorldPosition( new THREE.Vector3() ) ).length();

		let spl = false;

		if( lenRight < 0.2 ){

			this.splash( this.rightPoint.position );
			spl = true;

		}

		if( lenLeft < 0.2 ){

			this.splash( this.leftPoint.position );
			spl = true;

		}

		if( !spl ){

			this.heal();

		}

		return spl;
		
	}
}