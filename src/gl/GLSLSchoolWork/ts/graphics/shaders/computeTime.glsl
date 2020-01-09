uniform float deltaTime;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 pos = tmpPos.xyz;

    vec4 tmpVel = texture2D( textureVelocity, uv );
    vec3 vel = tmpVel.xyz;

    vec4 tmpTime = texture2D( textureTime, uv );
    float lifeTime = tmpTime.x;
    float currentTime = tmpTime.y;
    float emitReady = tmpTime.z;

    if(emitReady >= 0.5){
        currentTime = 0.0;
        emitReady = 0.0;
    }

    currentTime += deltaTime;
    
    if(currentTime > lifeTime){
        emitReady = 1.0;
    }

    gl_FragColor = vec4(lifeTime,currentTime,emitReady,0);
}