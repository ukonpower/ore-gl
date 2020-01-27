varying vec3 vViewPosition;
varying vec3 vNormal;

uniform float splash;
uniform float time;

$noise3D

void main() {
	
    vec3 pos = position;
    pos += normal * 0.008;
    // pos.y -= 0.3;
    pos *= 1.0 + splash * ( 0.9 + snoise( vec3( position * 30.0 + time * 4.0 ) ) ) * 0.2;
    // pos.y += 0.3;
    
    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
	vNormal = normal;
    
}