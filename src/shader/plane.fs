varying vec2 vUv;
varying float vtime;
varying vec3 vc;

void main() {
  vec3 c = vc;
  gl_FragColor = vec4(1.0,1.0,1.0,vc.x * 0.2);
}