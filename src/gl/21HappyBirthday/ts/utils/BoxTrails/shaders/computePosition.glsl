void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    if(gl_FragCoord.x <= 1.0){
        vec3 pos = texture2D( texturePosition, uv ).xyz;
        vec3 vel = texture2D( textureVelocity, uv ).xyz;

        pos += vel * 0.01;

        gl_FragColor = vec4(pos,1.0);
    }else{
        vec2 bUV = (gl_FragCoord.xy - vec2(1.0,0.0)) / resolution.xy;
        vec3 beforePos = texture2D( texturePosition, bUV ).xyz;
        vec3 pos = beforePos;

        gl_FragColor = vec4(pos,1.0);
    }
}