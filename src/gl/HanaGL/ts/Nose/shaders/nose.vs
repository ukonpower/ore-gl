varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
	
    // vec3 pos = position;
    // pos.y -= 0.5;
    // pos *= 1.2;
    // pos.y += 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
	vNormal = normal;
    
}