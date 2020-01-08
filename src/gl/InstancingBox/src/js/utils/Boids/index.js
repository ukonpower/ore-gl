import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';
import frag from './shaders/fragment.glsl';
import vert from './shaders/vertex.glsl';

import GPUComputationRenderer from '../../plugins/GPUComputationRenderer';

export default class Boids{

    constructor(renderer,range){
        this.renderer = renderer;

        this.computeRenderer;
        this.computeTextureWidth = 85;
        this.numParticle = this.computeTextureWidth * this.computeTextureWidth;

        this.obj;
        this.color = new THREE.Vector3(1,1,1);

        this.time = 0;
        this.clock = new THREE.Clock();
        this.range = range;

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
        this.initParticles();
    }

    initComputeRenderer(){
        this.computeRenderer = new GPUComputationRenderer(this.computeTextureWidth,this.computeTextureWidth,this.renderer);
        
        let initPositionTex = this.computeRenderer.createTexture();
        let initVelocityTex = this.computeRenderer.createTexture();

        this.initPosition(initPositionTex);
        this.initVelocity(initVelocityTex);
    
        this.comTexs.position.texture = this.computeRenderer.addVariable("texturePosition",comShaderPosition,initPositionTex);
        this.comTexs.velocity.texture = this.computeRenderer.addVariable("textureVelocity",comShaderVelocity,initVelocityTex);

        this.computeRenderer.setVariableDependencies( this.comTexs.position.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );
        this.comTexs.position.uniforms = this.comTexs.position.texture.material.uniforms;

        this.computeRenderer.setVariableDependencies( this.comTexs.velocity.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );  
        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;
        this.comTexs.velocity.uniforms.time = { value: 0};

        this.computeRenderer.init();
    }

    update(){
        this.time += this.clock.getDelta();
        this.comTexs.velocity.uniforms.time.value = this.time;
        this.computeRenderer.compute();
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;
        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.velocity.texture).texture;
    }

    initPosition(tex){
        var texArray = tex.image.data;
        let range = new THREE.Vector3(4,4,4);
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
            texArray[i + 0] = Math.random() * 1.0 - 0.5;
            texArray[i + 1] = Math.random() * 1.0 - 0.5;
            texArray[i + 2] = Math.random() * 1.0 - 0.5;
        }
    }

    initParticles(){
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
            textureVelocity : {value: null},
            textureTime : {value : null},
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