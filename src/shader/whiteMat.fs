precision lowp float;

varying float vSwitch;

void main() {
  float alpha = 0.05;

  gl_FragColor = vec4(
    0.0 / 255.0,
    0.0 / 255.0,
    0.0 / 255.0,
    vSwitch * alpha
    );

} 