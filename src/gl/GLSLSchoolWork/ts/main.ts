import MainScene from './graphics/scenes/MainScene';
import ThreeGraphic from './graphics/utils/ThreeGraphic';

class App {

	constructor() {

		this.init();

	}

	init() {

		let threeGraphic = new ThreeGraphic();
		threeGraphic.setScene( new MainScene( threeGraphic.renderer ) );

	}

}

window.addEventListener( 'load', () => {

	new App();

} );
