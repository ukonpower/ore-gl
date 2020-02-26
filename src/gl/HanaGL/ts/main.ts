import * as ORE from '@ore-three-ts';
import { HanaGLScene } from './HanaGLScene';

class APP{
	private canvas: any;
	private controller: ORE.Controller;
	private scene: HanaGLScene;

	constructor(){
		
		this.canvas = document.querySelector("#canvas");

		this.controller = new ORE.Controller({

			canvas: this.canvas,
			retina: true,

		})

		this.controller.bindScene( new HanaGLScene() );

	}

}

window.addEventListener('load',()=>{
	let app = new APP();
});