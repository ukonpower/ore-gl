import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import blurFrag from './shaders/blur.fs';

export class BlurTexture {

	private commonUniforms: ORE.Uniforms;
	private renderer: THREE.WebGLRenderer;

	private blurPP: ORE.PostProcessing;
	public texture: { value: THREE.Texture };

	public blur: number;
	public renderCnt = 5;

	constructor( renderer: THREE.WebGLRenderer, size: THREE.Vector2 ) {

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
			texResolution: {
				value: size
			},
			texAspectRatio: {
				value: size.x / size.y
			},
			blurWeight: {
				value: 0
			}
		}, {} );

		this.texture = {
			value: null
		};

		this.blurPP = new ORE.PostProcessing( this.renderer,
			[ {
				fragmentShader: blurFrag,
				uniforms: ORE.UniformsLib.CopyUniforms( {
				}, this.commonUniforms )
			}]
		);

	}

	public udpateTexture( blur: number, inputTex: THREE.Texture ) {

		this.blur = blur;

		this.commonUniforms.blurWeight.value = blur;

		let tex = inputTex;

		for ( let i = 0; i < this.renderCnt; i ++ ) {

			this.blurPP.render( tex, true );

			tex = this.blurPP.getResultTexture();

		}

		this.renderer.setRenderTarget( null );

		this.texture.value = tex;

	}

}
