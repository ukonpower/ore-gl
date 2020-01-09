uniform sampler2D texturePosition;

uniform vec3 color;
varying vec4 vColor;

void main() {
    vec4 posTemp = texture2D( texturePosition, uv );
    vec3 pos = posTemp.xyz;

    vColor = vec4(color,1.0);

    vec4 mvPosition = modelViewMatrix * vec4( pos + position, 1.0 );

    gl_PointSize = 2.0;
    gl_Position = projectionMatrix * mvPosition;
}