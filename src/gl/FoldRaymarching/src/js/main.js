const { Vector3, Vector4, Matrix4 } = require('matrixgl');
const GLPower = require('./GLPower')

const renderVert = require('../shader/renderVert.vs');
const renderFrag= require('../shader/renderFrag.fs');

const frag = require('../shader/frag.fs');

var canvas;
var glp;

var scenePrg;
var particlePrg;
var wholeRenderPrg;
var renderPrg;

var time = 0;

window.addEventListener('load',() =>{
    canvas = document.getElementById("canvas");
    var dpr = window.devicePixelRatio || 1;
    dpr = 0.5;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    glp = new GLPower(canvas,{r:0,g:0,b:0});

    wholeRenderPrg = glp.getProgram(renderVert,frag);
    renderPrg = glp.getProgram(renderVert,renderFrag);

    init();
},false)

function init(){

    glp.addAttribute(wholeRenderPrg,'position',3);
    glp.addUniform(wholeRenderPrg,'resolution','uniform2fv');
    glp.addUniform(wholeRenderPrg,'preFrameTex','uniform1i');
    glp.addUniform(wholeRenderPrg,'time','uniform1f');

    glp.addAttribute(renderPrg,'position',3);
    glp.addUniform(renderPrg,'texture','uniform1i');
    glp.addUniform(renderPrg,'resolution','uniform2fv');

    //render buffer
    glp.cFbuffer(canvas.width,canvas.height,0);
    glp.cFbuffer(canvas.width,canvas.height,1);

    var selectRBuffer = 0;

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
        
        selectRBuffer = selectRBuffer == 0 ? 1 : 0;

        glp.selectFramebuffer(selectRBuffer);
        glp.selectUseProgram(wholeRenderPrg);
        glp.setAttribute("position",glp.screenVBO,glp.screenIBO);
        glp.setUniform('resolution',[canvas.width,canvas.height]);
        glp.setUniform('preFrameTex',selectRBuffer == 0 ? 1 : 0);
        glp.setUniform('time',time);
        glp.clear();
        glp.drawElements();
        glp.flush();

        glp.selectFramebuffer(null);
        glp.selectUseProgram(renderPrg);
        glp.setAttribute("position",glp.screenVBO,glp.screenIBO);
        glp.setUniform('texture',selectRBuffer);
        glp.setUniform('resolution',[canvas.width,canvas.height]);
        glp.clear();
        glp.drawElements();
        glp.flush();

        requestAnimationFrame(render);
    }
}
