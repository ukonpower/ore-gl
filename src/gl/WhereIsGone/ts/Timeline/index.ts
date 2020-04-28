import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class Timeline extends ORE.TimelineAnimator {

	constructor() {

		super();

		this.init();

	}

	private init() {

		// this.add<THREE.Vector3>( {
		// 	name: 'camPos',
		// 	keyframes: [
		// 		{
		// 			time: 0,
		// 			value: new THREE.Vector3( 0, 1.0, 3 )
		// 		},
		// 		{
		// 			time: 0.9,
		// 			value: window.assetManager.gltfScene.getObjectByName( 'Toilet_Root' ).position.clone().add( new THREE.Vector3( 0, 1, 0.1 ))
		// 		},
		// 		{
		// 			time: 1,
		// 			value: window.assetManager.gltfScene.getObjectByName( 'Screen' ).getWorldPosition( new THREE.Vector3() ).add( new THREE.Vector3( 0, 0, -0.1 ) )
		// 		}
		// 	]
		// } );

		// this.add<THREE.Vector3>( {
		// 	name: 'camRot',
		// 	keyframes: [
		// 		{
		// 			time: 0,
		// 			value: new THREE.Vector3( 0, 1.0, 3 )
		// 		},
		// 		{
		// 			time: 0.9,
		// 			value: window.assetManager.gltfScene.getObjectByName( 'Toilet_Root' ).position.clone().add( new THREE.Vector3( 0, 1, 0.1 ))
		// 		},
		// 		{
		// 			time: 1,
		// 			value: window.assetManager.gltfScene.getObjectByName( 'Screen' ).getWorldPosition( new THREE.Vector3() ).add( new THREE.Vector3( 0, 0, -0.1 ) )
		// 		}
		// 	]
		// } );

	}

}
