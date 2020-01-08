import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import fluffVert from './shaders/dandelion.vs';
import fluffFrag from './shaders/dandelion.fs';

import kukiVert from './shaders/kuki.vs';
import leafVert from './shaders/leaf.vs';
import leafFrag from './shaders/leaf.fs';
import tubomiVert from './shaders/tubomi.vs';

import comshaderInfo from './shaders/comShaders/info.fs';
import comShaderPosition from './shaders/comShaders/position.fs';

import { GPUComputationController, GPUComputationKernel, GPUcomputationData } from '../GPUComputationController';

declare interface Kernels{
	info: GPUComputationKernel
	position: GPUComputationKernel;
}

declare interface Datas{
	position: GPUcomputationData;
	info: GPUcomputationData;
}

export class Dandelion extends THREE.Object3D{

	private renderer: THREE.WebGLRenderer;

	private time: number = 0;

	private breath: number = 0.0;

	//gpgpu
	private gcController: GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;
	private initPositionTex: THREE.DataTexture;
	private computeResolution: THREE.Vector2;

	//fluff mesh
	private fluffUni: ORE.Uniforms;
	private num: number;

	private kukiUni: ORE.Uniforms;
	private leafUni: ORE.Uniforms;
	private tubomiUni: ORE.Uniforms;

	constructor( renderer: THREE.WebGLRenderer ){
		
		super();

		this.renderer = renderer;

		this.createFluff();
		this.createKuki();
		this.createLeaf();
		this.createTubomi();

	}

	private createFluff(){

		this.computeResolution = new THREE.Vector2( 21,31 );
		this.gcController = new GPUComputationController( this.renderer, this.computeResolution );
		
		//position
		let sphere = new THREE.SphereBufferGeometry( 0.5, 30, 20 );
		let spherePos = sphere.attributes.position.array;
		
		this.initPositionTex = this.getInitPosition( spherePos );
		this.num = spherePos.length / 3;

		// いい感じの解像度求めるくん
		// for( let i = 0; i < 1000; i++ ){
		// 	if( this.num / i - Math.floor( this.num / i) == 0 ){
		// 		console.log(i, this.num / i);
		// 	}
		// }

		//kernels & datas
		this.kernels = {
			info: this.gcController.createKernel( comshaderInfo ),
			position: this.gcController.createKernel( comShaderPosition ),
		}

		this.datas = {
			info: this.gcController.createData({
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter
			}),
			
			position: this.gcController.createData( this.initPositionTex, {
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter
			}),
		}

		//set compute uniforms
		this.kernels.info.uniforms.time = { value: 0 };
		this.kernels.info.uniforms.deltaTime = { value: 0 };
		this.kernels.info.uniforms.breath = { value: 0 };
		this.kernels.info.uniforms.infoTex = { value: this.datas.info.buffer.texture };
		this.kernels.info.uniforms.positionTex = { value: this.datas.position.buffer.texture };

		this.kernels.position.uniforms.time = { value: 0 };
		this.kernels.position.uniforms.fluffPos = { value: 2.5 };
		this.kernels.position.uniforms.breath = { value: 0.0 };
		this.kernels.position.uniforms.initPositionTex = { value: this.initPositionTex };
		this.kernels.position.uniforms.infoTex = { value: this.datas.info.buffer.texture };
		this.kernels.position.uniforms.positionTex = { value: this.datas.position.buffer.texture };

		let geo = new THREE.InstancedBufferGeometry();
		
		//copy original mesh
		let fluffMesh = new THREE.BoxBufferGeometry( 0.01, 0.5, 0.01, 1, 20 );

        let vertice = ( fluffMesh.attributes.position as THREE.BufferAttribute).clone();
        geo.addAttribute( 'position', vertice );

        let normal = ( fluffMesh.attributes.normal as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'normals', normal );

        let uv = ( fluffMesh.attributes.normal as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'uv', uv );

        let indices = fluffMesh.index.clone();
		geo.setIndex( indices );

        let n = new THREE.InstancedBufferAttribute( new Float32Array(this.num * 1), 1, false, 1 );
        let computeCoord = new THREE.InstancedBufferAttribute( new Float32Array(this.num * 2), 2, false, 1 );
		let offsetPos = new THREE.InstancedBufferAttribute(  new Float32Array(this.num * 3) , 3, false , 1 );
		

        for (let i = 0; i < this.num; i++) {
			n.setX(i, i);
			computeCoord.setXY(i,i % this.computeResolution.x / ( this.computeResolution.x - 1), Math.floor( i / this.computeResolution.x ) / ( this.computeResolution.y - 1))
			
			let x = spherePos[i * 3 + 0];
			let y = spherePos[i * 3 + 1];
			let z = spherePos[i * 3 + 2];

			let rotZ = ( 2.5 - ( y )) * Math.PI;
			let rotY = Math.atan2( x , z );
			
			offsetPos.setXYZ( i, 0.0, rotY, rotZ );

		}

		console.log( offsetPos );
		
		console.log( computeCoord );
		
        geo.addAttribute('num', n);
        geo.addAttribute('computeCoord', computeCoord);
        geo.addAttribute('offsetPos', offsetPos);

        let cUni = {
            time: {
                value: 0
            },
            all: {
                value: this.num
			},
			breath: {
				value: 0
			},
			computeResolution: {
				value: this.computeResolution
			},
			positionTex: {
				value: null
			},
			infoTex:{ 
				value: null
			}
        }

        this.fluffUni = THREE.UniformsUtils.merge( [ THREE.ShaderLib.standard.uniforms, cUni ] );
        this.fluffUni.roughness.value = 0.8;

        let mat = new THREE.ShaderMaterial({
            vertexShader: fluffVert,
            fragmentShader: fluffFrag,
            uniforms: this.fluffUni,
            flatShading: true,
            lights: true,
			side: THREE.DoubleSide,
			transparent: true,
			blending: THREE.NormalBlending
		})

		let fluff = new THREE.Mesh( geo, mat );
		fluff.renderOrder = 20;
		this.add( fluff );

	}

	private createKuki(){

		let cUni = {
			time: { value: 0.0 },
			breath:{ value: 0.0 },
		}

		let baseMat = THREE.ShaderLib.standard;

		this.kukiUni = THREE.UniformsUtils.merge( [ baseMat.uniforms, cUni ] );

		let kukiGeo = new THREE.CylinderGeometry( 0.03, 0.03, 2.5, 5, 30 );

		let kukiMat = new THREE.ShaderMaterial({
			vertexShader: kukiVert,
			fragmentShader: leafFrag,
			uniforms: this.kukiUni,
			lights: true
		});

		this.kukiUni.diffuse.value = new THREE.Color( 0xffffff );
		
		let kuki = new THREE.Mesh( kukiGeo, kukiMat );
		
		this.add( kuki );
		
	}

	private createTubomi(){

		let cUni = {
			time: { value: 0.0 },
			breath:{ value: 0.0 },
		}

		let baseMat = THREE.ShaderLib.standard;

		this.tubomiUni = THREE.UniformsUtils.merge( [ baseMat.uniforms, cUni ] );

		let geo = new THREE.SphereGeometry( 0.10, 10, 10 );
		let mat = new THREE.ShaderMaterial({
			vertexShader: tubomiVert,
			fragmentShader: leafFrag,
			uniforms: this.tubomiUni,
			lights: true,
			flatShading: true,
			side: THREE.DoubleSide
		});

		// this.leafUni.diffuse.value = new THREE.Color( 0x8FBD2D );

		let tubomi = new THREE.Mesh( geo, mat );

		this.add( tubomi );

	}

	private createLeaf(){

		let cUni = {
			time: { value: 0.0 },
			breath:{ value: 0.0 },
		}

		let baseMat = THREE.ShaderLib.standard;

		this.leafUni = THREE.UniformsUtils.merge( [ baseMat.uniforms, cUni ] );

		let geo = new THREE.PlaneGeometry( 2, 1, 24, 2 );
		let mat = new THREE.ShaderMaterial({
			vertexShader: leafVert,
			fragmentShader: leafFrag,
			uniforms: this.leafUni,
			lights: true,
			flatShading: true,
			side: THREE.DoubleSide
		});

		// this.leafUni.diffuse.value = new THREE.Color( 0x8FBD2D );

		let leaf = new THREE.Mesh( geo, mat );

		this.add( leaf );

	}

	private getInitPosition( array: any ): THREE.DataTexture{

		let tex = this.gcController.createInitializeTexture();

		console.log(tex.image.data.length / 4);
		
		
		for( let i = 0; i < tex.image.data.length; i +=4 ){

			let diff = Math.floor( i / 4 );

			tex.image.data[i] = array[i - diff];
			tex.image.data[i + 1] = array[i + 1 - diff];
			tex.image.data[i + 2] = array[i + 2 - diff];
			tex.image.data[i + 3] = 0;

		}
		
		return tex;
	}

	public update( deltaTime: number ){

		this.time += deltaTime;
		this.breath *= 0.96;

		this.kernels.info.uniforms.time.value = this.time;
		this.kernels.info.uniforms.deltaTime.value = deltaTime;
		this.kernels.info.uniforms.breath.value = this.breath;
		this.kernels.info.uniforms.positionTex.value = this.datas.position.buffer.texture;
		this.kernels.info.uniforms.infoTex.value = this.datas.info.buffer.texture;
		this.gcController.compute( this.kernels.info, this.datas.info );

		this.kernels.position.uniforms.time.value = this.time;
		this.kernels.position.uniforms.breath.value = this.breath;
		this.kernels.position.uniforms.positionTex.value = this.datas.position.buffer.texture;
		this.kernels.position.uniforms.infoTex.value = this.datas.info.buffer.texture;
		this.gcController.compute( this.kernels.position, this.datas.position );

		this.fluffUni.positionTex.value = this.datas.position.buffer.texture;

		this.fluffUni.time.value = this.time;
		this.fluffUni.breath.value = this.breath;
		this.fluffUni.infoTex.value = this.datas.info.buffer.texture;

		this.kukiUni.time.value = this.time;
		this.kukiUni.breath.value = this.breath;

		this.leafUni.time.value = this.time;

		this.tubomiUni.time.value = this.time;
		this.tubomiUni.breath.value = this.breath;

	}

	public addBreath( breath: number ){

		this.breath += breath;

	}


}