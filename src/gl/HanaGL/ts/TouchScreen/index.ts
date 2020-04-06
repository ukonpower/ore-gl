import * as THREE from 'three';

export class TouchScreen extends THREE.Mesh {

	private raycaster: THREE.Raycaster;

	constructor() {

		let geo = new THREE.PlaneGeometry( 10, 10 );
		let mat = new THREE.MeshBasicMaterial( {
			visible: false
		} );

		super( geo, mat );

		// this.rotateX( Math.PI / 2 );
		this.raycaster = new THREE.Raycaster();

	}

	public getTouchPos( camera: THREE.Camera, screenPos: THREE.Vector2 ) {

		this.raycaster.setFromCamera( screenPos, camera );
		let intersects = this.raycaster.intersectObjects( [ this ] );

		if ( intersects.length > 0 ) {

			let point = intersects[ 0 ].point;
			return point;

		} else {

			return null;

		}

	}

}
