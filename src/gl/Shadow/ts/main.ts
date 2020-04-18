import * as GLP from '@glpower';
import { ShadowScene } from './ShadowScene';

class APP {

	private controller: GLP.Controller;
	private scene: ShadowScene;

	constructor() {

		this.controller = new GLP.Controller( {
			canvas: document.querySelector( '#canvas' ),
		} );

		this.scene = new ShadowScene();
		this.controller.bindScene( this.scene );

	}

}

window.addEventListener( 'load', () => {

	new APP();

} );
