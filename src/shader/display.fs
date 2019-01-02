varying vec2 vUv;
varying float vtime;

void main() {
  vec2 uv = vUv;
  uv = uv * 2.0 - 1.0;
  vec3 c = vec3(sin(length(uv) - vtime));
  gl_FragColor = vec4(c, 1.0);
}