import * as ORE from '@ore-three-ts';
import { ToiletScene } from './ToiletScene';
import { AssetManager } from './AssetManager';

declare global {
	interface Window {
		assetManager: AssetManager;
	}
}

class APP {

	private canvas: any;
	private controller: ORE.Controller;
	private scene: ToiletScene;

	constructor() {

		this.canvas = document.querySelector( "#canvas" );

		this.controller = new ORE.Controller( {

			canvas: this.canvas,
			retina: true,

		} );

		this.controller.bindScene( new ToiletScene() );

	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
