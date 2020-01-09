uniform float time;
varying vec3 vColor;
varying vec3 vViewPosition;

$rotate
$constants
$noise2D

void main() {
    vec3 vp = position;

    vp.yz *= rotate( HPI );

    // vp.y -= smoothstep( 0.9, 1.0, length( vp.xz ) * 0.4) * 1.0;

    vp.y += snoise( vec2( vp.xz )) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4( vp, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;

    vColor = vec3( 0.2, 0.4, 0.0 );

}


