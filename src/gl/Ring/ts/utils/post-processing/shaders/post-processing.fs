uniform float time;
uniform sampler2D tDiffuse;
varying vec2 vUv;
#define N 16

$noise2D

void main() {
  vec2 uv = vUv;
  vec2 u = uv * 2.0 - 1.0;
  vec3 c;

  float w = max(.0, length(u)) * 0.02;

  vec2 vig = u * w;
  vig += snoise(uv * 3.0) * 0.001;

  for (int i = 0; i < N; i++) {
    vig *= 1.0 + float(i) * 0.01;
    c.x += texture2D(tDiffuse, uv - vig).x;
    c.y += texture2D(tDiffuse, uv - vig * 0.65).y;
    c.z += texture2D(tDiffuse, uv - vig * 0.88).z;
  }
  c /= float(N) - 5.0;
  gl_FragColor = vec4(c, 1.0);
}