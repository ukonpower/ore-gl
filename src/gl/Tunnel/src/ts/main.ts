import * as ORE from 'ore-three-ts';
import { TunnelScene } from './TunnelScene';

class APP{
	private canvas: any;
	private controller: ORE.Controller;

	constructor(){
		
		this.canvas = document.querySelector("#canvas");

		this.controller = new ORE.Controller({

			canvas: this.canvas,
			retina: true,

		})

		this.controller.bindScene( new TunnelScene() );

	}

}

window.addEventListener('load',()=>{
	let app = new APP();
});