import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class ObjectManager {

	private gltfScene: THREE.Group;

	constructor( ) {

		this.init();

	}

	protected init() {

		this.gltfScene = window.assetManager.gltfScene;

		let ground = this.gltfScene.getObjectByName( 'Ground' ) as THREE.Mesh;
		ground.receiveShadow = true;

		let hashira = this.gltfScene.getObjectByName( 'Nanika' ) as THREE.Mesh;
		hashira.material = new THREE.MeshStandardMaterial({
			metalness: 0.2,
			roughness: 0.5,
			color: new THREE.Color( '#777' )
		});
		hashira.castShadow = true;
		hashira.receiveShadow = true;

		let dai = this.gltfScene.getObjectByName( 'Dai' ) as THREE.Mesh;
		dai.material = new THREE.MeshStandardMaterial({
			metalness: 0.2,
			roughness: 0.5,
			color: new THREE.Color( '#777' )
		});
		dai.castShadow = true;
		dai.receiveShadow = true;

		let paper = this.gltfScene.getObjectByName( 'Paper' ) as THREE.Mesh;
		paper.material = new THREE.MeshStandardMaterial({
			metalness: 0.0,
			roughness: 0.8,
			color: new THREE.Color( '#FFF' ),
			side: THREE.DoubleSide
		});
		paper.castShadow = true;

		let paperStand = this.gltfScene.getObjectByName( 'PaperStand' ) as THREE.Mesh;
		paperStand.material = new THREE.MeshStandardMaterial({
			metalness: 0.5,
			roughness: 0.1,
			color: new THREE.Color( '#543' ),
		});
		paperStand.castShadow = true;

		let toilet = this.gltfScene.getObjectByName( 'Toilet_Root' ) as THREE.Mesh;
		toilet.traverse( ( obj ) => {

			let o = obj as THREE.Mesh;
			o.material = new THREE.MeshStandardMaterial({
				metalness: 0.2,
				roughness: 0.3,
				color: new THREE.Color( '#CCC' )
			});
			o.castShadow = true;
			o.receiveShadow = true;

		} );

	}

}
