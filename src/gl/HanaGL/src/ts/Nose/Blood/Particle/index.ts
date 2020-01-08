import * as THREE from 'three';
import * as ORE from 'ore-three-ts'

import comShaderPosition from './shaders/computePosition.fs';
import comShaderVelosity from './shaders/computeVelocity.fs';

import frag from './shaders/particle.fs';
import complexVert from './shaders/complexParticle.vs';
import { GPUComputationKernel,GPUComputationController,GPUcomputationData } from '../../../GPUComputationController';

declare interface Kernels{
    position: GPUComputationKernel,
    velocity: GPUComputationKernel
}

export class BloodParticle extends THREE.Object3D{
    
    private renderer: THREE.WebGLRenderer;

    private gcController: GPUComputationController;
    private kernels: Kernels;
    private positionData: GPUcomputationData;
    private velocityData: GPUcomputationData;
    
    private num:number;
	private pointUniforms: ORE.Uniforms;
	
	private time: number = 0;
	private complex: boolean;

    constructor( renderer :THREE.WebGLRenderer, num : number ) {
        
        super();
		
        this.renderer = renderer;
        this.num = num;

        this.gcController = new GPUComputationController( this.renderer, new THREE.Vector2( this.num, this.num ));
	
		this.complex = this.gcController.isSupported;

		if( this.complex ){

			//create kernels
			this.kernels = {
				position: this.gcController.createKernel( comShaderPosition ),
				velocity: this.gcController.createKernel( comShaderVelosity )
			}

			//create data
			this.positionData = this.gcController.createData({
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
			});
			this.velocityData = this.gcController.createData({
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
			});
			
			//set uniforms
			this.kernels.velocity.uniforms.texturePosition = { value: null };
			this.kernels.velocity.uniforms.textureVelocity = { value: null };
			this.kernels.velocity.uniforms.time = { value: 0 };
			this.kernels.velocity.uniforms.seed = { value: Math.random() * 1000.0 };
			
			this.kernels.position.uniforms.texturePosition = { value: null };
			this.kernels.position.uniforms.textureVelocity = { value: null };
			this.kernels.position.uniforms.deltaTime = { value: 0 };
			this.kernels.position.uniforms.eruptionPos = { value: new THREE.Vector3( 0, 0, 0 ) }
			this.kernels.position.uniforms.isSplash = { value: new THREE.Vector3( 0, 0, 0 ) }

			this.createComplexParticle();

		}

	}

    createComplexParticle() {
        
        let geo = new THREE.BufferGeometry();

		let computeCoord = [];
		let positionArray = [];

		for( let i = 0; i < this.num; i++ ){

			for( let j = 0; j < this.num; j++ ){

				computeCoord.push( j, i );
				positionArray.push( 0, 0, 0 );

			}

		}
		
		geo.addAttribute( 'computeCoord', new THREE.BufferAttribute( new Float32Array( computeCoord ), 2 ) );
		geo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positionArray ), 3 ) );
		
		this.pointUniforms = {
			texturePosition:{
				value: null
			},
			textureVelocity:{
				value: null
			},
			windowSizeY: {
				value: window.innerHeight * this.renderer.getPixelRatio()
			},
			num: {
				value: this.num - 1
			}
		}

        let mat = new THREE.ShaderMaterial( {
            vertexShader: complexVert,
            fragmentShader: frag,
			uniforms: this.pointUniforms,
			transparent: true,
			depthTest: true,
			// blending: THREE.AdditiveBlending
        } );

		let obj = new THREE.Points( geo, mat );
		obj.frustumCulled = false;
        this.add( obj );
    
	}

    update( deltaTime: number ) {

		this.time += deltaTime;

		if( this.complex ){

			this.kernels.velocity.uniforms.texturePosition.value = this.positionData.buffer.texture;
			this.kernels.velocity.uniforms.textureVelocity.value = this.velocityData.buffer.texture;
			this.kernels.velocity.uniforms.time.value = this.time;
			
			this.gcController.compute( this.kernels.velocity, this.velocityData );

			this.kernels.position.uniforms.texturePosition.value = this.positionData.buffer.texture;
			this.kernels.position.uniforms.textureVelocity.value = this.velocityData.buffer.texture;
			this.kernels.position.uniforms.deltaTime.value = deltaTime;

			this.gcController.compute( this.kernels.position, this.positionData );
			
			this.pointUniforms.texturePosition.value = this.positionData.buffer.texture;
			this.pointUniforms.textureVelocity.value = this.velocityData.buffer.texture;
		
		}else{

			this.pointUniforms.time.value = this.time;

		}
		
	}

	public splash( pos: THREE.Vector3 ){

		this.kernels.position.uniforms.eruptionPos.value = pos;
		this.kernels.position.uniforms.isSplash.value = true;

	}

	public heal(){

		this.kernels.position.uniforms.isSplash.value = false;

	}
	
}