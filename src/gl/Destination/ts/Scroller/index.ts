import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class Scroller {

	private commonUniforms: ORE.Uniforms;

	public pos: number = 0;
	public posDelay: number = 0;
	public velocity: number = 0;
	public attenuation: number = 0.99;

	constructor() {

	}

	public update( deltaTime: number ) {

		this.pos = Math.max( 0, this.pos );

		this.posDelay += (this.pos - this.posDelay) * 0.03;

	}

	public addVelocity( vel: number ) {

		this.pos += vel * 0.001;

	}

}
