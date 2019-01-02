varying vec2 vUv;
varying float vtime;
varying vec3 vc;

float trim(float p){
  return max(0.0,min(1.0,p));
}
void main() {
  vec2 uv = gl_PointCoord;
  uv = uv * 2.0 - 1.0;
  vec3 c = vec3(trim(1.0 - length(uv)));
  gl_FragColor = vec4(c.x * 0.9);
}