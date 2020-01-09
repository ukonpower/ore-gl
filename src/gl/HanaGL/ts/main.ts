import * as ORE from 'ore-three-ts';
import {DandelionScene} from './HanaGLScene';

class APP{
	private canvas: any;
	private controller: ORE.Controller;
	private scene: DandelionScene;

	constructor(){
		
		this.canvas = document.querySelector("#canvas");

		this.controller = new ORE.Controller({

			canvas: this.canvas,
			retina: true,

		})

		this.controller.bindScene( new DandelionScene() );

	}

}

window.addEventListener('load',()=>{
	let app = new APP();
});