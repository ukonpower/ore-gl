import * as THREE from 'three';
import * as ORE from 'ore-three-ts';
import { Mesh, MeshBasicMaterial } from 'three';

export class Finger extends THREE.Object3D{

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

	public update(){

	}
	
}