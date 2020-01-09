uniform vec3 start;
uniform bool shot;

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

    pos += vel * ( 1.0 / 60.0 );

    float x = pos.x * pos.x;
    float y = pos.y * pos.y;
    float z = pos.z * pos.z;
    
    if(emitReady > 0.5){
        if(shot){
            pos = start;
        }else{
            pos = vec3(-999,-999,0);
        }
    }

    gl_FragColor = vec4( pos ,1.0);
}