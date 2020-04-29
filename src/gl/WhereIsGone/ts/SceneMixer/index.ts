import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import sceneMixerFrag from './shaders/sceneMixer.fs';

export class SceneMixer {

	private commonUniforms: ORE.Uniforms;

	private renderer: THREE.WebGLRenderer;

	private sceneRenderTargets: THREE.WebGLRenderTarget[];

	private pp: ORE.PostProcessing;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms?: ORE.Uniforms ) {

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( parentUniforms, {
			sceneTex1: {
				value: null
			},
			sceneTex2: {
				value: null
			},
			order: {
				value: false
			}
		} );

		let param = [
			{
				fragmentShader: sceneMixerFrag,
				uniforms: this.commonUniforms
			}
		];

		this.pp = new ORE.PostProcessing( this.renderer, param );

		this.init();

	}

	protected init() {

		let res = this.renderer.getSize( new THREE.Vector2() );

		this.sceneRenderTargets = [];

		for ( let i = 0; i < 2; i ++ ) {

			this.sceneRenderTargets[ i ] = new THREE.WebGLRenderTarget( res.x, res.y );
			this.sceneRenderTargets[ i ].depthTexture = new THREE.DepthTexture( res.x, res.y );

		}

	}

	public renderScene( scene: THREE.Scene, camera: THREE.Camera, renderTargetIndex: number ) {

		let oldRendertarget = this.renderer.getRenderTarget();

		this.renderer.setRenderTarget( this.sceneRenderTargets[ renderTargetIndex ] );

		this.renderer.render( scene, camera );

		this.renderer.setRenderTarget( oldRendertarget );

	}

	public composite( order: boolean ) {

		this.commonUniforms.order.value = order;
		this.commonUniforms.sceneTex1.value = this.sceneRenderTargets[ 0 ].texture;
		this.commonUniforms.sceneTex2.value = this.sceneRenderTargets[ 1 ].texture;

		this.pp.render();

	}

	public resize() {

		this.pp.resize();

		let res = this.renderer.getSize( new THREE.Vector2() );

		for ( let i = 0; i < this.sceneRenderTargets.length; i ++ ) {

			this.sceneRenderTargets[ i ].setSize( res.x, res.y );

		}

	}

}
