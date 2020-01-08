import * as ORE from './utils/ore-three/';
import MainScene from './MainScene';
import * as THREE from 'three';

class APP{
    constructor(){
        this.canvas = document.querySelector("#canvas");
        this.controller = new ORE.Controller(this.canvas,true);
        this.oreScene = new MainScene(this.controller.renderer);
        this.controller.setScene(this.oreScene);
    }
}
window.addEventListener('load',()=>{
    let app = new APP();
})