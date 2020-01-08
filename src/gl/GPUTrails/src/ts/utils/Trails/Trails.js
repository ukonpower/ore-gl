import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';
import frag from './shaders/trails.fs';
import vert from './shaders/trails.vs';

import GPUComputationRenderer from '../../plugins/GPUComputationRenderer';

export default class Trails{

    constructor(renderer,num,length){
        this.renderer = renderer;

        this.computeRenderer;
        this.num = num;
        this.length = length;
        
        this.obj;

        this.time = 0;
        this.clock = new THREE.Clock();

        this.comTexs = {
            position:{
                texture: null,
                uniforms: null,
            },
            velocity:{
                texture: null,
                uniforms: null,
            },
        }

        this.initComputeRenderer();
        this.createTrails();
    }

    initComputeRenderer(){        
        this.computeRenderer = new GPUComputationRenderer(this.length,this.num,this.renderer);
        
        let initPositionTex = this.computeRenderer.createTexture();
        let initVelocityTex = this.computeRenderer.createTexture();

        this.initPosition(initPositionTex);
        // this.initVelocity(initVelocityTex);
    
        this.comTexs.position.texture = this.computeRenderer.addVariable("texturePosition",comShaderPosition,initPositionTex);
        this.comTexs.velocity.texture = this.computeRenderer.addVariable("textureVelocity",comShaderVelocity,initVelocityTex);

        this.computeRenderer.setVariableDependencies( this.comTexs.position.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );
        this.comTexs.position.uniforms = this.comTexs.position.texture.material.uniforms;

        this.computeRenderer.setVariableDependencies( this.comTexs.velocity.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );  
        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;
        this.comTexs.velocity.uniforms.time =  { type:"f", value : 0};

        this.computeRenderer.init();
    }

    update(){
        this.time += this.clock.getDelta();

        this.computeRenderer.compute();
        this.comTexs.velocity.uniforms.time.value = this.time;
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;
        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.velocity.texture).texture;
    }

    initPosition(tex){
        var texArray = tex.image.data;
        let range = new THREE.Vector3(10,10,10);
        for(var i = 0; i < texArray.length; i += this.length * 4){
            let x = Math.random() * range.x - range.x / 2;
            let y = Math.random() * range.y - range.y / 2;
            let z = Math.random() * range.z - range.z / 2;
            for(let j = 0; j < this.length * 4; j += 4){
                texArray[i + j + 0] = x;
                texArray[i + j + 1] = y;
                texArray[i + j + 2] = z;
                texArray[i + j + 3] = 0.0;
            }
        }
    }

    // initVelocity(tex){
    //     var texArray = tex.image.data;
    //     for(var i = 0; i < texArray.length; i += this.length * 4){
    //         texArray[i + 0] = 0;
    //         texArray[i + 1] = 0;
    //         texArray[i + 2] = 0;
    //         texArray[i + 3] = 0;
    //     }
    // }

    createTrails(){
        let geo = new THREE.BufferGeometry();

        let pArray = new Float32Array(this.num * this.length * 3);
        let indices = new Uint32Array((this.num * this.length - 1) * 3);
        let uv = new Float32Array(this.num * this.length * 2);

        let max = this.length * this.n;

        for(let i = 0; i < this.num; i++){
            for(let j = 0; j < this.length; j++){
                let c = i * this.length + j;
                let n = (c) * 3;
                pArray[n] = 0;
                pArray[n + 1] = 0;
                pArray[n + 2] = 0;

                uv[c * 2] = j / this.length;
                uv[c * 2 + 1] = i / this.num;

                indices[n] = c;
                indices[n + 1] = Math.min(c + 1,i * this.length + this.length - 1);
                indices[n + 2] = Math.min(c + 1,i * this.length + this.length - 1);
            }
        }
        
        geo.addAttribute('position', new THREE.BufferAttribute( pArray, 3 ) );
        geo.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );
        geo.setIndex(new THREE.BufferAttribute(indices,1));

        this.uni = {
            texturePosition : {value: null},
            textureVelocity : {value: null},
        }

        let mat = new THREE.ShaderMaterial({
            uniforms: this.uni,
            vertexShader: vert,
            fragmentShader: frag,
        });
        mat.wireframe = true;

        this.obj = new THREE.Mesh(geo,mat);
        this.obj.matrixAutoUpdate = false;
        this.obj.updateMatrix();
    }
}