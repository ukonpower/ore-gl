#include <common>
uniform sampler2D texturePosition;
varying vec4 vColor;

void main() {
    vec3 pos = texture2D( texturePosition, uv ).xyz;
    
    vec3 c = vec3(uv.y,sin(uv.y * 3.0),1.0); 
    vColor = vec4(c,1.0);

    vec4 mvPosition = modelViewMatrix * vec4( pos + position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}