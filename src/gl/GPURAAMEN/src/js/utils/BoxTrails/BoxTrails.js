import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';

import vert from './shaders/boxTrails.vs';
import shadowFrag from './shaders/boxTrailsShadow.fs';
import GPUComputationRenderer from '../../plugins/GPUComputationRenderer';

export default class boxTrails{
    constructor(renderer,num,length,lineWidth){
        this.renderer = renderer;

        this.computeRenderer;
        this.num = num;
        this.length = length;
        this.lineWidth = lineWidth;
        this.r = .1;
        this.shapes = 4;
        
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
    
        this.comTexs.position.texture = this.computeRenderer.addVariable("texturePosition",comShaderPosition,initPositionTex);
        this.comTexs.velocity.texture = this.computeRenderer.addVariable("textureVelocity",comShaderVelocity,initVelocityTex);

        this.computeRenderer.setVariableDependencies( this.comTexs.position.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );
        this.comTexs.position.uniforms = this.comTexs.position.texture.material.uniforms;

        this.computeRenderer.setVariableDependencies( this.comTexs.velocity.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );  
        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;
        this.comTexs.velocity.uniforms.time =  { type:"f", value : 0};
        this.comTexs.velocity.uniforms.seed =  { type:"f", value : Math.random() * 100};

        this.computeRenderer.init();
    }

    initPosition(tex){
        var texArray = tex.image.data;
        let range = new THREE.Vector3(3.4,2,3.4);
        for(var i = 0; i < texArray.length; i += this.length * 4){
            let x = Math.random() * range.x - range.x / 2;
            let y = Math.random() * range.y - range.y / 2 + 3;
            let z = Math.random() * range.z - range.z / 2;
            for(let j = 0; j < this.length * 4; j += 4){
                texArray[i + j + 0] = x;
                texArray[i + j + 1] = y;
                texArray[i + j + 2] = z;
                texArray[i + j + 3] = 0.0;
            }
        }
    }

    createTrails(){
        let geo = new THREE.BufferGeometry();

        let posArray = [];
        let indexArray = [];
        let uvArray = []; 

        for(let i = 0; i < this.num; i++){
            for(let j = 0; j < this.length; j++){
                let cNum = i * this.length + j;

                for(let k = 0; k < this.shapes; k++){
                    let rad = Math.PI * 2 / this.shapes * k;
                    let x = Math.cos(rad) * this.r;
                    let y = Math.sin(rad) * this.r;
                    let z = 0;
                    
                    posArray.push(x);
                    posArray.push(y);
                    posArray.push(z);

                    uvArray.push(j / this.length);
                    uvArray.push(i / this.num);

                    if(j > 0){
                        let currentBase = cNum * this.shapes;
                        let underBase = (cNum - 1) * this.shapes;
                        let next = (k + 1) % this.shapes;
                        
                        indexArray.push(currentBase + k);
                        indexArray.push((underBase + next));
                        indexArray.push((currentBase + next));

                        indexArray.push(currentBase + k);
                        indexArray.push(underBase + k);                        
                        indexArray.push((underBase + next));
                    }
                }
            }

            let n = i * this.length;
            indexArray.push(n, n + 2, n + 1, n, n + 3, n + 2);

            n = (i + 1) * this.length * this.shapes - 1;            
            indexArray.push(n, n - 2, n - 1, n, n - 3, n - 2);
        }

        let pos = new Float32Array(posArray);
        let indices = new Uint32Array(indexArray);
        let uv = new Float32Array(uvArray);

        geo.addAttribute('position', new THREE.BufferAttribute( pos, 3 ) );
        geo.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );
        geo.setIndex(new THREE.BufferAttribute(indices,1));

        let stFrag = THREE.ShaderLib.standard;

        let customUni = {
            texturePosition : {value: null},
            textureVelocity : {value: null},
            uvDiff: {value: 1 / this.length},
            lineWidth: {value: this.lineWidth}
        }

        this.uni = THREE.UniformsUtils.merge([stFrag.uniforms, customUni]);
        this.uni.diffuse.value = new THREE.Vector3(1.0,0.8,0.0);
        this.uni.roughness.value = 0.3;
        
        let mat = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: stFrag.fragmentShader,
            uniforms: this.uni,
            lights: true,
            flatShading: true
        });
        
        this.obj = new THREE.Mesh(geo,mat);
        this.obj.castShadow = true;

        this.obj.customDepthMaterial = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: shadowFrag,
            uniforms: mat.uniforms
        });
    }

    update(){
        this.time += this.clock.getDelta();
        this.computeRenderer.compute();
        this.comTexs.velocity.uniforms.time.value = this.time;
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;
        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.velocity.texture).texture;
    }
}