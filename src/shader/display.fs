uniform float time;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv = uv * 2.0 - 1.0;
  vec3 c = vec3(sin(length(uv) + time));
  gl_FragColor = vec4(c, 1.0);
}