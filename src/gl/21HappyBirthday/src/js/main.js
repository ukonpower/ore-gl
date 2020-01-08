import MainScene from './MainScene';
import ThreeController from './utils/ThreeController'
class App {
    constructor() {
        this.init();
    }

    init() {
        this.tc = new ThreeController();
        this.scene = new MainScene(this.tc.renderer);
        this.tc.setScene(this.scene);
    }
}

document.addEventListener('load',new App());