import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';

import vert from './shaders/voxel.vs';
import frag from './shaders/voxel.fs';

import shadowFrag from './shaders/voxelShadow.fs';

import GPUComputationRenderer from '../../plugins/GPUComputationRenderer';

export default class Voxel {
    constructor(renderer, width, height, dist, res) {
        this.renderer = renderer;

        this.width = width;
        this.height = height;
        this.dist = dist;
        this.res = res;

        this.obj;
        this.time = 0;
        this.clock = new THREE.Clock();
        this.shapes = 4;
        this.size = 0.1;

        this.comTexs = {
            position: {
                texture: null,
                uniforms: null,
            },
            velocity: {
                texture: null,
                uniforms: null,
            }
        }

        this.initComputeRenderer();
        this.createVoxel();
    }

    initComputeRenderer() {
        this.computeRenderer = new GPUComputationRenderer(this.res * this.res, this.res, this.renderer);

        let initPosTex = this.computeRenderer.createTexture();
        let initVelocityTex = this.computeRenderer.createTexture();

        this.initPos(initPosTex);

        this.comTexs.position.texture = this.computeRenderer.addVariable("texturePosition", comShaderPosition, initPosTex);
        this.comTexs.velocity.texture = this.computeRenderer.addVariable("textureVelocity", comShaderVelocity, initVelocityTex);

        this.computeRenderer.setVariableDependencies(this.comTexs.position.texture, [this.comTexs.position.texture,this.comTexs.velocity.texture]);
        this.computeRenderer.setVariableDependencies(this.comTexs.velocity.texture, [this.comTexs.position.texture,this.comTexs.velocity.texture]);
        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;
        this.comTexs.velocity.uniforms.time = {
            type: "f",
            value: 0
        };
        this.comTexs.velocity.uniforms.res = {
            type: "i",
            value: this.res
        };
        this.comTexs.velocity.uniforms.point = {
            type: "v3",
            value: new THREE.Vector3(0, 0, 0)
        };

        this.computeRenderer.init();
    }

    initPos(tex) {
        var texArray = tex.image.data;
        let range = 4.0;
        for (let i = 0; i < this.res; i++) {
            for (let j = 0; j < this.res; j++) {
                for (let k = 0; k < this.res; k++) {
                    let ind = (i * this.res * this.res + j * this.res + k) * 4;
                    let width = this.res * this.size;
                    // let x = this.size * i - width / 2;
                    // let y = this.size * j - width / 2;
                    // let z = this.size * k - width / 2;

                    let x = (Math.random() - 0.5) * range;
                    let y = (Math.random() - 0.5) * range;
                    let z = (Math.random() - 0.5) * range;
                    
                    texArray[ind + 0] = x;
                    texArray[ind + 1] = y;
                    texArray[ind + 2] = z;
                    texArray[ind + 3] = 1.0;
                }
            }
        }
    }

    createVoxel() {
        let geo = new THREE.BufferGeometry();

        let posArray = [];
        let indexArray = [];
        let uvArray = [];
        for (let i = 0; i < this.res; i++) {
            for (let j = 0; j < this.res; j++) {
                for (let k = 0; k < this.res; k++) {
                    for (let h = 0; h < 2; h++) {
                        let cNum = i * this.res * this.res * 2 + j * this.res * 2 + k * 2 + h;
                        for (let r = 0; r < this.shapes; r++) {
                            let rad = Math.PI * 2 / this.shapes * r + Math.PI / 4;
                            let x = Math.cos(rad) * this.size * 0.5 * Math.SQRT2;
                            let y = (h * this.size) - this.size / 2;
                            let z = Math.sin(rad) * this.size * 0.5 * Math.SQRT2;

                            posArray.push(x);
                            posArray.push(y);
                            posArray.push(z);

                            uvArray.push((i * this.res + j) / (this.res * this.res));
                            uvArray.push(k / this.res);

                            if (h > 0) {
                                let currentBase = cNum * this.shapes;
                                let underBase = (cNum - 1) * this.shapes;
                                let next = (r + 1) % this.shapes;

                                indexArray.push((underBase + next));
                                indexArray.push(currentBase + r);
                                indexArray.push((currentBase + next));

                                indexArray.push(underBase + r);
                                indexArray.push(currentBase + r);
                                indexArray.push((underBase + next));
                            }
                        }
                    }

                    let n = (i * this.res * this.res + j * this.res + k) * this.shapes * 2;

                    indexArray.push(n, n + 1, n + 2, n, n + 2, n + 3);

                    n += 4;
                    indexArray.push(n, n + 2, n + 1, n, n + 3, n + 2);
                }
            }
        }

        let pos = new Float32Array(posArray);
        let indices = new Uint32Array(indexArray);
        let uv = new Float32Array(uvArray);

        geo.addAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.addAttribute('uv', new THREE.BufferAttribute(uv, 2));
        geo.setIndex(new THREE.BufferAttribute(indices, 1));

        this.uni = {
            textureVelocity: {
                value: null
            },
            texturePosition: {
                value: null
            },
            time: {
                value: 0
            }
        }

        let mat = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: this.uni,
            flatShading: true,
            transparent: true,
            blending: THREE.NormalBlending,
        });

        this.obj = new THREE.Line(geo, mat);
        this.obj.castShadow = true;

        this.obj.customDepthMaterial = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: shadowFrag,
            uniforms: mat.uniforms
        });
    }

    setPoint(p) {
        console.log(p);
        
        this.comTexs.velocity.uniforms.point.value = p;
    }

    update() {
        this.time += this.clock.getDelta();
        this.comTexs.velocity.uniforms.time.value = this.time;
        
        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.velocity.texture).texture;
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;
        this.uni.time.value = this.time;
        this.computeRenderer.compute();
    }
}