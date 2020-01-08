uniform float time;
varying vec3 vColor;

void main() {
    vec3 p = position;

    vec3 c = vec3(1.0);
    float l = length(p);
    c *= 1.0 - min(l * 0.07,1.0);
    c *= sin(l * 0.6 - time * 2.0) + 0.1;
    c = abs(c);
    vColor = vec3(c);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 3.0;
}


