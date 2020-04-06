import * as ORE from '@ore-three-ts';

import Background from './utils/Background';
import MainObj from './utils/MainObj';
import Fish from './utils/Fish';
import * as THREE from 'three';

export class TopScene extends ORE.BaseScene{

	private ext: boolean;

	private cyOffset: number;
	private bg: Background;
	private mainObj: MainObj;
	private fish: Fish;
	private raycaster: THREE.Raycaster;
	private pointer: THREE.Vector3;

	private plane: THREE.Mesh;

	constructor() {

		super();

	}

	public onBind( gProps: ORE.GlobalProperties ){

		this.renderer = gProps.renderer;

		if ( !this.renderer.extensions.get( 'ANGLE_instanced_arrays' ) || !this.renderer.extensions.get( 'OES_texture_float' ) ) {

			document.querySelector( '.worning' ).classList.add( 'v' );
			this.ext = false;
			
		}else{

			this.ext = true;
			
		}

		this.init();

		window.addEventListener( 'scroll', this.onScroll.bind( this ) );

		document.querySelector( '.about-link' ).addEventListener( 'click', () => {

			document.querySelector( '.about' ).classList.toggle( 'v' );
			
		} );

		document.querySelector( '.about-close' ).addEventListener( 'click', () => {

			document.querySelector( '.about' ).classList.toggle( 'v' );
			
		} );

		document.querySelector( ".loading" ).classList.add( "hide" );

		let elms = document.querySelectorAll( '.title' );

		for( let i = 0; i < elms.length; i++ ){

			elms[ i ].classList.add( 'v' );
			
		}
		
		( document.querySelector( '.about' ) as HTMLElement ).style.transition = '.8s cubic-bezier( .55, .02, .23, .98 )';

		if( !this.ext ){

			let extElms = document.querySelectorAll( ".content-list-item-link.ext" );

			for( let i = 0; i < extElms.length; i++ ){

				extElms[ i ].addEventListener( 'click',( e )=>{
					
					e.preventDefault();
					
				} )
				
			}
			
			let worningElms = document.querySelectorAll( ".content-list-item-worning" );

			for( let i = 0; i < worningElms.length; i++ ){

				( worningElms[ i ] as HTMLElement ).style.opacity = '0';
				
			}
		}
		
	}
	
	private init() {

		this.time = Math.random() * 100;
		
		this.camera.position.set( 0, 0, 9 );

		this.cyOffset = 0;

		let aLight = new THREE.AmbientLight();
		aLight.intensity = 0.4;
		this.scene.add( aLight );

		let dLight = new THREE.DirectionalLight();
		dLight.intensity = 0.7;
		dLight.position.set( 0.1, 10, -2 );
		this.scene.add( dLight );

		let pLight = new THREE.PointLight();
		pLight.color = new THREE.Color( 0xff0044 );
		pLight.position.set( 20, 0, 5 );
		pLight.intensity = 1;
		this.scene.add( pLight );

		pLight = new THREE.PointLight();
		pLight.color = new THREE.Color( 0x4400ff );
		pLight.position.set( -10, 0, 5 );
		pLight.intensity = 1;
		this.scene.add( pLight );

		this.bg = new Background();
		this.bg.obj.frustumCulled = false;
		this.scene.add( this.bg.obj );

		this.mainObj = new MainObj();
		this.scene.add( this.mainObj.obj );
		this.mainObj.obj.position.set( 3, 0, 0 );

		if ( this.ext ) {

			this.fish = new Fish( this.renderer, 200, 50 );
			this.fish.setAvoidObje( this.mainObj.obj.position, 3.2 );
			this.fish.setCamY( this.camera.position.y );
			this.fish.obj.frustumCulled = false;
			this.scene.add( this.fish.obj );
			
		}

		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector3( 0, 0, 0 );

		this.onScroll();

	}

	public animate( deltaTime: number ) {

		if ( this.bg ) {

			this.bg.update( this.time );
			
		}

		if ( this.mainObj ) {
			
			this.mainObj.update( this.time );
			
		}

		if ( this.fish ) {
			
			this.fish.update( this.time );
			
		}

		this.renderer.render( this.scene, this.camera );
	}

	private ray( cursor ) {

		let halfWidth = innerWidth / 2;
		let halfHeight = innerHeight / 2;
		let pos = new THREE.Vector2( ( cursor.x - halfWidth ) / halfWidth, ( cursor.y - halfHeight ) / halfHeight );

		pos.y *= -1;

		this.raycaster.setFromCamera( pos, this.camera );
		let intersects = this.raycaster.intersectObjects( [ this.plane ] );
		
		if ( intersects.length > 0 ) {

			let point = intersects[ 0 ].point;
			return point;

		} else {

			return null;
			
		}

	}

	public onResize( resizeArgs: ORE.ResizeArgs ) {

		super.onResize( resizeArgs );
		
		if ( resizeArgs.aspectRatio  < 1 ) {

			this.camera.position.x = 1;
			this.camera.position.z = 13;
			this.cyOffset = -1.0;
			
		} else {
			
			this.camera.position.x = 0;
			this.camera.position.z = 10;
			this.cyOffset = 0;
			
		}
		
		this.camera.aspect = resizeArgs.aspectRatio;
		this.camera.updateProjectionMatrix();
		this.camera.position.y = window.pageYOffset * -0.004 + this.cyOffset;
		
	}

	onScroll() {
		
		let offset = window.pageYOffset;
		
		if ( this.camera ) {

			this.camera.position.y = offset * -0.004 + this.cyOffset;
			
		}

		if ( this.fish ) {

			this.fish.setCamY( this.camera.position.y );

		}

		document.querySelectorAll( '.content-list-item' ).forEach( ( elm ) => {

			const top = elm.getBoundingClientRect().top + window.pageYOffset;

			if ( top < window.pageYOffset + window.innerHeight / 5 * 4 ) {
				
				elm.classList.add( 'v' );

			}

		} );

	}

}