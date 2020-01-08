import vert from './shaders/floor.vs';
import frag from './shaders/floor.fs';

export default class Floor{
    constructor(){
        this.obj;
        this.time = 0;
        this.clock = new THREE.Clock();
        this.shapes = 70;
        this.loop = 30;
        this.space = 1.2;
        this.createGeo();
    }

    createGeo(){
        let geo = new THREE.BufferGeometry();
        let posArray = [];
        for(let i = 0; i < this.loop; i++){
            for(let j = 0; j < i * 5 + 1; j++){
                let rad = Math.PI * 2 / (i * 5 + 1) * j;
                let x = Math.cos(rad) * this.space * i;
                let y = 0;
                let z = Math.sin(rad) * this.space * i;
                
                posArray.push(x);
                posArray.push(y);
                posArray.push(z);
            }
        }

        let pos = new Float32Array(posArray);

        geo.addAttribute('position', new THREE.BufferAttribute( pos, 3 ) );

        this.uni = {
            time: {vaue: 0}
        }
        
        let mat = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: this.uni,
        });
        
        this.obj = new THREE.Points(geo,mat);
    }

    update(){
        this.time += this.clock.getDelta();
        this.uni.time.value = this.time;
    }
}