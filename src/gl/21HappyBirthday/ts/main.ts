import MainScene from './MainScene';
import ThreeController from './utils/ThreeController'
class App {
	constructor() {
		this.init();
	}

	init() {
		let tc = new ThreeController();
		let scene = new MainScene(tc.renderer);
        tc.setScene(scene);
	}
}

window.addEventListener('load', () => { new App() } );