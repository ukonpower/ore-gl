module.exports =  class ProParam{
    constructor(program){
        this.program = program;
        this.attLocation = {};
        this.attStride = {};
        this.uniLocation = {};
        this.uniType = {};
        this.VBOLength = 0;
        this.indexLength = 0;
    }
}