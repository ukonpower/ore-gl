import comShaderPosition from '../shaders/computePosition.glsl';
import comShaderVelocity from '../shaders/computeVelocity.glsl';
import comShaderTime from '../shaders/computeTime.glsl';
import frag from '../shaders/fragment.glsl';
import vert from '../shaders/vertex.glsl';
import GPUComputationRenderer from '../utils/libs/GPUComputationRenderer';
import Timer from '../utils/Timer.js';

import * as THREE from 'three';

export default class Particle{

    constructor(renderer,color){
        this.renderer = renderer;
        this.computeTextureWidth = 128;
        this.numParticle = this.computeTextureWidth * this.computeTextureWidth;
        this.obj;
        this.geo;
        this.mat;
        this.uni;
        this.computeRenderer;

        this.posTexture;
        this.velTexture;
        this.timeTexture;

        this.timeUniforms;
        this.posUniforms;
        this.velUniforms;

        this.startPos = new THREE.Vector3(0,1,0);
        this.goalPos = new THREE.Vector3(0,0,0);

        this.time = 0;
        this.timer = new Timer();

        this.color = color;

        this.initComputeRenderer();
        this.initParticles();
    }

    initComputeRenderer(){
        this.computeRenderer = new GPUComputationRenderer(this.computeTextureWidth,this.computeTextureWidth,this.renderer);
        
         //初期化用のテクスチャ
        var initPositionTex = this.computeRenderer.createTexture();
        var initVelocityTex = this.computeRenderer.createTexture();
        var initTimeTex = this.computeRenderer.createTexture();

        this.initPosition(initPositionTex);
        this.initVelocity(initVelocityTex);
        this.initTime(initTimeTex);

    
        this.posTexture = this.computeRenderer.addVariable("texturePosition",comShaderPosition,initPositionTex);
        this.velTexture = this.computeRenderer.addVariable("textureVelocity",comShaderVelocity,initVelocityTex);
        this.timeTexture = this.computeRenderer.addVariable("textureTime",comShaderTime,initTimeTex);

        
        this.computeRenderer.setVariableDependencies( this.timeTexture, [ this.posTexture, this.velTexture,this.timeTexture ] );
        this.timeUniforms = this.timeTexture.material.uniforms;
        this.timeUniforms.deltaTime =  { type: "f" , value : 0.0 };

        this.computeRenderer.setVariableDependencies( this.posTexture, [ this.posTexture, this.velTexture,this.timeTexture ] );
        this.posUniforms = this.posTexture.material.uniforms;
        this.posUniforms.start =  { type:"v3", value : this.startPos};
        this.posUniforms.mouse =  { type:"v2" , value : new THREE.Vector2(0,0)};
        this.posUniforms.shot =  { type:"b" , value : false};

        this.computeRenderer.setVariableDependencies( this.velTexture, [ this.posTexture, this.velTexture,this.timeTexture ] );  
        this.velUniforms = this.velTexture.material.uniforms;
        this.velUniforms.mouse =  { type:"v2", value : new THREE.Vector2(0,0)};
        this.velUniforms.start =  { type:"v3", value : this.startPos};
        this.velUniforms.goal =  { type:"v3", value : this.goalPos};
        this.velUniforms.time = { type: "f",value : 0.0 };


        this.computeRenderer.init();
    }

    initTime(tex){
        var texArray = tex.image.data;
        var maxRandom = 2000;
        //ready emmit
        var z = 0.0;
        
        for(var i = 0; i < texArray.length; i +=4){
            //lifetime
            var x = Math.random() * maxRandom;
            //currentTime
            var y = x * (i / 4) / (texArray.length / 4);
            texArray[i + 0] = x;
            texArray[i + 1] = y;
            texArray[i + 2] = z;
            texArray[i + 3] = 0.0;
        }  
    }

    initPosition(tex){
        var texArray = tex.image.data;     
        for(var i = 0; i < texArray.length; i +=4){
            texArray[i + 0] = Math.random() * 20 - 10;
            texArray[i + 1] = Math.random() * 20 - 10;
            texArray[i + 2] = Math.random() * 20 - 10;
            texArray[i + 3] = 0.0;
        }
    }

    initVelocity(tex){
        var texArray = tex.image.data;
        for(var i = 0; i < texArray.length; i +=4){
            texArray[i + 0] = Math.random() * 20 - 10;
            texArray[i + 1] = Math.random() * 20 - 10;
            texArray[i + 2] = Math.random() * 20 - 10;
            texArray[i + 3] = 0;
        }
    }

    initParticles(){
        this.geo = new THREE.BufferGeometry();

        //ジオメトリ初期化用の配列
        var pArray = new Float32Array(this.numParticle * 3);
        for(var i = 0; i < pArray.length; i++){
            pArray[i] = 0;
        }

        //テクスチャ参照用のuvを取得
        var uv = new Float32Array(this.numParticle * 2);
        var p = 0;
        for(var i = 0;i < this.computeTextureWidth; i ++){
            for(var j = 0;j < this.computeTextureWidth; j ++){
                uv[p++] = i / ( this.computeTextureWidth - 1);
                uv[p++] = j / ( this.computeTextureWidth - 1);
            }
        }
        this.geo.addAttribute('position', new THREE.BufferAttribute( pArray, 3 ) );
        this.geo.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );

        //コンピュートシェーダーからのテクスチャを受け取るuniformを設定
        this.uni = {
            texturePosition : {value: null},
            textureVelocity : {value: null},
            textureTime : {value : null},
            cameraConstant: { value: 4.0},
            color:{ value: this.color},
        }

        this.mat = new THREE.ShaderMaterial({
            uniforms: this.uni,
            vertexShader: vert,
            fragmentShader: frag,
            transparent: true,
        });

        this.obj = new THREE.Points(this.geo,this.mat);
        this.obj.matrixAutoUpdate = false;
        this.obj.updateMatrix();
    }

    update(){
        this.time += this.timer.deltaTime * 0.001;
        this.timeUniforms.deltaTime.value = this.timer.deltaTime;
        this.velUniforms.time.value = this.time;
        this.posUniforms.start =  { type:"v3", value : this.startPos};
        this.velUniforms.start =  { type:"v3", value : this.startPos};
        this.velUniforms.goal =  { type:"v3", value : this.goalPos};

        
        this.computeRenderer.compute();
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.posTexture).texture;
        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.velTexture).texture;
        this.uni.textureTime.value = this.computeRenderer.getCurrentRenderTarget(this.timeTexture).texture;
    }



}