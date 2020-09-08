import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import frag from './shaders/tunnel.fs';
import vert from './shaders/tunnel.vs';
import { throwStatement } from 'babel-types';

export class Tunnel extends THREE.Object3D {

	private time: number = 0;
	public uniforms: ORE.Uniforms;

	constructor( ) {

		super();

		this.createMesh();

	}

	private createMesh() {

		let cUni = {
			time: {
				value: 0
			},
			windowY: {
				value: window.innerHeight * window.devicePixelRatio
			},
			splash: {
				value: 0
			}
		};

		let baseMat = THREE.ShaderLib.standard;
		this.uniforms = THREE.UniformsUtils.merge( [ cUni, baseMat.uniforms ] );

		let geo = new THREE.PlaneBufferGeometry( 1, 1, 30, 800 );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: vert,
			fragmentShader: frag,
			uniforms: this.uniforms,
			lights: true,
			side: THREE.DoubleSide,
			flatShading: true,
			transparent: true,
		} );

		let point = new THREE.Points( geo, mat );
		point.renderOrder = 5;
		this.add( point );

	}

	public update( deltaTime: number, splash: number ) {

		this.uniforms.splash.value = splash;
		this.uniforms.time.value += deltaTime * ( 1.0 + ( splash || 0.0 ) * 5.0 );

	}

}
