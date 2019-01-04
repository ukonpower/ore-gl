
uniform float time;
uniform float offset;

#define PI 3.1415926535

void main() {
  vec3 pos = position;
  pos *= (0.5,abs(sin(time * 0.5 + offset * 0.7)));
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  vec4 mvpPosition = projectionMatrix * mvPosition;
  gl_Position = mvpPosition;
}