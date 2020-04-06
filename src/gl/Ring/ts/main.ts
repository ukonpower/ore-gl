import * as ORE from './utils/ore-three';
import MainScene from './MainScene';
import * as THREE from 'three';

class APP {

	constructor() {

		let canvas = document.querySelector( "#canvas" );
		let controller = new ORE.Controller( canvas, true );
		let oreScene = new MainScene( controller.renderer );
		controller.setScene( oreScene );

	}

}
window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
