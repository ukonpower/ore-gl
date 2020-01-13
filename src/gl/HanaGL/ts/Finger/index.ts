import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { Mesh, MeshBasicMaterial } from 'three';

export class Finger extends THREE.Object3D{

	private newestPos: THREE.Vector3 = new THREE.Vector3();
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

		this.add( this.meshFinger );

	}

	public updatePos( pos?: THREE.Vector3 ){

		if( pos ){

			this.newestPos = pos.clone();
			
		}
		
		let diff = this.newestPos.sub( this.position );
		
		diff.multiplyScalar( 0.1 );

		this.position.add( diff );
		
	}
	
}