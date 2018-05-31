
/**
 * Richard Franklin
 * setup.js
 * Sets up canvas, gl, shaders, and program
 */

const canvas = document.getElementById("canvas");
const gl = initGL();
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);
const program = {
    triangle : initProgram(getTriangleShaders(true)),
    triangleUnlit : initProgram(getTriangleShaders(false)),
    point : initProgram(getPointShaders()),
    line : initProgram(getLineShaders())
};


/*
    Setup Canvas and GL
*/
function initGL(){
    let gl = canvas.getContext('webgl');
    if(!gl) {
        alert('WebGL not supported in this browser');
        throw Error();
    }
    clear(gl);            
    return gl;
}

function getTriangleShaders(lit){
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //Create and compile shaders from source
    if(lit){
        gl.shaderSource(vertexShader, [
            'precision mediump float;',
            //Transform
            'uniform mat4 proj;',
            'uniform mat4 view;',
            'uniform mat4 model;',
            'attribute vec3 position;',
            'uniform float id;', 
            'uniform bool selected;',           
            //lighting
            'attribute vec3 normal;',
            'uniform vec3 viewFrom;', 
            'uniform float shininess;', 
            'uniform float specularOn;',
            'uniform vec3 d_color;',
            'uniform vec3 s_color;',
            'uniform vec3 a_color;',
            'varying vec3 vBaseColor;',
            'varying vec3 vSpecularColor;',
            'varying float vId;',
            //texturing
            'attribute vec2 txCoord;',
            'varying vec2 vTxCoord;',


         
    
            'void main() {',
                'vec3 diffuse;',
                'vec3 specular;',
                'vec3 _normal = normalize(vec3(model * vec4(normal, 1.0)));',

                // 3 DIRECTIONAL LIGHT SOURCES
                // BOTTOM
                'diffuse = 0.3 * max(dot(_normal, vec3(0,-1,-1)) * d_color, 0.0);',
                // TOP LEFT
                'diffuse += 0.3 * max(dot(_normal, vec3(-1,1,-1)) * d_color, 0.0);',
                // TOP RIGHT
                'diffuse += 0.3 * max(dot(_normal, vec3(1,1,-1)) * d_color, 0.0);',
               

                // Set varying variables to pass to fragment shader
                'vBaseColor = diffuse + a_color;',
                'if(selected) vBaseColor += vec3(.1,.1,.1);',
                'vSpecularColor = specular;',
                'vTxCoord = txCoord;',

                // plant vertex
                'gl_Position = proj * model * view * vec4(position, 1.0);',
            '}'
         
        ].join('\n'));
        gl.shaderSource(fragmentShader, [
            'precision mediump float;',
            //BaseColor is Diffuse, Ambient, and highlighting/selected color all added together
            'varying vec3 vBaseColor;',
            'varying vec3 vSpecularColor;',
            'uniform float id;',
            'uniform float useTx;',
            //Texturing
            'varying vec2 vTxCoord;',
            'uniform sampler2D sampler;',
            
            'void main() {',

                // color contribution of material which is of lighting and texture combined
                // lighting
                'vec3 l = (1.0 - useTx) * vBaseColor + vSpecularColor;',
                // texture
                'vec3 t = useTx * (vBaseColor * vec3(texture2D(sampler, vTxCoord))) + vSpecularColor;',

                // total color is of material and reflectivity 
                'gl_FragColor = vec4(l + t, id);',
            '}'
        ].join('\n'));
    } else {
        gl.shaderSource(vertexShader, [
            'precision mediump float;',
            'attribute vec3 position;',
            'attribute vec3 color;',
            'uniform mat4 proj;',
            'uniform mat4 view;',
            'uniform mat4 model;',
            'uniform bool selected;',
            'varying vec4 vColor;',
    
            'void main() {',
                'vColor = vec4(selected ? color + vec3(0.1,0.1,0.1) : color, 1.0);',
                'gl_Position = proj * view * model * vec4(position, 1.0);',                
            '}'
         
        ].join('\n'));
        gl.shaderSource(fragmentShader, [
            'precision mediump float;',
            'varying vec4 vColor;',
            'void main() {',
                'gl_FragColor = vColor;',
            '}'
        ].join('\n'));
    }

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    //Check for compile-time errors
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw Error("error compiling vertexShader");
    }
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw Error("error compiling fragmentShader");
    }
    return {
        vertex : vertexShader,
        fragment : fragmentShader
    };
}

function getPointShaders(){
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //Create and compile shaders from source
    gl.shaderSource(vertexShader, [
        'precision mediump float;',
        'attribute vec3 position;',
        'attribute vec3 color;',
        'varying vec4 vColor;',

        'void main() {',
            'gl_Position = vec4(position, 1.0);',
            'gl_PointSize = 20.0;',
            'vColor = vec4(color, 1.0);',
        '}'
    ].join('\n'));
    gl.shaderSource(fragmentShader, [
        'precision mediump float;',
        'varying vec4 vColor;',
        'void main() {',
            'gl_FragColor = vColor;',
        '}'
    ].join('\n'));

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    //Check for compile-time errors
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw Error("error compiling vertexShader");
    }
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw Error("error compiling fragmentShader");
    }
    return {
        vertex : vertexShader,
        fragment : fragmentShader
    };
} 

function getLineShaders(){
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //Create and compile shaders from source
    gl.shaderSource(vertexShader, [
        'precision mediump float;',
        'attribute vec3 position;',
        'attribute vec3 color;',
        'varying vec4 vColor;',
        'uniform bool selected;',

        'void main() {',
            'gl_Position = vec4(position, 1.0);',
            'vColor = vec4(selected ? color + vec3(.5,.5,.5) : color, 1.0);',
        '}'
    ].join('\n'));
    gl.shaderSource(fragmentShader, [
        'precision mediump float;',
        'varying vec4 vColor;',
        'void main() {',
            'gl_FragColor = vColor;',
        '}'
    ].join('\n'));

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    //Check for compile-time errors
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw Error("error compiling vertexShader");
    }
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw Error("error compiling fragmentShader");
    }
    return {
        vertex : vertexShader,
        fragment : fragmentShader
    };
}


/*
    Create Program
*/
function initProgram(shaders){
    let program = gl.createProgram();
    //Attach vertex and fragment shaders to program
    gl.attachShader(program, shaders.vertex);
    gl.attachShader(program, shaders.fragment);
    // Error Checking
    // Check if linked
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw Error("Error linking program", gl.getProgramInfoLog(program));
    }
    // Check if validated
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        throw Error("Error validating program", gl.getProgramInfoLog(program));
    }

    program.positionAttribute = gl.getAttribLocation(program, 'position');
    program.colorAttribute = gl.getAttribLocation(program, 'color');
    program.normalAttribute = gl.getAttribLocation(program, 'normal');
    program.viewFromUniform = gl.getUniformLocation(program, 'viewFrom');
    program.projUniform = gl.getUniformLocation(program, 'proj');
    program.viewUniform = gl.getUniformLocation(program, 'view'); 
    program.modelUniform = gl.getUniformLocation(program, 'model');
    program.d_colorUniform = gl.getUniformLocation(program, 'd_color');
    program.s_colorUniform = gl.getUniformLocation(program, 's_color');
    program.a_colorUniform = gl.getUniformLocation(program, 'a_color');  
    program.specularOnUniform = gl.getUniformLocation(program, 'specularOn');
    program.selectedUniform = gl.getUniformLocation(program, 'selected');
    program.idUniform = gl.getUniformLocation(program, 'id');
    //texturing
    program.txCoordAttribute = gl.getAttribLocation(program, 'txCoord');
    program.useTxUniform = gl.getUniformLocation(program, 'useTx');
    return program;
}