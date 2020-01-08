import vert from './shaders/ring.vs';
import frag from './shaders/ring.fs';
import * as THREE from 'three';

export default class Ring {
    constructor() {
        this.num = 200;
        this.size = 2;

        this.obj;
        this.time = 0;

        this.createVoxel();
    }

    createVoxel() {
        let originBox = new THREE.CylinderBufferGeometry(0.5,0.5,0.1,10,1);
        let geo = new THREE.InstancedBufferGeometry();

        let vertice = originBox.attributes.position.clone();
        geo.addAttribute('position', vertice);

        let normal = originBox.attributes.normal.clone();
        geo.addAttribute('normals', normal);

        let uv = originBox.attributes.normal.clone();
        geo.addAttribute('uv', uv);

        let indices = originBox.index.clone();
        geo.setIndex(indices);

        let num = new THREE.InstancedBufferAttribute(new Float32Array(this.num * 1), 1, false, 1);

        for (let i = 0; i < this.num; i++) {
            num.setX(i, i); 
        }

        geo.addAttribute('num', num);

        let cUni = {
            time: {
                value: 0
            },
            res:{
                value: this.num
            }
        }

        this.uni = THREE.UniformsUtils.merge([THREE.ShaderLib.standard.uniforms, cUni]);
        this.uni.roughness.value = 0.5;

        let mat = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: this.uni,
            flatShading: true,
            lights: true
        })

        this.obj = new THREE.Mesh(geo, mat);
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.uni.time.value = this.time;
    }
}