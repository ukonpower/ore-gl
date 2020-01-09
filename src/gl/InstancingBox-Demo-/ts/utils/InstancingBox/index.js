import vert from './shaders/voxel.vs';

export default class InstansingBox {
    constructor(num) {
        this.num = num;
        this.space = 1.5;

        this.obj;
        this.time = 0;
        this.clock = new THREE.Clock();

        this.createVoxel();
    }

    createVoxel() {
        let originBox = new THREE.BoxBufferGeometry(0.3,0.3,0.3);
        let geo = new THREE.InstancedBufferGeometry();

        let vertice = originBox.attributes.position.clone();
        geo.setAttribute('position', vertice);

        let normal = originBox.attributes.normal.clone();
        geo.setAttribute('normals', normal);

        let uv = originBox.attributes.normal.clone();
        geo.setAttribute('uv', uv);

        let indices = originBox.index.clone();
        geo.setIndex(indices);
 
        let offsetPos = new THREE.InstancedBufferAttribute(new Float32Array(this.num * 3), 3, false, );
        let num = new THREE.InstancedBufferAttribute(new Float32Array(this.num * 1), 1, false, 1);

        for (let i = 0; i < this.num; i++) {
            let range = 5;
            let x = Math.random() * range - range / 2;
            let y = Math.random() * range - range / 2;
            let z = Math.random() * range - range / 2;
            offsetPos.setXYZ(i,x,y,z);
            num.setX(i,i);
        }

        geo.setAttribute('offsetPos', offsetPos);
        geo.setAttribute('num', num);

        let cUni = {
            time: {
                value: 0
            }
        }

        this.uni = THREE.UniformsUtils.merge([THREE.ShaderLib.standard.uniforms,cUni]);
        this.uni.diffuse.value = new THREE.Vector3(1.0,1.0,1.0);
        this.uni.roughness.value = 0.1;

        let mat = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: THREE.ShaderLib.standard.fragmentShader,
            uniforms: this.uni,
            flatShading: true,
            lights: true
        })

        this.obj = new THREE.Mesh(geo, mat);
    }

    update() {
        this.time += this.clock.getDelta();
        this.uni.time.value = this.time;
    }
}