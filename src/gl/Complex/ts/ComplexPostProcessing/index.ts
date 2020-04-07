import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import bright from './glsl/bright.fs';
import blur from './glsl/blur.fs';
import bloom from './glsl/bloom.fs';
import postprocess from './glsl/postprocess.fs';

export class ComplexPostProcessing {

	public scene: THREE.Scene;
	public camera: THREE.Camera

	//ORE.PostProcessings
	protected _brightPP: ORE.PostProcessing;
	protected _blurPP: ORE.PostProcessing;
	protected _bloomPP: ORE.PostProcessing;

	protected renderer: THREE.WebGLRenderer;

	protected sceneRenderTarget: THREE.WebGLRenderTarget;

	//uniforms
	private _blurRange: number = 2;
	public sceneTex: THREE.IUniform;
	protected commonUniforms: ORE.Uniforms;

	//parameters
	public renderCount: number = 5;
	protected resolution: THREE.Vector2;
	protected lowResolution: THREE.Vector2;
	protected blurResolution: THREE.Vector2;
	protected textureResolutionRatio: number;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms, textureResolutionRatio?: number, customResolution?: THREE.Vector2 ) {

		this.renderer = renderer;

		this.textureResolutionRatio = 0.2;

		this.resolution = new THREE.Vector2();
		this.blurResolution = new THREE.Vector2();

		//uniforms
		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
			resolution: {
				value: this.blurResolution
			},
			threshold: {
				value: 0.5,
			},
			brightness: {
				value: 0.7
			},
		}, parentUniforms );

		this.init();
		this.resize( customResolution );

		this.brightness = 1.2;
		this.blurRange = 3.0;
		this.threshold = 0.15;
		this.renderCount = 5.0;

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

		//postprocess params
		let brightParam = [ {
			fragmentShader: bright,
			uniforms: this.commonUniforms,
		} ];

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

		let bloomParam = [ {
			fragmentShader: bloom,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				sceneTex: this.sceneTex,
			}, this.commonUniforms )
		}, {
			fragmentShader: postprocess,
			uniforms: this.commonUniforms
		} ];


		//create post processings
		this._brightPP = new ORE.PostProcessing( this.renderer, brightParam );
		this._blurPP = new ORE.PostProcessing( this.renderer, blurParam );
		this._bloomPP = new ORE.PostProcessing( this.renderer, bloomParam );
		this._bloomPP = new ORE.PostProcessing( this.renderer, bloomParam );
		this.sceneRenderTarget = this._bloomPP.createRenderTarget();

	}

	public render( srcTexture: THREE.Texture, offscreenRendering?: boolean );

	public render( scene: THREE.Scene, camera: THREE.Camera, offscreenRendering?: boolean );

	public render( tex_scene: THREE.Texture | THREE.Scene = null, offscreen_camera: boolean | THREE.Camera = false, offscreenRendering: boolean = false ) {

		let isInputedTexture: boolean = true;
		let offsc = offscreen_camera as boolean;

		//render scene
		if ( 'isScene' in tex_scene ) {

			isInputedTexture = false;
			offsc = offscreenRendering;

			this.renderer.setRenderTarget( this.sceneRenderTarget );
			this.renderer.render( tex_scene as THREE.Scene, offscreen_camera as THREE.Camera );

		} else if ( 'isTexture' in tex_scene ) {

			this.resolution.set( tex_scene.image.width, tex_scene.image.height );

		}

		this.sceneTex.value = isInputedTexture ? tex_scene : this.sceneRenderTarget.texture;

		//render birightness part
		this._brightPP.render( isInputedTexture ? tex_scene as THREE.Texture : this.sceneRenderTarget.texture, true );
		let tex = this._brightPP.getResultTexture();

		//render blur
		for ( let i = 0; i < this.renderCount; i ++ ) {

			this._blurPP.render( tex, true );
			tex = this._blurPP.getResultTexture();

		}

		//composition bloom
		this._bloomPP.render( tex, offsc );

		return offsc ? this._bloomPP.getResultTexture() : null;

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

		this._brightPP.resize( this.lowResolution );

		this._blurPP.resize( this.lowResolution );

		this._bloomPP.resize( this.resolution );

		this.blurRange = this._blurRange;

	}

}
