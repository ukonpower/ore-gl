import BaseScene from './utils/BaseScene';
import Particle from './utils/Particles/Particles';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

import alphaFrag from './shaders/alpha.fs';
import standardVert from './shaders/standard.vs';


export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
    }

    init() {
        this.renderer.setClearColor(0x0000ff,0);
        this.time = 0;
        this.clock = new THREE.Clock();

        this.camCon;
        this.camera.rotateX(-Math.PI / 2);
        this.scene.add(this.camera);
        
        this.particles = new Particle(this.renderer,new THREE.Color(0x8822ff));
        this.scene.add(this.particles.obj);

        this.suzanne;
        this.table;
        this.box;

        this.suzanneRotate = 0;

        // let gHelper = new THREE.GridHelper(100, 100);
        // this.scene.add(gHelper);
        
        this.bg = document.getElementById('bg');
        if(!this.bg.paused){
            console.log("hello");
            
            this.startAnimation();
        }
        this.bg.addEventListener('loadeddata',this.startAnimation.bind(this))
        this.bg.addEventListener('ended',this.videoEnded.bind(this));

        this.mixer;
        this.animations;
        this.action;

        let loader = new THREE.GLTFLoader();
        loader.load('./models/camera.glb', (gltf) => {
            var scene = gltf.scene;
            this.animations = gltf.animations;
            
            this.scene.add(scene);
            this.camCon = this.scene.getObjectByName('CubeCamera');
            this.mixer = new THREE.AnimationMixer(scene);
            this.camCon.add(this.camera);
            this.startAnimation();
        });

        loader.load('./models/objects.glb', (gltf) => {
            var models = gltf.scene;

            this.suzanne = models.getObjectByName('Suzanne');
            this.suzanne.traverse( function ( child ) {
                if ( child.isMesh ) child.material = new THREE.MeshNormalMaterial();
            } );
            this.scene.add(this.suzanne);

            let maskMat = new THREE.ShaderMaterial({
                vertexShader: standardVert,
                fragmentShader: alphaFrag
            });
            // maskMat.wireframe = true;

            this.table = models.getObjectByName('Table');
            this.table.traverse( function ( child ) {
                if ( child.isMesh ) child.material = maskMat;
            } );
            this.scene.add(this.table);

            this.box = models.getObjectByName('Box');
            this.box.traverse( function ( child ) {
                if ( child.isMesh ) child.material = maskMat;
            } );
            this.scene.add(this.box);
        });

        window.scene = this.scene;
    }

    videoEnded(){
        this.bg.currentTime = 0;
        this.startAnimation();
    }

    startAnimation(){
        if(this.mixer){
            this.action = this.mixer.clipAction( this.animations[0],scene);
            this.action.setLoop(THREE.LoopOnce)
            this.action.play();
        }

        if(this.bg.paused){
            this.bg.play();
        }
    }

    animate() {
        this.time += this.clock.getDelta();
        this.particles.update();

        if(this.mixer && this.action){
            let time = this.bg.currentTime + 0.03;
            
            this.mixer.time = time;
            this.action.time = time;
            this.mixer.update(0);
        }

        if(this.suzanne){
            this.suzanne.rotateY(this.suzanneRotate);
            this.suzanneRotate *= 0.9
        }

        this.renderer.render(this.scene,this.camera);
    }

    Resize(width,height){
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    
    onTouchStart(){
    }

    onTouchMove(c){
        this.suzanneRotate += c.deltaX * 0.001;
    }

    onTouchEnd(){

    }

}