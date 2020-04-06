export default class Timer {

	constructor() {

		this.lastTime = Date.now();
		this.currentTime;
		this._deltaTime = null;
		this.update();

	}

	get deltaTime() {

		if ( this._deltaTime != null && this._deltaTime > 0 ) {

			return this._deltaTime;

		}
		return 0;

	}

	update() {

		this.currentTime = Date.now();
		this._deltaTime = this.currentTime - this.lastTime;
		this.lastTime = this.currentTime;
		requestAnimationFrame( this.update.bind( this ) );

	}

}
