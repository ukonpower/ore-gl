import * as ORE from '../..';

import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';
import vert from './shaders/trails.vs';
import frag from './shaders/trails.fs';


import * as THREE from 'three';
import { GPUComputationController, GPUComputationKernel, GPUcomputationData } from '../../../GPUComputationController';

declare interface Kernels{
    velocity: GPUComputationKernel,
    position: GPUComputationKernel
}

export class BloodTrails extends THREE.Object3D {

    private renderer: THREE.WebGLRenderer;

    private gcController: GPUComputationController
    private kernels: Kernels;
    private positionData: GPUcomputationData;
    private velocityData: GPUcomputationData;

    private num:number;
    private length: number;
    private uni: any;

    private time: number = 0;

    constructor( renderer :THREE.WebGLRenderer, num : number, length :number ) {

    	super();

    	this.renderer = renderer;
    	this.num = num;
    	this.length = length;

    	this.gcController = new GPUComputationController( this.renderer, new THREE.Vector2( this.length, this.num ) );

    	//create kernels
    	this.kernels = {
    		position: this.gcController.createKernel( comShaderPosition ),
    		velocity: this.gcController.createKernel( comShaderVelocity )
    	};

    	//create data
    	this.positionData = this.gcController.createData(
    		this.createInitData(),
    		{
    			magFilter: THREE.NearestFilter,
    			minFilter: THREE.NearestFilter,
    		}
    	);

    	this.velocityData = this.gcController.createData(
    		this.createInitData(),
    		{
    			magFilter: THREE.NearestFilter,
    			minFilter: THREE.NearestFilter,
    		}
    	);

    	//set uniforms
    	this.kernels.position.uniforms.texturePosition = { value: null };
    	this.kernels.position.uniforms.textureVelocity = { value: null };
    	this.kernels.position.uniforms.eruptionPos = { value: new THREE.Vector3() };
    	this.kernels.position.uniforms.isSplash = { value: false };
    	this.kernels.position.uniforms.deltaTime = { value: 0 };

    	this.kernels.velocity.uniforms.texturePosition = { value: null };
    	this.kernels.velocity.uniforms.textureVelocity = { value: null };
    	this.kernels.velocity.uniforms.isSplash = { value: false };

    	this.kernels.velocity.uniforms.time = { value: 0 };
    	this.kernels.velocity.uniforms.seed = { value: Math.random() * 100.0 };

    	this.createTrails();

    }

    private createInitData() {

    	let dataArray = [];
    	let range = new THREE.Vector3( 10, 10, 10 );

    	for ( let i = 0; i < this.num; i ++ ) {

    		let time = 1000;

    		for ( let j = 0; j < this.length; j ++ ) {

    			dataArray.push( 0, 0, 0, time );

    		}

    	}

    	return new THREE.DataTexture( new Float32Array( dataArray ), this.num, this.length, THREE.RGBAFormat, THREE.FloatType );

    }

    createTrails() {

    	1;
    	let geo = new THREE.InstancedBufferGeometry();

    	let posArray = [];
    	let indexArray = [];
    	let normalArray = [];
    	let uvXArray = [];
    	let uvYArray = [];

    	let r = .1;
    	let res = 10;

    	for ( let j = 0; j < this.length; j ++ ) {

    		let cNum = j;

    		for ( let k = 0; k < res; k ++ ) {

    			let rad = Math.PI * 2 / res * k;
    			let x = Math.cos( rad ) * r;
    			let y = Math.sin( rad ) * r;
    			let z = j * 1.6;
    			z = 0;

    			posArray.push( x );
    			posArray.push( y );
    			posArray.push( z );

    			let nml = new THREE.Vector3( x, y, z );
    			nml.normalize();

    			normalArray.push( nml.x, nml.y, nml.z );

    			uvXArray.push( j / this.length );

    			let c = cNum * res + k;

    			if ( j > 0 ) {

    				indexArray.push( c );
    				indexArray.push( ( ( cNum - 1 ) * ( res ) + ( k + 1 ) % res ) );
    				indexArray.push( ( cNum * res + ( ( k + 1 ) % res ) ) );

    				indexArray.push( c );
    				indexArray.push( c - res );
    				indexArray.push( ( ( cNum - 1 ) * res + ( ( k + 1 ) % res ) ) );

    			}

    		}

    	}

    	let pos = new Float32Array( posArray );
    	let normal = new Float32Array( normalArray );
    	let indices = new Uint32Array( indexArray );
    	let uvx = new Float32Array( uvXArray );

    	geo.setAttribute( 'position', new THREE.BufferAttribute( pos, 3 ) );
    	geo.setAttribute( 'uvx', new THREE.BufferAttribute( uvx, 1 ) );
    	geo.setAttribute( 'normal', new THREE.BufferAttribute( normal, 3 ) );
    	geo.setIndex( new THREE.BufferAttribute( indices, 1 ) );

    	//instanecing attribute
    	for ( let i = 0; i < this.num; i ++ ) {

    		uvYArray.push( i / this.num );

    	}

    	let uvy = new Float32Array( uvYArray );
    	geo.setAttribute( 'uvy', new THREE.InstancedBufferAttribute( uvy, 1, false, 1 ) );

    	let customUni = {
    		texturePosition: {
    			value: null
    		},
    		textureVelocity: {
    			value: null
    		},
    		diffuse: {
    			value: new THREE.Color( 0xff7711 )
    		}
    	};

    	let phong = THREE.ShaderLib.standard;
    	this.uni = THREE.UniformsUtils.merge( [ phong.uniforms, customUni ] );

    	let mat = new THREE.ShaderMaterial( {
    		uniforms: this.uni,
    		vertexShader: vert,
    		fragmentShader: frag,
    		lights: true,
    		flatShading: true,
    		// depthTest: false,
    	} );

    	let obj = new THREE.Mesh( geo, mat );
    	obj.matrixAutoUpdate = false;
    	obj.updateMatrix();

    	this.add( obj );

    }

    update( deltaTime: number ) {

    	this.time += deltaTime;

    	this.kernels.velocity.uniforms.time.value = this.time;
    	this.kernels.velocity.uniforms.textureVelocity.value = this.velocityData.buffer.texture;
    	this.kernels.velocity.uniforms.texturePosition.value = this.positionData.buffer.texture;

    	this.gcController.compute( this.kernels.velocity, this.velocityData );

    	this.kernels.position.uniforms.textureVelocity.value = this.velocityData.buffer.texture;
    	this.kernels.position.uniforms.texturePosition.value = this.positionData.buffer.texture;
    	this.kernels.position.uniforms.deltaTime.value = deltaTime;

    	this.gcController.compute( this.kernels.position, this.positionData );

    	this.uni.texturePosition.value = this.positionData.buffer.texture;
    	this.uni.textureVelocity.value = this.velocityData.buffer.texture;

    }

    public splash( pos: THREE.Vector3 ) {

    	this.kernels.position.uniforms.eruptionPos.value = pos;
    	this.kernels.position.uniforms.isSplash.value = true;

    }

    public heal() {

    	this.kernels.position.uniforms.isSplash.value = false;

    }


    public dispose() {

    	this.positionData.buffer.dispose();
    	this.velocityData.buffer.dispose();
    	this.gcController.dispose();

    }

}
