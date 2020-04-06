import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { ReflectionMat } from './ReflectionMat';
import { BlurTexture } from './ReflectionMat/BlurTexture';

export class ReflectionPlane extends THREE.Mesh {

	private params: any;

	private commonUniforms: ORE.Uniforms;
	private refRenderTarget: THREE.WebGLRenderTarget;
	private resolutionRatio: number;

	private blurTexture: BlurTexture;

	private mat: ReflectionMat;

	constructor( renderer: THREE.WebGLRenderer, size: THREE.Vector2, resolutionRatio: number = 0.5, parentUniforms?: ORE.Uniforms ) {

		let uni = {
			reflectionTex: {
				value: null
			},
			winResolution: {
				value: new THREE.Vector2( window.innerWidth, window.innerHeight )
			}
		};

		let geo = new THREE.PlaneBufferGeometry( size.x, size.y );
		let mat = new ReflectionMat( {
			uniforms: uni
		} );

		super( geo, mat );

		this.blurTexture = new BlurTexture( renderer, new THREE.Vector2( 512, 512 ) );

		this.mat = mat;
		this.resolutionRatio = resolutionRatio;
		this.commonUniforms = ORE.UniformsLib.CopyUniforms( uni, parentUniforms );

		this.init();

	}

	protected init() {

		this.refRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
		this.commonUniforms.reflectionTex.value = this.refRenderTarget.texture;

		let n = new THREE.Vector3( 0, 0, 1 );
		let x = new THREE.Vector3( 0, 0, 0 );

		this.onBeforeRender = ( renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera ) => {

			this.visible = false;

			let refCamera = camera.clone();

			let inverse = new THREE.Matrix4().getInverse( this.matrixWorld );

			refCamera.applyMatrix4( inverse );

			//カメラの向く位置と面の交点
			let x0 = refCamera.position.clone();
			let m = refCamera.getWorldDirection( new THREE.Vector3() );
			let h = n.clone().dot( x );
			let intersectPoint = x0.add( m.clone().multiplyScalar( ( h - n.clone().dot( x0 ) ) / ( n.clone().dot( m ) ) ) );

			refCamera.position.reflect( n );

			refCamera.up.set( 0, - 1, 0 );
			refCamera.up.applyMatrix4( inverse );
			refCamera.up.reflect( n );
			refCamera.lookAt( intersectPoint );

			refCamera.applyMatrix4( this.matrix );

			renderer.setRenderTarget( this.refRenderTarget );

			renderer.render( scene, refCamera );

			renderer.setRenderTarget( null );

			this.visible = true;

			this.blurTexture.udpateTexture( 0.3, this.refRenderTarget.texture );

			this.commonUniforms.reflectionTex.value = this.blurTexture.texture.value;

		};

	}

	public update() {

		this.mat.metalness = this.params.metalic;
		this.mat.roughness = this.params.roughness;
		// this.commonUniforms.color.value = this.params.color;

	}

	public resize( resolution: THREE.Vector2 ) {

		this.refRenderTarget.setSize( resolution.x * this.resolutionRatio, resolution.y * this.resolutionRatio );
		this.commonUniforms.winResolution.value.copy( resolution );

	}

}