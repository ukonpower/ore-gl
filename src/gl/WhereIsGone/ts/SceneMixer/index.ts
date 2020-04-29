import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import sceneMixerFrag from './shaders/sceneMixer.fs';

export class SceneMixer {

	private commonUniforms: ORE.Uniforms;

	private renderer: THREE.WebGLRenderer;

	private sceneRenderTargets: THREE.WebGLRenderTarget[];
	private depthRenderTargets: THREE.WebGLRenderTarget[];

	private pp: ORE.PostProcessing;

	private depthMat: THREE.MeshDepthMaterial;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms?: ORE.Uniforms ) {

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( parentUniforms, {
			sceneTex1: {
				value: null
			},
			sceneTex2: {
				value: null
			},
			depthTex1: {
				value: null
			},
			depthTex2: {
				value: null
			},
			order: {
				value: false
			},
			near: {
				value: 0
			},
			far: {
				value: 0
			}
		} );

		let param = [
			{
				fragmentShader: sceneMixerFrag,
				uniforms: this.commonUniforms
			}
		];

		this.pp = new ORE.PostProcessing( this.renderer, param );

		this.depthMat = new THREE.MeshDepthMaterial( {
			depthPacking: THREE.RGBADepthPacking
		} );

		this.init();

	}

	protected init() {

		let res = this.renderer.getSize( new THREE.Vector2() );

		this.sceneRenderTargets = [];
		this.depthRenderTargets = [];

		for ( let i = 0; i < 2; i ++ ) {

			this.sceneRenderTargets[ i ] = new THREE.WebGLRenderTarget( res.x, res.y );
			this.depthRenderTargets[ i ] = new THREE.WebGLRenderTarget( res.x, res.y );

		}

	}

	public renderScene( scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderTargetIndex: number ) {

		this.commonUniforms.near.value = camera.near;
		this.commonUniforms.far.value = camera.far;
		
		let oldRendertarget = this.renderer.getRenderTarget();

		this.renderer.setRenderTarget( this.sceneRenderTargets[ renderTargetIndex ] );

		this.renderer.render( scene, camera );

		this.renderer.setRenderTarget( this.depthRenderTargets[ renderTargetIndex ] );

		let clearColor = this.renderer.getClearColor();
		let clearAlpha = this.renderer.getClearAlpha();

		scene.overrideMaterial = this.depthMat;
		this.renderer.setClearColor( 0xffffff );
		this.renderer.setClearAlpha( 1.0 );

		this.renderer.render( scene, camera );

		scene.overrideMaterial = null;
		this.renderer.setClearColor( clearColor );
		this.renderer.setClearAlpha( clearAlpha );

		this.renderer.setRenderTarget( oldRendertarget );

	}

	public composite( order: boolean ) {

		this.commonUniforms.order.value = order;
		this.commonUniforms.sceneTex1.value = this.sceneRenderTargets[ 0 ].texture;
		this.commonUniforms.sceneTex2.value = this.sceneRenderTargets[ 1 ].texture;

		this.commonUniforms.depthTex1.value = this.depthRenderTargets[ 0 ].texture;
		this.commonUniforms.depthTex2.value = this.depthRenderTargets[ 1 ].texture;

		this.pp.render( true );

		return this.pp.getResultTexture();

	}

	public resize() {

		this.pp.resize();

		let res = this.renderer.getSize( new THREE.Vector2() );

		for ( let i = 0; i < this.sceneRenderTargets.length; i ++ ) {

			this.sceneRenderTargets[ i ].setSize( res.x, res.y );
			this.depthRenderTargets[ i ].setSize( res.x, res.y );

		}

	}

}
