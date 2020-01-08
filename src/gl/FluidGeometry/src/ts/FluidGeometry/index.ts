import vert from './shaders/fluidGeometry.vs';
import frag from './shaders/fluidGeometry.fs';

import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { StableFluids } from '../StableFluids';

export default class FluidGeometry extends THREE.Object3D{

    private uni: any;
    private resolution: THREE.Vector2;
    private num:number;
    private fluid: StableFluids;
    private renderer: THREE.WebGLRenderer;

    private memPos: THREE.Vector2;

    public mouseVertRotator: ORE.MouseVertexRotator;

    constructor(  renderer: THREE.WebGLRenderer ) {
        super();
        this.renderer = renderer;
        this.resolution = new THREE.Vector2( 512,512 );
        this.init();
    }

    init() {

        this.fluid = new StableFluids(  this.renderer, new THREE.Vector2(  512, 512  )  );
        this.fluid.parameter.viscosity = 1.0;
        this.fluid.setPointer( new THREE.Vector2( 0, 0 ), new THREE.Vector2( 0, 0 ));

        let originBox = new THREE.PlaneBufferGeometry( 1.0,1.0 );
        let geo = new THREE.InstancedBufferGeometry();

        let vertice = ( originBox.attributes.position as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'position', vertice );

        let normal = ( originBox.attributes.normal as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'normals', normal );

        let uv = ( originBox.attributes.uv as THREE.BufferAttribute ).clone();
        geo.addAttribute( 'uv', uv );

        let indices = originBox.index.clone();
        geo.setIndex( indices );

        this.num = this.resolution.x * this.resolution.y;

        let offsetPos = new THREE.InstancedBufferAttribute( new Float32Array( this.num * 3 ), 3, false );
        let offsetUV = new THREE.InstancedBufferAttribute( new Float32Array( this.num * 2 ), 2, false );

        let num = new THREE.InstancedBufferAttribute( new Float32Array( this.num ), 1, false, 1 );

        for( let i = 0; i < this.resolution.x; i++ ){
            
            for( let j = 0; j < this.resolution.y; j++ ){

                offsetUV.setXY( i * this.resolution.x + j, j / this.resolution.x, i / this.resolution.y );
                offsetPos.setXYZ( i * this.resolution.x + j, (j - this.resolution.x / 2) / this.resolution.x, ( i - this.resolution.y / 2 ) / this.resolution.y, 0.0 );

            }
        }

        geo.addAttribute( 'offsetPos', offsetPos );
        geo.addAttribute( 'offsetUV', offsetUV );
        geo.addAttribute( 'num', num );

        let cUni = {
            time: {
                value: 0
            },
            all: {
                value: this.num
            },
            col: {
                value: null
            },
            fluid: {
                vlaue: this.fluid.getTexture()
            }
        }

        this.uni = THREE.UniformsUtils.merge( [THREE.ShaderLib.standard.uniforms, cUni] );
        this.uni.roughness.value = 0.8;

        let mat = new THREE.ShaderMaterial( {
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: this.uni,
            flatShading: true,
            lights: true,
            side: THREE.DoubleSide
        } )

        let some = new THREE.Mesh( geo, mat )

        this.mouseVertRotator = new ORE.MouseVertexRotator( some,this.uni );
        this.add( some );
        
    }

    update( time: number ) {

        this.fluid.update(  0  );
        this.uni.time.value = time;
        this.uni.fluid.value = this.fluid.getTexture();
        this.mouseVertRotator.update();

    }

    public setPointer(  pos: THREE.Vector2, vec: THREE.Vector2  ){
    
        if( this.memPos ){
            
            this.fluid.setPointer(  this.memPos.add( new THREE.Vector2().subVectors( this.memPos, pos).multiplyScalar(1.0)) , vec  );

        }

        this.memPos = pos;
    
    }
}