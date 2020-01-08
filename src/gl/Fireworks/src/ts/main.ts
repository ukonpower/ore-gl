import * as ORE from 'ore-three-ts';
import { FireworksScene } from './FireworksScene';

class APP{
	private canvas: any;
	private controller: ORE.Controller;

	constructor(){
		
		this.canvas = document.querySelector("#canvas");

		this.controller = new ORE.Controller({

			canvas: this.canvas,
			retina: true,

		})

		this.controller.bindScene( new FireworksScene );

	}

}

window.addEventListener('load',()=>{
	let app = new APP();
});