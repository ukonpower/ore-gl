const ProParam = require('./ProParam');

module.exports = class GLpower{
    constructor(canvas){
        this.gl = canvas.getContext('webgl');
        this.canvas = canvas;
        this.program = [];
        this.fBuffer = {};
        this.currentProgram;

        this.gl.clearColor(0,0,0,1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    addShader(vsSource,fsSource){
        var vs = this.cShader(vsSource,this.gl.VERTEX_SHADER);
        var fs = this.cShader(fsSource,this.gl.FRAGMENT_SHADER);
        
        this.program.push(new ProParam(this.cProgram(vs,fs)));
        return this.program.length - 1;
    }

    cShader(source,type){
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader,source);
        this.gl.compileShader(shader);
    
        if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
            return shader;
        }else{
            console.log(this.gl.getShaderInfoLog(shader));
            return null;
        }
    }
    
    cProgram(v,f){
        let p = this.gl.createProgram();
        this.gl.attachShader(p,v);
        this.gl.attachShader(p,f);
        this.gl.linkProgram(p);
        
        if(this.gl.getProgramParameter(p, this.gl.LINK_STATUS)){
            this.gl.useProgram(p);
            return p;
        }else{
            console.log(alert(this.gl.getProgramInfoLog(p)));
            return null;
        }
    }

    addAttribute(prgIndex,name,stride){
        this.program[prgIndex].attLocation[name] = this.gl.getAttribLocation(this.program[prgIndex].program,name);
        this.program[prgIndex].attStride[name] = stride;
        
    }

    setAttribute(name,vbo,ibo){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,vbo.data);
        this.gl.enableVertexAttribArray(vbo.data);
        this.gl.vertexAttribPointer(this.currentProgram.attLocation[name], this.currentProgram.attStride[name], this.gl.FLOAT, false, 0, 0);
        this.currentProgram.VBOLength = vbo.length / this.currentProgram.attStride[name];
        if(ibo){
            this.currentProgram.indexLength = ibo.length;
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo.data);
        }
    }

    addUniform(prgIndex,name,type){
        this.program[prgIndex].uniLocation[name] = this.gl.getUniformLocation(this.program[prgIndex].program,name);
        this.program[prgIndex].uniType[name] = type;
    }

    setUniform(name,data){
        let type = this.currentProgram.uniType[name];
        switch(type){
            case 'uniformMatrix4fv':
                this.gl[type](this.currentProgram.uniLocation[name],false,data);
                break;
            default:
                this.gl[type](this.currentProgram.uniLocation[name],data);
        }
    }

    cVBO(data){
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return {data : vbo,length: data.length};
    }
    
    cIBO(data){
        let ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return {data : ibo,length : data.length};
    }

    cFbuffer(width,height,texUnit){
        this.fBuffer[texUnit] = this.getFbuffer(width,height,texUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D,this.fBuffer[texUnit].texture);
        this.gl.clearColor(0,0,0,1);
    }

    getFbuffer(width,height,texUnit){
        let frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);

        let fTexture = this.gl.createTexture();

        this.gl.activeTexture(this.gl.TEXTURE0 + texUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture};
    }

    activeTexture(name,tex){
        this.gl.activeTexture(tex);
        this.gl.bindTexture( this.gl.texture2D,this.fBuffer[name].texture);
    }

    selectFramebuffer(name){
        if(name == null){
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
        }else{
            if(this.fBuffer[name]){
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.fBuffer[name].framebuffer)
            }else{
                console.log("unknown fbuffer");
                return;
            }
        }   
    }

    selectUseProgram(prgIndex){
        this.currentProgram = this.program[prgIndex];
        this.gl.useProgram(this.currentProgram.program);
    }

    drawArrays(type){
        this.gl.drawArrays(type, 0, this.currentProgram.VBOLength);
    }

    drawElements(){
        this.gl.drawElements(this.gl.TRIANGLES,this.currentProgram.indexLength,this.gl.UNSIGNED_SHORT,0);
    }

    clear(){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    flush(){
        this.gl.flush();
    }
}