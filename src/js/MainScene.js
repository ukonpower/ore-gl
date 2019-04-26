import BaseScene from './utils/BaseScene';
import Background from './utils/Background';
import MainObj from './utils/MainObj';
import Fish from './utils/Fish';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
        window.addEventListener('scroll',this.onScroll.bind(this));
        document.querySelector(".loading").classList.add("hide");
        document.querySelectorAll('.title').forEach((elm)=>{
            elm.classList.add('v');
        })
    }

    init() {
        this.time = Math.random() * 100;
        this.clock = new THREE.Clock();

        this.camera.position.set(0,0,9);

        this.cyOffset = 0;

        this.aLight = new THREE.AmbientLight();
        this.aLight.intensity = 0.4;
        this.scene.add(this.aLight);

        this.dLight = new THREE.DirectionalLight();
        this.dLight.intensity = 0.7;
        this.dLight.position.set(0.1,10,-2);
        this.scene.add(this.dLight);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0xff0044);
        this.light.position.set(20,0,5);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.light = new THREE.PointLight();
        this.light.color = new THREE.Color(0x4400ff);
        this.light.position.set(-10,0,5);
        this.light.intensity = 1;
        this.scene.add(this.light);

        this.bg = new Background();
        this.bg.obj.frustumCulled = false;
        this.scene.add(this.bg.obj);

        this.mobj = new MainObj();
        this.scene.add(this.mobj.obj);
        this.mobj.obj.position.set(3,0,0);

        this.fish = new Fish(this.renderer,200,50);
        this.fish.setAvoidObje(this.mobj.obj.position,3.5);
        this.fish.setCamY(this.camera.position.y);
        this.fish.obj.frustumCulled = false;
        this.scene.add(this.fish.obj);

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector3(0,0,0);

        window.scene = this.scene;
        this.onScroll();
    }

    animate() {
        this.time += this.clock.getDelta();

        if(this.bg){
            this.bg.update(this.time);
        }

        if(this.mobj){
            this.mobj.update(this.time);
        }

        if(this.fish){
            this.fish.update(this.time);
        }

        this.renderer.render(this.scene,this.camera);
    }

    ray(cursor){
        var halfWidth = innerWidth / 2;
        var halfHeight = innerHeight / 2;
        var pos = new THREE.Vector2((cursor.x - halfWidth) / halfWidth, (cursor.y - halfHeight) / halfHeight);
        pos.y *= -1;

        this.raycaster.setFromCamera(pos, this.camera); 
        var intersects = this.raycaster.intersectObjects([this.plane]);
        if(intersects.length > 0){
            let point = intersects[0].point;   
            return point;
        }else{
            return null;
        }
    }

    Resize(width,height){
        let aspect = width / height;
        if(aspect < 1){
            this.camera.position.x = 1;
            this.camera.position.z = 13;
            this.cyOffset = -1.0;
        }else{
            this.camera.position.x = 0;
            this.camera.position.z = 10;
            this.cyOffset = 0;
        }
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.camera.position.y = window.pageYOffset * -0.004 + this.cyOffset;
    }

    onScroll(){
        let offset = window.pageYOffset;
        if(this.camera){
            this.camera.position.y = offset * -0.004 + this.cyOffset;
        }

        this.fish.setCamY(this.camera.position.y);
        
        document.querySelectorAll('.content-list-item').forEach((elm)=>{
            const top = elm.getBoundingClientRect().top + window.pageYOffset;
            if(top < window.pageYOffset + window.innerHeight / 5 * 4){
                elm.classList.add('v');
            }
        })

    }

    onTouchStart(c,e){
    }

    onTouchMove(c,e){
    }

    onTouchEnd(c,e){       
    }
}