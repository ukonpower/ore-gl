import vert from './shaders/sumo.vs';
import frag from './shaders/sumo.fs';
import * as THREE from 'three';

export default class Sumo {
    constructor() {
        this.res = 30;
        this.num = this.res * this.res;
        this.size = 2;

        this.obj;
        this.time = 0;

        this.createVoxel();
    }

    createVoxel() {
        let s = this.size / this.res / 2 * 1;
        let originBox = new THREE.CylinderBufferGeometry(s,s,2, 10,30);
        // let originBox = new THREE.SphereBufferGeometry(s,20,10,10);
        let geo = new THREE.InstancedBufferGeometry();

        let vertice = originBox.attributes.position.clone();
        geo.addAttribute('position', vertice);

        let normal = originBox.attributes.normal.clone();
        geo.addAttribute('normals', normal);

        let uv = originBox.attributes.normal.clone();
        geo.addAttribute('uv', uv);

        let indices = originBox.index.clone();
        geo.setIndex(indices);

        let offsetPos = new THREE.InstancedBufferAttribute(new Float32Array(this.num * 3), 3, false, );
        let num = new THREE.InstancedBufferAttribute(new Float32Array(this.num * 1), 1, false, 1);


        this.space = this.size / this.res;
        for (let i = 0; i < this.num; i++) {
            let x = this.space * (i % (this.res)) - this.size / 2 + this.space / 2;
            let y = 0;
            let z = this.space * Math.floor((i / (this.res))) - this.size / 2 + this.space / 2;

            offsetPos.setXYZ(i, x, y, z);
            num.setX(i, i);
        }

        geo.addAttribute('offsetPos', offsetPos);
        geo.addAttribute('num', num);

        let cUni = {
            time: {
                value: 0
            }
        }

        this.uni = THREE.UniformsUtils.merge([THREE.ShaderLib.standard.uniforms, cUni]);
        this.uni.diffuse.value = new THREE.Vector3(1.0, 1.0, 1.0);
        this.uni.roughness.value = 0.7;

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