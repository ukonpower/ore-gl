attribute vec3 offsetPos;
varying vec3 vViewPosition;
varying vec3 vColor;
uniform float time;
uniform float scroll;

float PI = 3.141592653589793;

$constants
$rotate
$noise4D

void main() {
  vec3 pos = position;
  vec3 p = offsetPos;
  float n = (snoise(vec4(p * 0.8, time * 0.5)) + 1.0) / 1.5;
  float s = 1.0 - n * smoothstep(0.0, .2, (cos(time * 0.5) - 1.0) / -2.0);
  s = smoothstep(0.0, 0.4, s);

  pos *= s + 0.1;
  p *= 1.0 + 1.0 - s;
  vec3 wp = pos + p;
  wp.xz *= rotate(HPI / 2.0);
  wp.yz *= rotate(HPI / 1.7);

  vec4 mvPosition = modelViewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vViewPosition = -mvPosition.xyz;

  vColor = vec3(1.5, 0.0, 0.6);
  vColor += smoothstep(0.6, 0.0, length(p) * 0.6) * vec3(0.9, 0.6, 1.0);
}