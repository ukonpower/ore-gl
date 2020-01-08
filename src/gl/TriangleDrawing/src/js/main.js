const { Vector3, Vector4, Matrix4 } = require('matrixgl');
const GLPower = require('./GLPower')

const drawFrag = require('../shader/drawFrag.glsl');
const renderVert = require('../shader/renderVert.glsl');
const renderFrag = require('../shader/renderFrag.glsl');

var canvas;
var glp;

var drawPrg;
var renderPrg;
var time = 0;

var dPos = [0,0];
var dPow = 0;

window.addEventListener('load',() =>{
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    glp = new GLPower(canvas);

    drawPrg = glp.addShader(renderVert,drawFrag);
    renderPrg =  glp.addShader(renderVert,renderFrag);

    init();
},false)

function init(){

    glp.addAttribute(drawPrg,'position',3);
    glp.addUniform(drawPrg,'texture','uniform1i');
    glp.addUniform(drawPrg,'resolution','uniform2fv');
    glp.addUniform(drawPrg,'drawPos','uniform2fv');
    glp.addUniform(drawPrg,'drawPow','uniform1f');

    glp.addAttribute(renderPrg,'position',3);
    glp.addUniform(renderPrg,'texture','uniform1i');
    glp.addUniform(renderPrg,'resolution','uniform2fv');

    let screenVertex = [
        -1.0,  1.0,  0.0, 
         1.0,  1.0,  0.0, 
        -1.0, -1.0,  0.0, 
         1.0, -1.0,  0.0  
    ];

    let screenIndex = [
        0,1,2,1,3,2
    ]

    var screenVBO = glp.cVBO(screenVertex);
    var screenIBO = glp.cIBO(screenIndex);
    
    glp.cFbuffer(canvas.width,canvas.height,0);
    glp.cFbuffer(canvas.width,canvas.height,1);
    glp.cFbuffer(canvas.width,canvas.height,2);

    var bn = 0;

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

        const transform = Matrix4.identity().rotateY(time * 0.5).scale(2,2,2);
        const mvp = perspective.mulByMatrix4(view).mulByMatrix4(transform);

        bn = (bn == 0) ? 1 : 0;

        glp.selectFramebuffer(bn);
        glp.selectUseProgram(drawPrg);
        glp.setAttribute('position',screenVBO,screenIBO);
        glp.setUniform('resolution',[canvas.width,canvas.height]);
        glp.setUniform('texture',(bn == 0) ? 1 : 0);
        glp.setUniform('drawPos',dPos);
        glp.setUniform('drawPow',dPow);
        glp.drawElements();

        glp.selectFramebuffer(null);
        glp.selectUseProgram(renderPrg);
        glp.setAttribute('position',screenVBO,screenIBO);
        glp.setUniform('resolution',[canvas.width,canvas.height]);
        glp.setUniform('texture',bn);
        glp.drawElements();

        glp.flush();

        requestAnimationFrame(render);
    }

    window.addEventListener('touchmove',(e)=>{
        dPos = [e.changedTouches[0].pageX,window.innerHeight -e.changedTouches[0].pageY];
        dPow = e.touches[0].force;
        e.preventDefault();
    },{passive:false});

    window.addEventListener('mousemove',(e)=>{
        dPos = [e.clientX,window.innerHeight - e.clientY];
        dPow = 1;
        e.preventDefault();
    },{passive:false});
}
