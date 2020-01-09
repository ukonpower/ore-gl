precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;
uniform vec2 drawPos;
uniform float drawPow;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 dPos = drawPos / resolution;
    vec3 c = texture2D(texture,uv).xyz;

    // float left = texture2D(texture,vec2(gl_FragCoord.x - 1.0,gl_FragCoord.y) / resolution).x;
    // float right = texture2D(texture,vec2(gl_FragCoord.x + 1.0,gl_FragCoord.y) / resolution).x;
    // float up = texture2D(texture,vec2(gl_FragCoord.x,gl_FragCoord.y + 1.0) / resolution).x;
    // float down = texture2D(texture,vec2(gl_FragCoord.x ,gl_FragCoord.y - 1.0) / resolution).x;

    float sum = 0.0;
    for(int i = -1; i <= 1; i++){
        for(int j = -1; j <= 1; j++){
            if(i == 0 && j == 0){ continue;}
            sum += texture2D(texture,vec2(gl_FragCoord.x + float(i),gl_FragCoord.y + float(j)) / resolution).x;
        }
    }

    if(length(gl_FragCoord.xy - drawPos) < 12.0){
        c = vec3(1.0);
    }else{
        if(c.x == 1.0){
            if(sum == 3.0 || sum == 2.0){
            }else if( sum <= 1.0){
                c = vec3(0.0);
            }else if(sum >= 4.0){
                c = vec3(0.0);
            }
        }else{
            if(sum == 3.0){
                c = vec3(1.0);
            }
        }
    }

    gl_FragColor = vec4(c,1.0);
}