// VertexShaderから受け取った色を格納するだけ。
varying vec4 vColor;
void main() {
    gl_FragColor = vColor;
}