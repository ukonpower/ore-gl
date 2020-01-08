import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import frag from './shaders/heart.fs';
import vert from './shaders/heart.vs';

import spVert from './shaders/sp.vs';
import spFrag from './shaders/sp.fs';

import computeFrag from './shaders/compute.fs';
import { GPUComputationController, GPUComputationKernel, GPUcomputationData } from '../GPUComputationController';

export class Heart extends THREE.Object3D{

	private renderer: THREE.WebGLRenderer;

	private time: number = 0;
	private num: number;
	private mesh: THREE.Mesh;
	public uniforms: ORE.Uniforms;

	private gpuCon: GPUComputationController;
	private kernel: GPUComputationKernel;
	private gpuData: GPUcomputationData;

	constructor( renderer: THREE.WebGLRenderer, num: number ){

		super();

		this.renderer = renderer;
		this.num = num;

		this.createMesh();
		this.initComputingShader();

	}

	private initComputingShader(){
	
		this.gpuCon = new GPUComputationController( this.renderer, new THREE.Vector2( this.num, 1 ) )
		this.kernel = this.gpuCon.createKernel( computeFrag );
		this.gpuData = this.gpuCon.createData({
			magFilter: THREE.LinearFilter,
			minFilter: THREE.LinearFilter,
		});

		this.kernel.uniforms.time = { value: 0 };
		this.kernel.uniforms.dataTex = { value: null };
		this.kernel.uniforms.rotVec = { value: new THREE.Vector2(0, 0) };
		this.kernel.uniforms.rotationQ = { value: new THREE.Quaternion() };

		this.gpuCon.compute( this.kernel, this.gpuData );

	}

	private createMesh(){

		let scale = 0.1;
		let cyGeo = new THREE.BoxBufferGeometry( scale, scale, scale, 100, 1 );
		
		let geo = new THREE.InstancedBufferGeometry();

		let pos = ( cyGeo.attributes.position as THREE.BufferAttribute).clone();
        geo.addAttribute( 'position', pos );

        let normal = ( cyGeo.attributes.normal as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'normals', normal );

        let uv = ( cyGeo.attributes.uv as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'uv', uv );

        let indices = cyGeo.index.clone();
		geo.setIndex( indices );

		let g = 2;
		let n = new THREE.InstancedBufferAttribute( new Float32Array( this.num * g ), 1, false, 1 );
		let group = new THREE.InstancedBufferAttribute( new Float32Array( this.num * g ), 1, false, 1 );

		for( let i = 0; i < this.num * g; i++ ){

			n.setX( i, i % this.num );
			group.setX( i, Math.floor( i / this.num ) );			

		}
		
		geo.addAttribute( 'n', n );
		geo.addAttribute( 'group', group );

		let baseMat = THREE.ShaderLib.standard;

		let cUni = {
			time: {
				value: 0,
			},
			allNum: {
				value: this.num 
			},
			dataTex: {
				value: null
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
			flatShading: true,
			depthTest: true 
		})

		this.mesh = new THREE.Mesh( geo, mat );
		this.mesh.renderOrder = 3;

		this.add( this.mesh );

		let sp = new THREE.SphereBufferGeometry( 1.5, 7, 10 );
		let spMat = new THREE.ShaderMaterial({
			vertexShader: spVert,
			fragmentShader: spFrag,
			uniforms: this.uniforms
		});

		spMat.wireframe = true;
		
	}

	public update( deltaTime: number ){

		this.time += deltaTime;

		this.kernel.uniforms.time.value = this.time;
		this.kernel.uniforms.rotVec.value = this.uniforms.rotVec.value;
		if( this.uniforms.rotationQ.value )
				this.kernel.uniforms.rotationQ.value = this.uniforms.rotationQ.value;
		this.kernel.uniforms.dataTex.value = this.gpuData.buffer.texture;
		this.gpuCon.compute( this.kernel, this.gpuData );

		this.uniforms.time.value = this.time;
		this.uniforms.dataTex.value = this.gpuData.buffer.texture;

	}

}