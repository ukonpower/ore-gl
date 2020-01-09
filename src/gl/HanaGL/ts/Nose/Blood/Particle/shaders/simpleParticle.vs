
uniform float windowSizeY;
uniform float time;

varying vec4 vColor;

$noise3D

void main(void){
	
	vec3 pos = position;

	pos *= 1.0 + snoise( pos * 2. + time * 0.1 ) * 1.0;
	pos += vec3(
		snoise( pos * 2. + vec3( 3543., 5.3, 345. + time * 0.5 ) ) * 0.1,
		snoise( pos * 2. + vec3( 34., 55.3, 345. + time * 0.5 ) ) * 0.1,
		snoise( pos * 2. + vec3( 354., 85.3, 345. + time * 0.5 ) ) * 0.1
	);
	
	vColor = vec4( 0.0, 0.7, 0.7, (1.0 - length( pos )) * 0.1 );

	gl_PointSize = (windowSizeY / 100.0) * ( 1.0 - smoothstep( 0.0, 1.0, length( pos )));

	vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
	gl_Position = projectionMatrix * mvPosition;

}