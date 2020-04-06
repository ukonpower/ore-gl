import BaceScene from './BaceScene.js';
import Timer from '../utils/Timer.js';
import Particle from './Particle';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import mainVisualVert from '../shaders/bg.vs';
import mainVisualFrag from '../shaders/bg.fs';

import ppVert from '../shaders/pp.vs';
import ppFrag from '../shaders/pp.fs';

import * as THREE from 'three';

window.THREE = THREE;

export default class MainScene extends BaceScene {

	constructor( renderer ) {

		super();

		this.renderer = renderer;
		this.time = 0;
		this.camTime = 0;
		this.timer = new Timer();
		this.clock = new THREE.Clock();
		this.lastTime = Date.now();

		this.camera.position.set( 2, 2, 10 );
		this.camera.lookAt( 0, 1, - 5 );

		this.humanL;
		this.particleL = new Particle( this.renderer, new THREE.Vector3( 1, 0, 0 ) );
		this.scene.add( this.particleL.obj );
		this.emitterL;
		this.humanR;
		this.particleR = new Particle( this.renderer, new THREE.Vector3( 1, 1, 9 ) );
		this.scene.add( this.particleR.obj );
		this.emitterR;

		this.floor;
		this.goal;
		this.bgMat;

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		this.isHumanRot = false;
		this.isFever = false;
		this.isShot = false;

		var planeGeo = new THREE.PlaneGeometry( 10, 10, 100 );
		var planeMat = new THREE.MeshNormalMaterial( {
			side: THREE.DoubleSide,
		} );
		planeMat.visible = false;
		this.plane = new THREE.Mesh( planeGeo, planeMat );
		this.plane.rotateY( Math.PI / 2 );
		this.scene.add( this.plane );


		var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
		light.position.set( 4, 15, 2.5 );
		this.scene.add( light );

		window.scene = this.scene;


		document.querySelector( "#rot" ).addEventListener( 'click', ()=>{

			this.isHumanRot = this.isHumanRot ? false : true;

		} );

		document.querySelector( '#fever' ).addEventListener( 'click', ()=>{

			if ( this.isFever ) {

				this.bgMat.uniforms.visible.value = false;
				this.isFever = false;
				this.customPass.uniforms.time.value = 0;

			} else {

				this.bgMat.uniforms.visible.value = true;
				this.isFever = true;

			}

		} );

		document.querySelector( "#shot" ).addEventListener( 'click', ()=>{

			this.isShot = this.isShot ? false : true;
			this.particleL.posUniforms.shot.value = this.isShot;
			this.particleR.posUniforms.shot.value = this.isShot;

		} );

		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );


		var effect = {
			uniforms: {
				tDiffuse: {
					value: null,
					type: 't',
				},
				time: {
					value: 0,
					type: "f",
				}
			},
			vertexShader: ppVert,
			fragmentShader: ppFrag,
		};
		this.customPass = new ShaderPass( effect );
		this.customPass.renderToScreen = true;
		this.composer.addPass( this.customPass );

		this.init();

	}

	init() {

		let loader = new GLTFLoader();

		loader.load( './assets/models/glslschool.glb', ( gltf ) => {

			var object = gltf.scene;
			var animations = gltf.animations;
			object.traverse( ( child ) => {

				if ( child.isMesh ) {

					child.material = new THREE.MeshNormalMaterial();

				}

			} );

			this.emitterL = object.getObjectByName( "emitter_L" );
			this.emitterR = object.getObjectByName( "emitter_R" );

			this.goal = object.getObjectByName( "center" );

			this.humanL = object.getObjectByName( "human_L_rig" );
			this.humanR = object.getObjectByName( "human_R_rig" );
			this.floor = object.getObjectByName( "floor" );

			this.scene.add( object );

		} );


		var bgGeo = new THREE.BufferGeometry();
		var vertexPositions = [
			[ 1.0, 1.0, 1.0 ],
			[ - 1.0, 1.0, 1.0 ],
			[ 1.0, - 1.0, 1.0 ],
			[ - 1.0, - 1.0, 1.0 ]
		];

		var uvPos = [
			[ 1.0, 1.0, 1.0 ],
			[ 0.0, 1.0, 1.0 ],
			[ 1.0, 0.0, 1.0 ],
			[ 0.0, 0.0, 1.0 ]
		];

		var uv = new Float32Array( uvPos.length * 3 );
		var vertices = new Float32Array( vertexPositions.length * 3 );
		for ( var i = 0; i < vertexPositions.length; i ++ ) {

			vertices[ i * 3 + 0 ] = vertexPositions[ i ][ 0 ];
			vertices[ i * 3 + 1 ] = vertexPositions[ i ][ 1 ];
			vertices[ i * 3 + 2 ] = vertexPositions[ i ][ 2 ];
			uv[ i * 3 + 0 ] = uvPos[ i ][ 0 ];
			uv[ i * 3 + 1 ] = uvPos[ i ][ 1 ];
			uv[ i * 3 + 2 ] = uvPos[ i ][ 2 ];

		}

		// 頂点インデックスを生成
		var indices = new Uint16Array( [
			0, 1, 2,
			2, 3, 1
		] );

		// attributesを追加
		bgGeo.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		bgGeo.setAttribute( 'uv', new THREE.BufferAttribute( uv, 3 ) );
		bgGeo.setIndex( new THREE.BufferAttribute( indices, 1 ) );
		this.bgMat = new THREE.ShaderMaterial( {
			uniforms: {
				time: { type: "f", value: 0.0 },
				camera: { type: "v3", value: this.camera.position },
				resolution: { type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
				visible: { type: "i", value: false }
			},
			side: THREE.DoubleSide,
			vertexShader: mainVisualVert,
			fragmentShader: mainVisualFrag
		} );

		this.bg = new THREE.Mesh( bgGeo, this.bgMat );
		this.bg.name = "mainVisual";
		this.bg.position.set( 0, 0, 0 );
		this.bg.scale.set( 1.5, 1.5, 1 );
		this.scene.add( this.bg );

	}

	Update() {

		this.time += this.timer.deltaTime * 0.001;

		this.particleL.update();
		this.particleR.update();

		if ( this.isFever ) {

			this.camTime += this.timer.deltaTime * 0.001;
			this.camera.position.x = Math.sin( this.camTime * 1.5 ) * 10;
			this.camera.position.y = Math.sin( this.camTime * 1.5 * 0.5 ) * 5 + 5;
			this.camera.position.z = Math.cos( this.camTime * 1.5 ) * 10;
			this.camera.lookAt( 0, 0, 0 );
			this.customPass.uniforms.time.value = this.camTime;

		}

		if ( this.humanR && this.humanL ) {

			if ( this.isHumanRot ) {

				this.humanL.rotateY( 0.3 );
				this.humanR.rotateY( 0.3 );

			}

		}

		if ( this.emitterL && this.emitterR ) {

			var p = new THREE.Vector3();
			this.emitterL.getWorldPosition( p );
			this.particleL.startPos = p;

			var p2 = new THREE.Vector3();
			this.emitterR.getWorldPosition( p2 );
			this.particleR.startPos = p2;

		}

		if ( this.goal ) {

			this.particleR.goalPos = this.goal.position;
			this.particleL.goalPos = this.goal.position;

		}

		if ( this.bgMat ) {

			this.bgMat.uniforms.time.value = this.time;
			this.bgMat.uniforms.camera.value = this.camera.position;

		}

		this.composer.render();

		// this.renderer.render(this.scene,this.camera);

	}

	Resize( width, height ) {

		console.log( width, height );

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		// this.composer.setSize(window.innerWidth,window.innerHeight);
		// this.bgMat.uniforms.resolution.value = new THREE.Vector2(window.innerWidth,window.innerHeight);

	}

	onTouchStart( cursor ) {

		this.isTouch = true;
		var halfWidth = innerWidth / 2;
		var halfHeight = innerHeight / 2;
		var pos = new THREE.Vector2( ( cursor.x - halfWidth ) / halfWidth, ( cursor.y - halfHeight ) / halfHeight );

	}

	onTouchMove( cursor ) {

		if ( ! this.isTouch ) return;
		var halfWidth = innerWidth / 2;
		var halfHeight = innerHeight / 2;
		var pos = new THREE.Vector2( ( cursor.x - halfWidth ) / halfWidth, ( cursor.y - halfHeight ) / halfHeight );

		pos.y *= - 1;

		this.raycaster.setFromCamera( pos, this.camera );
		var intersects = this.raycaster.intersectObjects( [ this.plane ] );
		if ( intersects.length > 0 ) {

			var point = intersects[ 0 ].point;
			this.goal.position.copy( point );

		}

	}

	onTouchEnd( cursor ) {

		this.isTouch = false;
		var pos = new THREE.Vector2( 0, 0 );

	}

}
