import * as THREE from 'three';
import { BloodParticle } from './Particle';
import { BloodTrails } from './Trails';

export class Blood extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;

	private particle: BloodParticle;
	private trails: BloodTrails;

	private isSplash: boolean = false;
	private eruptionPos: THREE.Vector3;

	constructor( renderer: THREE.WebGLRenderer ) {

		super();

		this.renderer = renderer;

		this.createParticle();

	}

	private createParticle() {

		this.particle = new BloodParticle( this.renderer, 128 );
		this.add( this.particle );

		this.trails = new BloodTrails( this.renderer, 256, 30 );
		this.add( this.trails );

	}

	public update( deltaTime: number ) {

		this.particle.update( deltaTime );
		this.trails.update( deltaTime );

	}

	public splash( pos: THREE.Vector3 ) {

		this.particle.splash( pos );
		this.trails.splash( pos );

	}

	public heal() {

		this.particle.heal();
		this.trails.heal();

	}

}
