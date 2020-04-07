import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class SmoothCameraMover {

	private camera: THREE.Object3D;

	private radX: number;
	private radY: number;
	private rotateZ: number;

	private baseMatrix: THREE.Matrix4;
	private targetPos: THREE.Vector2;
	private delayPos: THREE.Vector2;

	constructor( camera: THREE.Object3D, radY: number = Math.PI / 2, radX: number = Math.PI / 4, rotateZ?: number ) {

		this.radY = radY / 2;
		this.radX = radX / 2;
		this.rotateZ = rotateZ;

		this.camera = camera;
		this.camera.updateMatrix();
		this.baseMatrix = this.camera.matrix.clone();

		this.delayPos = new THREE.Vector2( 0, 0 );

	}

	public setCursor( pos: THREE.Vector2 ) {

		this.targetPos = pos.clone();

	}

	public update( deltaTime: number ) {

		this.delayPos.add( this.targetPos.clone().sub( this.delayPos ).multiplyScalar( deltaTime * 2.0 ) );

		this.camera.updateMatrix();
		this.camera.matrix.copy( this.baseMatrix );
		this.camera.matrix.decompose( this.camera.position, this.camera.quaternion, this.camera.scale );

		this.camera.applyMatrix4( ( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( - this.delayPos.y * this.radX, this.delayPos.x * this.radY, 0, 'XYZ' ) ) ) );

	}

}
