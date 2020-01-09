import * as THREE from 'three';
import Cursor from './Cursor';

export default class ThreeGraphic{
        constructor(){
        this.currentScene;
        this.canvas = document.querySelector('#main_graphic');
        this.canvas.style.height = innerHeight;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        this.renderer.setPixelRatio(1);

        this.canvas.appendChild(this.renderer.domElement);
        this.canvas.querySelector('canvas').style.position = 'absolute';

        this.cursor = new Cursor();
    
        window.addEventListener('orientationchange',this.onOrientationDevice.bind(this));
        window.addEventListener('resize',this.onWindowResize.bind(this));
        
        this.userAgent = navigator.userAgent;


        this.init();
    }

    init(){        
        if(this.userAgent.indexOf("iPhone") >= 0 || this.userAgent.indexOf("iPad") >= 0 || this.userAgent.indexOf("Android") >= 0){    
            window.addEventListener('touchstart',this.onTouchStart.bind(this));
            window.addEventListener('touchmove',this.onTouchMove.bind(this),{passive: false});
            window.addEventListener('touchend',this.onTouchEnd.bind(this));
        }else{
            window.addEventListener('mousedown',this.onTouchStart.bind(this));
            window.addEventListener('mousemove',this.onTouchMove.bind(this));
            window.addEventListener('mouseup',this.onTouchEnd.bind(this));
        }
        
        this.Update();
    }
    
    Update(){
        requestAnimationFrame(this.Update.bind(this));
        if(!this.currentScene){
            return;
        }
        // this.renderer.render(this.currentScene.scene,this.currentScene.camera);
        this.currentScene.Update();
    }

    setScene(scene){
        console.log('setScene');
        this.currentScene = scene;
    }

    onWindowResize(){
        if(this.userAgent.indexOf("iPhone") >= 0 || this.userAgent.indexOf("iPad") >= 0 || this.userAgent.indexOf("Android") >= 0){
            return;
        }
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.renderer.setSize(width,height);
        this.currentScene.Resize(width,height);
    }

    onOrientationDevice(){
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.renderer.setSize(height,width);
        this.currentScene.Resize(height,width);
    }

    onTouchStart(event){
        this.cursor.TouchStart(event);
        this.currentScene.onTouchStart(this.cursor);
    }

    onTouchMove(event){
        event.preventDefault();
        this.cursor.TouchMove(event);
        this.currentScene.onTouchMove(this.cursor);
    }

    onTouchEnd(event){
        this.cursor.TouchEnd();
        this.currentScene.onTouchEnd(this.cursor);
    }
}