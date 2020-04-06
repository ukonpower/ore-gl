import * as ORE from '@ore-three-ts';
import { ComplexScene } from './ComplexScene';

class APP {

	private canvas: any;
	private controller: ORE.Controller;
	private scene: ComplexScene;

	constructor() {

		this.canvas = document.querySelector( "#canvas" );

		this.controller = new ORE.Controller( {

			canvas: this.canvas,
			retina: true,

		} );

		this.controller.bindScene( new ComplexScene() );

	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
