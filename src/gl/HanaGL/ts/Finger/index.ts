import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { Mesh, MeshBasicMaterial } from 'three';

export class Finger extends THREE.Object3D{

	private newestPos: THREE.Vector3 = new THREE.Vector3( 10, 0, 0 );
	private wireFinger: THREE.Mesh;
	private meshFinger: THREE.Mesh;

	constructor( gltfScene: THREE.Scene ){

		super();

		this.craeteObjects( gltfScene );

	}

	private craeteObjects( gltfScene: THREE.Scene ){

		/*-------------------------
			Mesh
		--------------------------*/
		
		this.meshFinger = ( gltfScene.getObjectByName( 'Finger' ) as Mesh ).clone();
		this.meshFinger.material = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			roughness: 0.9,
		})

		this.position.copy( this.meshFinger.position );

		this.add( this.meshFinger );

		this.meshFinger.position.set( 0, 0, 0 );

	}

	public updatePos(){

		console.log( this.newestPos );
		
		let diff = this.newestPos.clone().sub( this.position );
		
		diff.multiplyScalar( 0.1 );

		this.position.add( diff );
		
	}

	public setPos( pos: THREE.Vector3 ){

		this.newestPos = pos.clone();

	}
	
}