import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import powerMatVert from './shaders/powerMat.vs';
import powerMatFrag from './shaders/powerMat.fs';

export declare interface PowerMaterialParams extends THREE.MaterialParameters {
	roughness?: number,
	metalness?: number,
	uniforms?: any;
	vertexShader?: string;
	transparent?: boolean;
	useEnvMap?: boolean;
	envMap?: THREE.CubeTexture;
}

export class PowerMaterial extends THREE.ShaderMaterial {

	public envMap: THREE.CubeTexture;
	public roughness: number;
	public metalness: number;
	public envMapIntensity: number;

	constructor( param: PowerMaterialParams ) {

		param.uniforms = param.uniforms || {};

		let baseUni = THREE.UniformsUtils.merge(
			[
				THREE.UniformsLib.lights,
				THREE.UniformsLib.envmap,
				THREE.ShaderLib.physical.uniforms,
			]
		);

		param.uniforms = ORE.UniformsLib.CopyUniforms( param.uniforms, {
			roughness: {
				value: 0
			},
			metalness: {
				value: 0
			},
			opacity: {
				value: 0
			},
			clearcoat: {
				value: 0
			}
		} );
		param.uniforms = ORE.UniformsLib.CopyUniforms( param.uniforms, baseUni );

		param.vertexShader = param.vertexShader || powerMatVert;

		super( {
			vertexShader: param.vertexShader,
			fragmentShader: powerMatFrag,
			uniforms: param.uniforms,
			lights: true
		} );

		this.roughness = param.roughness != undefined ? param.roughness : 0.2;
		this.metalness = param.metalness != undefined ? param.metalness : 0.3;
		this.envMapIntensity = 1.0;

	}

	public get isMeshStandardMaterial() {

		return true;

	}

	public get isMeshPhysicalMaterial() {

		return true;

	}

}
