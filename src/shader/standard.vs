
uniform float time;
varying float vtime;
varying vec2 vUv;
#define PI 3.1415926535

void main() {
  vec3 pos = position;
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  vec4 mvpPosition = projectionMatrix * mvPosition;
  gl_Position = mvpPosition;
  vtime = time;
  vUv = uv;
}