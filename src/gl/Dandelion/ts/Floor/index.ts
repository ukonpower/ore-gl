import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import vert from './shaders/floor.vs';
import frag from './shaders/floor.fs';

export default class Floor extends THREE.Object3D{

    private shapes: number;
    private loop: number;
    private space: number;
    private uni: ORE.Uniforms;

    constructor(){

        super();

        let geo = new THREE.CylinderGeometry( 1, 1, 0.2, 30);
        let mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color( 0xFFFFFF )
        });
        let mesh = new THREE.Mesh( geo, mat );

        this.add( mesh );

    }

    update( time: number ){

        // this.uni.time.value = time;
    
    }
}