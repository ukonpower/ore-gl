
uniform float time;
uniform float offset;

#define PI 3.1415926535

void main() {
  vec3 pos = position;
  pos *= abs(sin(time * 0.5 + offset * 0.8 + pos.y));
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  vec4 mvpPosition = projectionMatrix * mvPosition;
  gl_Position = mvpPosition;
}