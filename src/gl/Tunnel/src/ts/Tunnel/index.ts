import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import frag from './shaders/Tunnel.fs';
import vert from './shaders/Tunnel.vs';
import { throwStatement } from 'babel-types';

export class Tunnel extends THREE.Object3D{

	private time: number = 0;
	public uniforms: ORE.Uniforms;

	constructor( ){

		super();

		this.createMesh();

	}

	private createMesh(){

		let cUni = {
			time: {
				value: 0
			}
		}

		let baseMat = THREE.ShaderLib.standard;
		this.uniforms = THREE.UniformsUtils.merge([cUni, baseMat.uniforms]);

		let geo = new THREE.PlaneBufferGeometry( 1, 1, 10, 100 );
		let mat = new THREE.ShaderMaterial({
			vertexShader: vert,
			fragmentShader: frag,
			uniforms: this.uniforms,
			lights: true,
			side: THREE.DoubleSide,
			flatShading: true,
			transparent: true,
		})

		let point = new THREE.Points( geo, mat );
		point.renderOrder = 5;
		this.add( point );

	}

	public update( time: number ){

		this.uniforms.time.value = time;

	}

}