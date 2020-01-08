uniform sampler2D texturePosition;

uniform vec3 color;
uniform float width;
varying vec4 vColor;

void main() {
    vec4 posTemp = texture2D( texturePosition, uv );
    vec3 pos = posTemp.xyz;

    vec3 c = color;
    c.z -= max(0.0,sin(uv.y * 100.0));
    c.y -= max(0.0,sin(uv.y * 100.0));
    c *= 0.6;
    
    vColor = vec4(c,1.0);

    vec4 mvPosition = modelViewMatrix * vec4( pos + position, 1.0 );

    gl_PointSize = width / 150.0 * sin(uv.x);
    gl_Position = projectionMatrix * mvPosition;
}