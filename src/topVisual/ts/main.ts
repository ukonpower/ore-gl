import * as ORE from '@ore-three-ts';
import { TopScene } from './TopScene';

class APP {

	private canvas: any;
	private controller: ORE.Controller;
	private scene: TopScene;

	constructor() {

		this.canvas = document.querySelector( "#canvas" );

		this.controller = new ORE.Controller( {
			canvas: this.canvas,
			retina: true
		} );

		this.scene = new TopScene();
		this.controller.bindScene( this.scene );

	}

}

window.addEventListener( 'DOMContentLoaded', ()=>{

	let app = new APP();

} );
