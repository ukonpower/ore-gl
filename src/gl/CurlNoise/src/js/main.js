const { Vector3, Vector4, Matrix4 } = require('matrixgl');
const GLPower = require('./GLPower')

const frag = require('../shader/frag.glsl');
const vert = require('../shader/vert.glsl');

const renderVert = require('../shader/renderVert.glsl');
const particleFrag = require('../shader/computeParticle.fs');
const initParticleFrag = require('../shader/initParticle.fs');

var canvas;
var glp;

var scenePrg;
var particlePrg;

var time = 0;

window.addEventListener('load',() =>{
    canvas = document.getElementById("canvas");
    // var dpr = window.devicePixelRatio || 1;
    var dpr = 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    glp = new GLPower(canvas,{r:0,g:0,b:0});

    scenePrg = glp.getProgram(vert,frag);
    initParticlePrg = glp.getProgram(renderVert,initParticleFrag);
    particlePrg = glp.getProgram(renderVert,particleFrag);

    init();
},false)

function init(){

    glp.addAttribute(initParticlePrg,'position',3);
    glp.addUniform(initParticlePrg,'resolution','uniform2fv');

    glp.addAttribute(particlePrg,'position',3);
    glp.addUniform(particlePrg,'resolution','uniform2fv');
    glp.addUniform(particlePrg,'posTexture','uniform1i');
    glp.addUniform(particlePrg,'time','uniform1f');

    glp.addAttribute(scenePrg,'index',1);
    glp.addUniform(scenePrg,'mvp','uniformMatrix4fv')
    glp.addUniform(scenePrg,'time','uniform1f');
    glp.addUniform(scenePrg,'num','uniform1f');
    glp.addUniform(scenePrg,'posTexture','uniform1i');


    var boxVertex = []
    var particleIndex = []

    let n = 512;

    for(var j = 0; j < n; j++){
        for(var i = 0; i < n; i++){
            boxVertex.push(0,0,0);
            particleIndex.push(i + j * n);
        }
    }

    var boxVBO = glp.cVBO(boxVertex);
    var indexVBO = glp.cVBO(particleIndex);

    glp.cFbuffer(n,n,0,true);
    glp.cFbuffer(n,n,1,true);

    var fBselect = 0;

    glp.selectFramebuffer(0);
    glp.selectUseProgram(initParticlePrg)
    glp.setAttribute('position',glp.screenVBO,glp.screenIBO);
    glp.setUniform('resolution',[n,n]);
    glp.clear();
    glp.drawElements();
    glp.flush();

    render();
    
    function render(){
        time += 0.01666;
        
        const view = Matrix4.lookAt(new Vector3(0,2,5),new Vector3(0,0,0),new Vector3(0,1,0));

        const perspective = Matrix4.perspective({
            fovYRadian: 60 * Math.PI / 180,
            aspectRatio: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 10
        });

        const transform = Matrix4.identity().rotateY(0).scale(2,2,2);
        const mvp = perspective.mulByMatrix4(view).mulByMatrix4(transform);

        fBselect = fBselect == 0 ? 1 : 0;
        
        glp.selectFramebuffer(fBselect);
        glp.selectUseProgram(particlePrg)
        glp.setAttribute('position',glp.screenVBO,glp.screenIBO);
        glp.setUniform('posTexture',fBselect == 0 ? 1 : 0);
        glp.setUniform('resolution',[n,n]);
        glp.setUniform('time',time);
        glp.clear();
        glp.drawElements();
        glp.flush();

        glp.selectFramebuffer(null);
        glp.selectUseProgram(scenePrg);
        glp.setAttribute('index',indexVBO,null);
        glp.setUniform('mvp',mvp.values);
        glp.setUniform('num',n);
        glp.setUniform('time',time);
        glp.setUniform('posTexture',fBselect);

        glp.clear();
        glp.drawArrays(glp.gl.POINTS)
        glp.flush();

        requestAnimationFrame(render);
    }
}
