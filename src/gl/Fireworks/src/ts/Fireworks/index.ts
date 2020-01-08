import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import frag from './shaders/fireworks.fs';
import vert from './shaders/fireworks.vs';
import { throwStatement } from 'babel-types';

export class Fireworks extends THREE.Object3D{

	private time: number = 0;
	private num: number;
	private round: number;
	private mesh: THREE.Mesh;
	public uniforms: ORE.Uniforms;
	private changing: boolean = false;
	private changeTime: number = 0;
	private cb: Function;

	constructor( ){

		super();

		this.num = Math.floor( Math.random() * 10) + 30;
		this.round = Math.floor( Math.random() * 9) + 4;

		console.log( this.num, this.round);
		

		this.createMesh();

	}

	private createMesh(){

		let planeGeo = new THREE.CylinderBufferGeometry( 0.05, 0.05, 1.0, 5, 10 );

		let geo = new THREE.InstancedBufferGeometry();

		let pos = ( planeGeo.attributes.position as THREE.BufferAttribute).clone();
        geo.addAttribute( 'position', pos );

        let normal = ( planeGeo.attributes.normal as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'normals', normal );

        let uv = ( planeGeo.attributes.uv as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'uv', uv );

        let indices = planeGeo.index.clone();
		geo.setIndex( indices );

		let n = new THREE.InstancedBufferAttribute( new Float32Array(this.num * this.round), 1, false, 1 );
		let round = new THREE.InstancedBufferAttribute( new Float32Array(this.num * this.round), 1, false, 1 );
		let theta = new THREE.InstancedBufferAttribute( new Float32Array(this.num * this.round), 1, false, 1 );
		
		for( let i = 0; i < this.round; i++ ){

			for( let j = 0; j < this.num; j++ ){

				let k = i * this.num + j;
				n.setX( k, i * this.num + j );
				round.setX( k,  i );
				theta.setX( k, Math.PI * 2.0 * ( j / this.num ) );

			}
			
		}

		geo.addAttribute( 'n', n );
		geo.addAttribute( 'round', round );
		geo.addAttribute( 'theta', theta );

		let baseMat = THREE.ShaderLib.standard;

		let cUni = {
			time: {
				value: 0,
			},
			allRound:{
				value: this.round
			},
			allNum: {
				value: this.num * this.round
			},
			uColor: {
				value: new THREE.Vector3( Math.random() * 2 - 1,Math.random() * 2 - 1,Math.random() * 2 - 1,)
			},
			changeW: {
				value: 0
			}
		}

		this.uniforms = THREE.UniformsUtils.merge([ cUni, baseMat.uniforms ]);
		
		let mat = new THREE.ShaderMaterial({
			vertexShader: vert,
			fragmentShader: frag,
			uniforms: this.uniforms,
			side: THREE.DoubleSide,
			transparent: true,
			lights: true,
			flatShading: true
		})

		this.mesh = new THREE.Mesh( geo, mat );
		this.mesh.renderOrder = 3;

		this.add( this.mesh );
		
	}

	public update( deltaTime: number ){


		if( this.changing ){

			let len = 0.5;

			this.changeTime += deltaTime;
			
			this.uniforms.changeW.value = Math.sin( this.changeTime / len * Math.PI / 2.0 );

			if( this.changeTime > len ){
				
				this.changing = false;
				this.changeTime = len;
				this.time = 0;
				this.uniforms.changeW.value = 0;
				this.uniforms.uColor.value.set( Math.random() * 2 - 1,Math.random() * 2 - 1,Math.random() * 2 - 1,);

				if( this.cb ){
					this.cb();
				}
			}


		}else{

			this.time += deltaTime;

		}

		this.uniforms.time.value = this.time;

	}

	public changeColor( cb?: Function ){
		
		console.log( 'change' );

		if( !this.changing ){

			this.changing = true;
			this.changeTime = 0;

		}

		this.cb = cb;
		
	}

	public dispose(){

		this.mesh.geometry.dispose();

	}

}