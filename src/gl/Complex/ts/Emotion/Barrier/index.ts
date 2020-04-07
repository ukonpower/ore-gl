import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { BarrierMaterial } from './BarrierMaterial';

import positionFrag from './shaders/position.fs';
import velocityFrag from './shaders/velocity.fs';

import barrierVert from './shaders/barrier.vs';
import barrierFrag from './shaders/barrier.fs';

import viewerVert from './shaders/viewer.vs';
import viewerFrag from './shaders/viewer.fs';

declare interface Kernels{
    velocity: ORE.GPUComputationKernel,
    position: ORE.GPUComputationKernel
}

declare interface Datas{
    velocity: ORE.GPUcomputationData,
    position: ORE.GPUcomputationData
}

export class Barrier extends THREE.Mesh {

	private renderer: THREE.WebGLRenderer;

	private commonUniforms: ORE.Uniforms;
	private pointUni: ORE.Uniforms;

	private gCon: ORE.GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;
	private particles: THREE.Mesh;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms?: ORE.Uniforms ) {

		super();

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
			seed: {
				value: Math.random() * 1000.0
			}
		}, parentUniforms );

		let size = new THREE.Vector2( 64, 64 );

		this.initGPUComputationController( size );
		this.createPoints( size );

	}

	private initGPUComputationController( size: THREE.Vector2 ) {

		this.gCon = new ORE.GPUComputationController( this.renderer, size );

		//create computing position kernel
		let posUni = ORE.UniformsLib.CopyUniforms( {
			dataPos: { value: null },
			dataVel: { value: null },
		}, this.commonUniforms );

		let posKernel = this.gCon.createKernel( positionFrag, posUni );

		//create computing velocity kernel
		let velUni = ORE.UniformsLib.CopyUniforms( {
			dataPos: { value: null },
			dataVel: { value: null },
		}, this.commonUniforms );

		let velKernel = this.gCon.createKernel( velocityFrag, velUni );

		this.kernels = {
			position: posKernel,
			velocity: velKernel,
		};

		this.datas = {
			position: this.gCon.createData(),
			velocity: this.gCon.createData(),
		};

	}

	private createPoints( size: THREE.Vector2 ) {

		let originBox = new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1 );
		let geo = new THREE.InstancedBufferGeometry();

		let vertice = ( originBox.attributes.position as THREE.BufferAttribute ).clone();
		geo.setAttribute( 'position', vertice );

		let normal = ( originBox.attributes.normal as THREE.BufferAttribute ).clone();
		geo.setAttribute( 'normal', normal );

		let uv = ( originBox.attributes.normal as THREE.BufferAttribute ).clone();
		geo.setAttribute( 'uv', uv );

		let indices = originBox.index.clone();
		geo.setIndex( indices );

		let texUVArray = [];

		for ( let i = 0; i < size.y; i ++ ) {

			for ( let j = 0; j < size.x; j ++ ) {

				texUVArray.push(
					j / ( size.x - 1.0 ), i / ( size.y - 1.0 )
				);

			}

		}

		geo.setAttribute( 'texUV', new THREE.InstancedBufferAttribute( new Float32Array( texUVArray ), 2 ) );

		this.pointUni = {
			posTex: {
				value: null
			},
			velTex: {
				value: null
			}
		};

		let mat = new BarrierMaterial( {
			uniforms: this.pointUni
		} );

		this.particles = new THREE.Mesh( geo, mat );
		this.particles.frustumCulled = false;
		this.add( this.particles );

		let vSize = 2.0;

		let velViewer = new THREE.Mesh( new THREE.PlaneGeometry( vSize, vSize ), new THREE.ShaderMaterial( {
			fragmentShader: viewerFrag,
			vertexShader: viewerVert,
			uniforms: ORE.UniformsLib.CopyUniforms( { selector: { value: 0 } }, this.pointUni )
		} ) );

		velViewer.position.x = 1.5;

		// this.add( velViewer );

		let posViewer = new THREE.Mesh( new THREE.PlaneGeometry( vSize, vSize ), new THREE.ShaderMaterial( {
			fragmentShader: viewerFrag,
			vertexShader: viewerVert,
			uniforms: ORE.UniformsLib.CopyUniforms( { selector: { value: 1 } }, this.pointUni )
		} ) );

		posViewer.position.x = - 1.5;

		// this.add( posViewer );

	}

	public update( deltaTime: number ) {

		//update velocity
		this.kernels.velocity.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.velocity.uniforms.dataVel.value = this.datas.velocity.buffer.texture;

		this.gCon.compute( this.kernels.velocity, this.datas.velocity );

		//update position
		this.kernels.position.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.position.uniforms.dataVel.value = this.datas.velocity.buffer.texture;

		this.gCon.compute( this.kernels.position, this.datas.position );

		this.pointUni.posTex.value = this.datas.position.buffer.texture;
		this.pointUni.velTex.value = this.datas.velocity.buffer.texture;

	}

}
