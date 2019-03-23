import vert from './shaders/background.vs';
import frag from './shaders/background.fs';

export default class Background{
    constructor(){
        this.obj;
        this.time = 0;
        this.clock = new THREE.Clock();
        this.createMesh();
    }

    createMesh(){
        let geo = new THREE.BufferGeometry();

        let posArray = [];
        let indexArray = [];
        let uvArray = [];

        posArray.push(-1,1,0);
        posArray.push(1,1,0);
        posArray.push(1,-1,0);
        posArray.push(-1,-1,0);

        uvArray.push(0,1);
        uvArray.push(1,1);
        uvArray.push(1,0);
        uvArray.push(0,0);

        indexArray.push(0,2,1,0,3,2)
        
        let pos = new Float32Array(posArray);
        let indices = new Uint32Array(indexArray);
        let uv = new Float32Array(uvArray);

        geo.addAttribute('position', new THREE.BufferAttribute( pos, 3 ) );
        geo.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );
        geo.setIndex(new THREE.BufferAttribute(indices,1));

        this.uni = {
            time:{
                value: 0
            }
        }

        let mat = new THREE.ShaderMaterial({
            uniforms: this.uni,
            fragmentShader: frag,
            vertexShader: vert,
        });
        
        this.obj = new THREE.Mesh(geo,mat);
    }

    update(){
        this.time += this.clock.getDelta();
        this.uni.time.value = this.time;
    }
}