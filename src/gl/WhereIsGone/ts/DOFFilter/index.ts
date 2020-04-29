import * as THREE from 'three';
import blur from './shaders/blur.fs';
import compo from './shaders/compo.fs';

import * as ORE from '@ore-three-ts';

export class DOFFilter {

	public scene: THREE.Scene;
	public camera: THREE.Camera

	//postprocessings
	protected _blurPP: ORE.PostProcessing;
	protected _compoPP: ORE.PostProcessing;
	protected renderer: THREE.WebGLRenderer;

	protected depthMaterial: THREE.MeshDepthMaterial;

	protected sceneRenderTarget: THREE.WebGLRenderTarget;
	protected depthRenderTarget: THREE.WebGLRenderTarget;

	//uniforms
	private _blurRange: number = 2;
	public sceneTex: THREE.IUniform;
	protected commonUniforms: ORE.Uniforms;

	//parameters
	public renderCount: number = 4;
	protected resolution: THREE.Vector2;
	protected lowResolution: THREE.Vector2;
	protected blurResolution: THREE.Vector2;
	protected textureResolutionRatio: number;

	constructor( renderer: THREE.WebGLRenderer, textureResolutionRatio?: number, customResolution?: THREE.Vector2 ) {

		this.renderer = renderer;

		this.textureResolutionRatio = textureResolutionRatio ? textureResolutionRatio : 0.3;

		this.resolution = new THREE.Vector2();
		this.blurResolution = new THREE.Vector2();

		this.depthMaterial = new THREE.MeshDepthMaterial( {
			depthPacking: THREE.RGBADepthPacking,
			// blending: THREE.NoBlending
		} );

		this.init();
		this.resize( customResolution );

	}

	public set blurRange( value: number ) {

		this._blurRange = value;

		this.blurResolution.copy( this.lowResolution.clone().divideScalar( this._blurRange ) );

	}

	public set threshold( value: number ) {

		this.commonUniforms.threshold.value = value;

	}

	public set brightness( value: number ) {

		this.commonUniforms.brightness.value = value;

	}

	protected init() {

		this.sceneTex = {
			value: null
		};

		//uniforms
		this.commonUniforms = {
			resolution: {
				value: this.blurResolution
			},
			threshold: {
				value: 0.5,
			},
			brightness: {
				value: 0.7
			},
			depthTexture: {
				value: null
			},
			near: {
				value: 0
			},
			far: {
				value: 0
			},
			focus: {
				value: 10.0
			},
			bokeh: {
				value: 1.5
			},
			range: {
				value: 9.0
			},
			sceneTex: this.sceneTex
		};

		//postprocess params
		let blurParam = [ {
			fragmentShader: blur,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				direction: { value: true }
			}, this.commonUniforms )
		},
		{
			fragmentShader: blur,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				direction: { value: false }
			}, this.commonUniforms )
		} ];

		//create post processings
		this._blurPP = new ORE.PostProcessing( this.renderer, blurParam );
		this.sceneRenderTarget = this._blurPP.createRenderTarget();
		this.depthRenderTarget = this._blurPP.createRenderTarget();

		//postprocess params
		let compoParam = [ {
			fragmentShader: compo,
			uniforms: ORE.UniformsLib.CopyUniforms( {
			}, this.commonUniforms )
		} ];

		this._compoPP = new ORE.PostProcessing( this.renderer, compoParam );

	}

	public render( scene: THREE.Scene, camera: THREE.PerspectiveCamera, offscreenRendering: boolean = false ) {

		this.commonUniforms.near.value = camera.near;
		this.commonUniforms.far.value = camera.far;

		let renderTarget = this.renderer.getRenderTarget();

		//render scene
		this.renderer.setRenderTarget( this.sceneRenderTarget );
		this.renderer.render( scene, camera );

		let clearColor = this.renderer.getClearColor();
		let clearAlpha = this.renderer.getClearAlpha();

		this.renderer.setClearColor( 0xffffff );
		this.renderer.setClearAlpha( 1.0 );

		scene.overrideMaterial = this.depthMaterial;
		this.renderer.setRenderTarget( this.depthRenderTarget );
		this.renderer.clear();
		this.renderer.render( scene, camera );

		scene.overrideMaterial = null;
		this.renderer.setClearColor( clearColor );
		this.renderer.setClearAlpha( clearAlpha );

		this.sceneTex.value = this.sceneRenderTarget.texture;
		this.commonUniforms.depthTexture.value = this.depthRenderTarget.texture;

		let tex = this.sceneRenderTarget.texture;

		this.renderer.setRenderTarget( renderTarget );

		//render blur
		for ( let i = 0; i < this.renderCount; i ++ ) {

			this._blurPP.render( tex, true );
			tex = this._blurPP.getResultTexture();

		}

		this._compoPP.render( tex, offscreenRendering );
		tex = this._compoPP.getResultTexture();

		return offscreenRendering ? tex : null;

	}

	public resize( resolution?: THREE.Vector2 ) {

		let res = new THREE.Vector2();

		if ( resolution ) {

			res.copy( resolution );

		} else {

			res.set( window.innerWidth, window.innerHeight );
			res.multiplyScalar( this.renderer.getPixelRatio() );

		}

		this.resolution.copy( res );

		this.lowResolution = this.resolution.clone().multiplyScalar( this.textureResolutionRatio );

		this.sceneRenderTarget.setSize( this.resolution.x, this.resolution.y );
		this.depthRenderTarget.setSize( this.resolution.x, this.resolution.y );

		this._blurPP.resize( this.lowResolution );
		this._compoPP.resize( this.resolution );

		this.blurRange = this._blurRange;

	}

}
