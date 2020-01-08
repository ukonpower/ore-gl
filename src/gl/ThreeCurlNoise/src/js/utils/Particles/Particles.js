import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';
import frag from './shaders/fragment.glsl';
import vert from './shaders/vertex.glsl';

import GPUComputationRenderer from '../../plugins/GPUComputationRenderer';

export default class Particles{

    constructor(renderer,color){
        this.renderer = renderer;

        this.computeRenderer;
        this.computeTextureWidth = 128;
        this.numParticle = this.computeTextureWidth * this.computeTextureWidth;
        
        this.obj;
        this.color = color;

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
        this.createParticleObj();
    }

    initComputeRenderer(){
        //computeRendererの初期化
        this.computeRenderer = new GPUComputationRenderer(this.computeTextureWidth,this.computeTextureWidth,this.renderer);
        
        //テクスチャを作成
        let initPositionTex = this.computeRenderer.createTexture();
        let initVelocityTex = this.computeRenderer.createTexture();

        //各テクスチャを初期化
        this.initPosition(initPositionTex);
        this.initVelocity(initVelocityTex);

        //computeRendererに各テクスチャとそれに対応するシェーダーを登録する
        this.comTexs.position.texture = this.computeRenderer.addVariable("texturePosition",comShaderPosition,initPositionTex);
        this.comTexs.velocity.texture = this.computeRenderer.addVariable("textureVelocity",comShaderVelocity,initVelocityTex);

        //uniformを登録
        this.computeRenderer.setVariableDependencies( this.comTexs.position.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );
        this.comTexs.position.uniforms = this.comTexs.position.texture.material.uniforms;
        this.comTexs.position.uniforms.time =  { type:"v3", value : this.time};

        this.computeRenderer.setVariableDependencies( this.comTexs.velocity.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );  
        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;

        this.computeRenderer.init();
    }

    initPosition(tex){
        var texArray = tex.image.data;
        let range = new THREE.Vector3(1,1,1);
        for(var i = 0; i < texArray.length; i +=4){
            texArray[i + 0] = Math.random() * range.x - range.x / 2;
            texArray[i + 1] = Math.random() * range.y - range.y / 2;
            texArray[i + 2] = Math.random() * range.z - range.z / 2;
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

    update(){
        this.time += this.clock.getDelta();

        //computeRendererを走らせる
        this.computeRenderer.compute();

        //パーティクルオブジェクトに送るテクスチャを更新
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;
    }

    createParticleObj(){
        let geo = new THREE.BufferGeometry();

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
        geo.addAttribute('position', new THREE.BufferAttribute( pArray, 3 ) );
        geo.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );

        this.uni = {
            texturePosition : {value: null},
            cameraConstant: { value: 4.0},
            color:{ value: this.color},
        }

        let mat = new THREE.ShaderMaterial({
            uniforms: this.uni,
            vertexShader: vert,
            fragmentShader: frag,
            transparent: true,
        });

        this.obj = new THREE.Points(geo,mat);
        this.obj.matrixAutoUpdate = false;
        this.obj.updateMatrix();
    }
}