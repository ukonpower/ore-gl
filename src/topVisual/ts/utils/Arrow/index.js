import * as THREE from 'three';

import vert from './shaders/mainobj.vs';
import frag from './shaders/mainobj.fs';

export default class Arrow{
    constructor(){
        this.obj;
        this.createMesh();
    }

    createMesh(){
        let geo = new THREE.SphereGeometry(1,50,50);

        let customUni = {
            time:{
                value: 0
            },
            pointer:{
                value: new THREE.Vector3(0,0,0)
            }
        }

        let std = THREE.ShaderLib.standard;
        this.uni = THREE.UniformsUtils.merge([customUni,std.uniforms]);
        
        let mat = new THREE.ShaderMaterial({
            uniforms: this.uni,
            fragmentShader: frag,
            vertexShader: vert,
            lights: true,
        });

        mat.uniforms.diffuse.value = new THREE.Vector3(1.0,1.0,1.0);
        mat.uniforms.roughness.value = 0.3;
        mat.uniforms.metalness.value = 0.1;
        
        this.obj = new THREE.Mesh(geo,mat);
        this.obj.scale.set(3,3,3);
        this.obj.receiveShadow = true;
    }

    update(time){
        this.uni.time.value = time;
    }
}