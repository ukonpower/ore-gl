!function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/gl/js/",r(r.s=2)}([function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=r(1),i=function(){function t(t,e,r,n){this._values=new Float32Array([t,e,r,n])}return t.identity=function(){return new t(1,0,0,1)},Object.defineProperty(t.prototype,"values",{get:function(){return this._values},enumerable:!0,configurable:!0}),t.prototype.toString=function(){return this._values.toString()},t}();e.Matrix2x2=i;var o=function(){function t(t,e,r,n,i,o,s,u,a){this._values=new Float32Array([t,e,r,n,i,o,s,u,a])}return t.identity=function(){return new t(1,0,0,0,1,0,0,0,1)},Object.defineProperty(t.prototype,"values",{get:function(){return this._values},enumerable:!0,configurable:!0}),t.prototype.toString=function(){return this._values.toString()},t}();e.Matrix3x3=o;var s=function(){function t(t,e,r,n,i,o,s,u,a,l,c,h,f,g,p,v){this._values=new Float32Array([t,e,r,n,i,o,s,u,a,l,c,h,f,g,p,v])}return t.identity=function(){return new t(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)},t.translation=function(e,r,n){return new t(1,0,0,0,0,1,0,0,0,0,1,0,e,r,n,1)},t.scaling=function(e,r,n){return new t(e,0,0,0,0,r,0,0,0,0,n,0,0,0,0,1)},t.rotationX=function(e){var r=Math.sin(e),n=Math.cos(e);return new t(1,0,0,0,0,n,r,0,0,-r,n,0,0,0,0,1)},t.rotationY=function(e){var r=Math.sin(e),n=Math.cos(e);return new t(n,0,-r,0,0,1,0,0,r,0,n,0,0,0,0,1)},t.rotationZ=function(e){var r=Math.sin(e),n=Math.cos(e);return new t(n,r,0,0,-r,n,0,0,0,0,1,0,0,0,0,1)},t.rotationAround=function(t,e){return n.Quaternion.rotationAround(t,e).toRotationMatrix4()},t.lookAt=function(e,r,n){var i=e.sub(r).normalize(),o=n.cross(i).normalize(),s=i.cross(o).normalize();return new t(o.x,s.x,i.x,0,o.y,s.y,i.y,0,o.z,s.z,i.z,0,-e.dot(o),-e.dot(s),-e.dot(i),1)},t.orthographic=function(e){var r=e.top,n=e.bottom,i=e.left,o=e.right,s=e.near,u=e.far;return new t(2/(o-i),0,0,0,0,2/(r-n),0,0,0,0,-2/(u-s),0,-(o+i)/(o-i),-(r+n)/(r-n),-(u+s)/(u-s),1)},t.frustum=function(e){var r=e.top,n=e.bottom,i=e.left,o=e.right,s=e.near,u=e.far;return new t(2*s/(o-i),0,0,0,0,2*s/(r-n),0,0,(o+i)/(o-i),(r+n)/(r-n),-(u+s)/(u-s),-1,0,0,-2*u*s/(u-s),0)},t.perspective=function(e){var r=e.near*Math.tan(.5*e.fovYRadian),n=2*r,i=e.aspectRatio*n,o=-.5*i,s=o+i,u=r-n;return t.frustum({top:r,bottom:u,left:o,right:s,near:e.near,far:e.far})},t.prototype.mulByMatrix4x4=function(e){var r=this._values[0],n=this._values[4],i=this._values[8],o=this._values[12],s=this._values[1],u=this._values[5],a=this._values[9],l=this._values[13],c=this._values[2],h=this._values[6],f=this._values[10],g=this._values[14],p=this._values[3],v=this._values[7],x=this._values[11],y=this._values[15],m=e.values[0],d=e.values[4],_=e.values[8],b=e.values[12],E=e.values[1],T=e.values[5],R=e.values[9],F=e.values[13],P=e.values[2],A=e.values[6],w=e.values[10],B=e.values[14],O=e.values[3],M=e.values[7],U=e.values[11],z=e.values[15];return new t(r*m+n*E+i*P+o*O,s*m+u*E+a*P+l*O,c*m+h*E+f*P+g*O,p*m+v*E+x*P+y*O,r*d+n*T+i*A+o*M,s*d+u*T+a*A+l*M,c*d+h*T+f*A+g*M,p*d+v*T+x*A+y*M,r*_+n*R+i*w+o*U,s*_+u*R+a*w+l*U,c*_+h*R+f*w+g*U,p*_+v*R+x*w+y*U,r*b+n*F+i*B+o*z,s*b+u*F+a*B+l*z,c*b+h*F+f*B+g*z,p*b+v*F+x*B+y*z)},t.prototype.mulByMatrix4=function(t){return this.mulByMatrix4x4(t)},t.prototype.translate=function(e,r,n){var i=t.translation(e,r,n);return this.mulByMatrix4x4(i)},t.prototype.scale=function(e,r,n){var i=t.scaling(e,r,n);return this.mulByMatrix4x4(i)},t.prototype.rotateX=function(e){var r=t.rotationX(e);return this.mulByMatrix4x4(r)},t.prototype.rotateY=function(e){var r=t.rotationY(e);return this.mulByMatrix4x4(r)},t.prototype.rotateZ=function(e){var r=t.rotationZ(e);return this.mulByMatrix4x4(r)},t.prototype.rotateAround=function(e,r){var n=t.rotationAround(e,r);return this.mulByMatrix4x4(n)},Object.defineProperty(t.prototype,"values",{get:function(){return this._values},enumerable:!0,configurable:!0}),t.prototype.toString=function(){return this._values.toString()},t}();e.Matrix4x4=s,e.Matrix2=i,e.Matrix3=o,e.Matrix4=s},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=r(0),i=function(){function t(t,e,r,n){this._values=new Float32Array([t,e,r,n])}return t.rotationAround=function(e,r){var n=Math.sin(r/2),i=Math.cos(r/2);return new t(e.x*n,e.y*n,e.z*n,i)},t.prototype.normalize=function(){var e=this.magnitude;if(0===e)return this;var r=1/e;return new t(this.x*r,this.y*r,this.z*r,this.w*r)},t.prototype.add=function(e){return new t(this.x+e.x,this.y+e.y,this.z+e.z,this.w+e.w)},t.prototype.mulByScalar=function(e){return new t(this.x*e,this.y*e,this.z*e,this.w*e)},t.prototype.dot=function(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w},t.prototype.slerp=function(t,e,r){void 0===r&&(r={chooseShorterAngle:!0});var n=this.dot(t),i=t;n<0&&(n=-n,i=t.mulByScalar(-1));var o=Math.acos(n),s=Math.sin(o),u=this.mulByScalar(Math.sin((1-e)*o)/s),a=i.mulByScalar(Math.sin(e*o)/s);return u.add(a)},Object.defineProperty(t.prototype,"magnitude",{get:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"norm",{get:function(){return this.magnitude},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"x",{get:function(){return this._values[0]},set:function(t){this._values[0]=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"y",{get:function(){return this._values[1]},set:function(t){this._values[1]=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"z",{get:function(){return this._values[2]},set:function(t){this._values[2]=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"w",{get:function(){return this._values[3]},set:function(t){this._values[3]=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"values",{get:function(){return this._values},enumerable:!0,configurable:!0}),t.prototype.toRotationMatrix4=function(){var t=this.x,e=this.y,r=this.z,i=this.w,o=1-2*e*e-2*r*r,s=2*t*e-2*i*r,u=2*t*r+2*i*e,a=2*t*e+2*i*r,l=1-2*t*t-2*r*r,c=2*e*r-2*i*t,h=2*t*r-2*i*e,f=2*e*r+2*i*t,g=1-2*t*t-2*e*e;return new n.Matrix4x4(o,a,h,0,s,l,f,0,u,c,g,0,0,0,0,1)},t.prototype.toString=function(){return"Quaternion("+this.x+", "+this.y+", "+this.z+", "+this.w+")"},t}();e.Quaternion=i},function(t,e,r){const{Vector3:n,Vector4:i,Matrix4:o}=r(3),s=r(6),u=r(8),a=r(9),l=r(10),c=r(11),h=r(12);var f,g,p,v,x=0;window.addEventListener("load",()=>{(f=document.getElementById("canvas")).width=1*window.innerWidth,f.height=1*window.innerHeight,g=new s(f,{r:0,g:0,b:0}),p=g.getProgram(a,u),initParticlePrg=g.getProgram(l,h),v=g.getProgram(l,c),function(){g.addAttribute(initParticlePrg,"position",3),g.addUniform(initParticlePrg,"resolution","uniform2fv"),g.addAttribute(v,"position",3),g.addUniform(v,"resolution","uniform2fv"),g.addUniform(v,"posTexture","uniform1i"),g.addUniform(v,"time","uniform1f"),g.addAttribute(p,"index",1),g.addUniform(p,"mvp","uniformMatrix4fv"),g.addUniform(p,"time","uniform1f"),g.addUniform(p,"num","uniform1f"),g.addUniform(p,"posTexture","uniform1i");var t=[],e=[];let r=512;for(var i=0;i<r;i++)for(var s=0;s<r;s++)t.push(0,0,0),e.push(s+i*r);g.cVBO(t);var u=g.cVBO(e);g.cFbuffer(r,r,0,!0),g.cFbuffer(r,r,1,!0);var a=0;g.selectFramebuffer(0),g.selectUseProgram(initParticlePrg),g.setAttribute("position",g.screenVBO,g.screenIBO),g.setUniform("resolution",[r,r]),g.clear(),g.drawElements(),g.flush(),function t(){x+=.01666;const e=o.lookAt(new n(0,2,5),new n(0,0,0),new n(0,1,0));const i=o.perspective({fovYRadian:60*Math.PI/180,aspectRatio:window.innerWidth/window.innerHeight,near:.1,far:10});const s=o.identity().rotateY(0).scale(2,2,2);const l=i.mulByMatrix4(e).mulByMatrix4(s);a=0==a?1:0;g.selectFramebuffer(a);g.selectUseProgram(v);g.setAttribute("position",g.screenVBO,g.screenIBO);g.setUniform("posTexture",0==a?1:0);g.setUniform("resolution",[r,r]);g.setUniform("time",x);g.clear();g.drawElements();g.flush();g.selectFramebuffer(null);g.selectUseProgram(p);g.setAttribute("index",u,null);g.setUniform("mvp",l.values);g.setUniform("num",r);g.setUniform("time",x);g.setUniform("posTexture",a);g.clear();g.drawArrays(g.gl.POINTS);g.flush();requestAnimationFrame(t)}()}()},!1)},function(t,e,r){"use strict";function n(t){for(var r in t)e.hasOwnProperty(r)||(e[r]=t[r])}Object.defineProperty(e,"__esModule",{value:!0}),n(r(4)),n(r(0)),n(r(1))},function(t,e,r){"use strict";var n=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])};return function(e,r){function n(){this.constructor=e}t(e,r),e.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n)}}();Object.defineProperty(e,"__esModule",{value:!0});var i=r(5),o=function(t){function e(e,r){var n=t.call(this)||this;return n._values=new Float32Array([e,r]),n}return n(e,t),e.prototype.add=function(t){return new e(this.x+t.x,this.y+t.y)},e.prototype.sub=function(t){return new e(this.x-t.x,this.y-t.y)},e.prototype.mulByScalar=function(t){return new e(this.x*t,this.y*t)},e}(i.Vector2Base);e.Float32Vector2=o;var s=function(t){function e(e,r,n){var i=t.call(this)||this;return i._values=new Float32Array([e,r,n]),i}return n(e,t),e.prototype.add=function(t){return new e(this.x+t.x,this.y+t.y,this.z+t.z)},e.prototype.sub=function(t){return new e(this.x-t.x,this.y-t.y,this.z-t.z)},e.prototype.mulByScalar=function(t){return new e(this.x*t,this.y*t,this.z*t)},e.prototype.dot=function(t){return this.x*t.x+this.y*t.y+this.z*t.z},e.prototype.cross=function(t){return new e(this.y*t.z-this.z*t.y,this.z*t.x-this.x*t.z,this.x*t.y-this.y*t.x)},e.prototype.normalize=function(){var t=this.magnitude;return 0===t?this:new e(this.x/t,this.y/t,this.z/t)},Object.defineProperty(e.prototype,"xy",{get:function(){return new o(this.x,this.y)},enumerable:!0,configurable:!0}),e}(i.Vector3Base);e.Float32Vector3=s;var u=function(t){function e(e,r,n,i){var o=t.call(this)||this;return o._values=new Float32Array([e,r,n,i]),o}return n(e,t),e.prototype.add=function(t){return new e(this.x+t.x,this.y+t.y,this.z+t.z,this.w+t.w)},e.prototype.sub=function(t){return new e(this.x-t.x,this.y-t.y,this.z-t.z,this.w-t.w)},e.prototype.mulByScalar=function(t){return new e(this.x*t,this.y*t,this.z*t,this.w*t)},Object.defineProperty(e.prototype,"xyz",{get:function(){return new s(this.x,this.y,this.z)},enumerable:!0,configurable:!0}),e}(i.Vector4Base);e.Float32Vector4=u,e.Vector2=o,e.Vector3=s,e.Vector4=u},function(t,e,r){"use strict";var n=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])};return function(e,r){function n(){this.constructor=e}t(e,r),e.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n)}}();Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(){}return Object.defineProperty(t.prototype,"values",{get:function(){return this._values},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"magnitude",{get:function(){var t=this._values.reduce(function(t,e){return t+Math.pow(e,2)},0);return Math.sqrt(t)},enumerable:!0,configurable:!0}),t.prototype.toString=function(){return"Vector"+this._values.length+"("+this._values.join(", ")+")"},t}();e.VectorBase=i;var o=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return n(e,t),Object.defineProperty(e.prototype,"x",{get:function(){return this._values[0]},set:function(t){this._values[0]=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"y",{get:function(){return this._values[1]},set:function(t){this._values[1]=t},enumerable:!0,configurable:!0}),e}(i);e.Vector2Base=o;var s=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return n(e,t),Object.defineProperty(e.prototype,"x",{get:function(){return this._values[0]},set:function(t){this._values[0]=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"y",{get:function(){return this._values[1]},set:function(t){this._values[1]=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"z",{get:function(){return this._values[2]},set:function(t){this._values[2]=t},enumerable:!0,configurable:!0}),e}(i);e.Vector3Base=s;var u=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return n(e,t),Object.defineProperty(e.prototype,"x",{get:function(){return this._values[0]},set:function(t){this._values[0]=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"y",{get:function(){return this._values[1]},set:function(t){this._values[1]=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"z",{get:function(){return this._values[2]},set:function(t){this._values[2]=t},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"w",{get:function(){return this._values[3]},set:function(t){this._values[3]=t},enumerable:!0,configurable:!0}),e}(i);e.Vector4Base=u},function(t,e,r){const n=r(7);t.exports=class{constructor(t,e){this.gl=t.getContext("webgl"),this.canvas=t,this.program=[],this.fBuffer={},this.currentProgram,this.ext,this.gl.enable(this.gl.BLEND),this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA),this.gl.clearColor(e.r,e.g,e.b,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.ext=this.getWebGLExtensions(),this.screenVBO=this.cVBO([-1,1,0,1,1,0,-1,-1,0,1,-1,0]),this.screenIBO=this.cIBO([0,1,2,1,3,2])}getProgram(t,e){var r=this.cShader(t,this.gl.VERTEX_SHADER),i=this.cShader(e,this.gl.FRAGMENT_SHADER);return this.program.push(new n(this.cProgram(r,i))),this.program.length-1}cShader(t,e){var r=this.gl.createShader(e);return this.gl.shaderSource(r,t),this.gl.compileShader(r),this.gl.getShaderParameter(r,this.gl.COMPILE_STATUS)?r:(console.log(this.gl.getShaderInfoLog(r)),null)}cProgram(t,e){let r=this.gl.createProgram();return this.gl.attachShader(r,t),this.gl.attachShader(r,e),this.gl.linkProgram(r),this.gl.getProgramParameter(r,this.gl.LINK_STATUS)?(this.gl.useProgram(r),r):(console.log(alert(this.gl.getProgramInfoLog(r))),null)}addAttribute(t,e,r){this.program[t].attLocation[e]=this.gl.getAttribLocation(this.program[t].program,e),this.program[t].attStride[e]=r}setAttribute(t,e,r){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.data),this.gl.enableVertexAttribArray(this.currentProgram.attLocation[t]),this.gl.vertexAttribPointer(this.currentProgram.attLocation[t],this.currentProgram.attStride[t],this.gl.FLOAT,!1,0,0),this.currentProgram.VBOLength=e.length/this.currentProgram.attStride[t],r&&(this.currentProgram.indexLength=r.length,this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,r.data))}addUniform(t,e,r){this.program[t].uniLocation[e]=this.gl.getUniformLocation(this.program[t].program,e),this.program[t].uniType[e]=r}setUniform(t,e){let r=this.currentProgram.uniType[t];switch(r){case"uniformMatrix4fv":this.gl[r](this.currentProgram.uniLocation[t],!1,e);break;default:this.gl[r](this.currentProgram.uniLocation[t],e)}}cVBO(t){let e=this.gl.createBuffer();return this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(t),this.gl.STATIC_DRAW),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),{data:e,length:t.length}}cIBO(t){let e=this.gl.createBuffer();return this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Int16Array(t),this.gl.STATIC_DRAW),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),{data:e,length:t.length}}cFbuffer(t,e,r,n=!1){this.fBuffer[r]=n?this.getFbufferFloat(t,e,r):this.getFbuffer(t,e,r),this.gl.bindTexture(this.gl.TEXTURE_2D,this.fBuffer[r].texture),this.gl.clearColor(0,0,0,1)}getFbuffer(t,e,r){let n=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,n);let i=this.gl.createRenderbuffer();this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,i),this.gl.renderbufferStorage(this.gl.RENDERBUFFER,this.gl.DEPTH_COMPONENT16,t,e),this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER,this.gl.DEPTH_ATTACHMENT,this.gl.RENDERBUFFER,i);let o=this.gl.createTexture();return this.gl.activeTexture(this.gl.TEXTURE0+r),this.gl.bindTexture(this.gl.TEXTURE_2D,o),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,t,e,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,null),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,o,0),this.gl.bindTexture(this.gl.TEXTURE_2D,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),{framebuffer:n,renderbuffer:i,texture:o}}getFbufferFloat(t,e,r){if(null==this.ext||null==this.ext.textureFloat&&null==this.ext.textureHalfFloat)return void console.log("float texture not support");let n=this.ext.textureHalfFloat.HALF_FLOAT_OES,i=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,i);let o=this.gl.createTexture();return this.gl.activeTexture(this.gl.TEXTURE0+r),this.gl.bindTexture(this.gl.TEXTURE_2D,o),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,t,e,0,this.gl.RGBA,n,null),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.NEAREST),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.NEAREST),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,o,0),this.gl.bindTexture(this.gl.TEXTURE_2D,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),{framebuffer:i,texture:o}}selectFramebuffer(t){if(null==t)this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);else{if(!this.fBuffer[t])return void console.log("unknown fbuffer");this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.fBuffer[t].framebuffer)}}selectUseProgram(t){this.currentProgram=this.program[t],this.gl.useProgram(this.currentProgram.program)}drawArrays(t){this.gl.drawArrays(t,0,this.currentProgram.VBOLength)}drawElements(){this.gl.drawElements(this.gl.TRIANGLES,this.currentProgram.indexLength,this.gl.UNSIGNED_SHORT,0)}clear(){this.gl.clear(this.gl.COLOR_BUFFER_BIT)}flush(){this.gl.flush()}getWebGLExtensions(){return{elementIndexUint:this.gl.getExtension("OES_element_index_uint"),textureFloat:this.gl.getExtension("OES_texture_float"),textureHalfFloat:this.gl.getExtension("OES_texture_half_float")}}}},function(t,e){t.exports=class{constructor(t){this.program=t,this.attLocation={},this.attStride={},this.uniLocation={},this.uniType={},this.VBOLength=0,this.indexLength=0}}},function(t,e){t.exports="precision highp float;\r\n\r\nvarying vec3 vColor;\r\nvoid main(){\r\n    gl_FragColor = vec4(vColor,1.0);\r\n}"},function(t,e){t.exports="precision highp float;\r\n\r\nattribute float index;\r\nuniform float num;\r\nuniform sampler2D posTexture;\r\nuniform mat4 mvp;\r\nuniform float time;\r\n\r\nvarying vec3 vColor;\r\n\r\nvoid main(){\r\n    vec2 texPos = vec2(mod(index,num),index / num) / vec2(num);\r\n    vec3 pos = texture2D(posTexture,texPos).xyz;\r\n    gl_Position = mvp * vec4(pos * 1.0,1.0);\r\n    gl_PointSize = 2.0;\r\n\r\n    vColor = vec3(1.0);\r\n}\r\n"},function(t,e){t.exports="precision highp float;\n\nattribute vec3 position;\nvoid main(){\n    gl_Position = vec4(position,1.0);\n}\n"},function(t,e){t.exports="precision highp float;\n\nuniform sampler2D posTexture;\nuniform vec2 resolution;\nuniform float time;\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex \n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : stegu\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//               https://github.com/stegu/webgl-noise\n// \n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n     return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n  { \n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i); \n  vec4 p = permute( permute( permute( \n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n  vec3 snoise3D(vec3 pos){\n      vec3 res;\n      res.x = snoise(pos + vec3(0.0,1.0,3.0));\n      res.y = snoise(pos - vec3(5.0,1.0,3.0));\n      res.z = snoise(pos + vec3(4.0,5.0,3.0));\n      return res;\n  }\n\nvoid main(){\n  vec2 uv = gl_FragCoord.xy / resolution;\n  vec2 uv2 = gl_FragCoord.xy + 100.0 / resolution;\n  vec3 pos = texture2D(posTexture,uv).xyz;\n  vec3 pos2 = texture2D(posTexture,uv2).xyz;\n  \n  if(length(pos) >= 1.2){\n    pos = snoise3D(pos);\n  }else{\n    vec3 vel = snoise3D(pos * 1.2 + vec3(0,0,time )) * .02;\n    pos += vel;\n  }\n\n  float rad = uv.x * 0.1;\n  // float rad = 0.01;\n  // mat3 rot = mat3(\n  //   sin(rad),-cos(rad),0.0,\n  //   cos(rad),sin(rad),0.0,\n  //   0.0,0.0,0.0\n  // );\n  // mat3 rot = mat3(\n  //   cos(rad),-sin(rad),0.0,\n  //   sin(rad),cos(rad),0.0,\n  //   0.0,0.0,0.0\n  // );\n\n  // pos *= rot;\n  \n  gl_FragColor = vec4(pos,1.0);\n}"},function(t,e){t.exports="precision highp float;\nuniform vec2 resolution;\n\nvoid main(){\n    vec2 uv = gl_FragCoord.xy / resolution;\n    vec3 c = vec3(uv - 0.5,0.0);\n    // vec3 c = vec3((gl_FragCoord.x * gl_FragCoord.y + gl_FragCoord.x) * 0.0001 - 4.0,0.0 ,0.0);\n    gl_FragColor = vec4(c,1.0);\n}"}]);