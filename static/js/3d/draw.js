/**
 * Richard Franklin
 * draw.js
 * Functionality for drawing to program
 */


function drawTriangles(points, indicees, colors, model, selected) {
    // Set proj and view matrices
    let proj = getProj();
    let view = getView();
                

    // vertex position attribute
    gl.useProgram(program.triangleUnlit);
    

    let vertexBuffer = createBufferObject(new Float32Array(points), gl.ARRAY_BUFFER);
    let indexBuffer = createBufferObject(new Uint16Array(indicees), gl.ELEMENT_ARRAY_BUFFER);
    
    gl.vertexAttribPointer(
        program.triangleUnlit.positionAttribute, //attrib location
        3, //num elements per attrib,
        gl.FLOAT, //Type of elements,
        gl.FALSE, //is normalized?
        3 * Float32Array.BYTES_PER_ELEMENT, //size of a vertex
        0 // offset
    );
    gl.enableVertexAttribArray(program.triangleUnlit.positionAttribute);


    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
     gl.vertexAttribPointer(
        program.triangleUnlit.colorAttribute,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(program.triangleUnlit.colorAttribute);
    
    // mvp matrix passed into shader
    gl.uniformMatrix4fv(program.triangleUnlit.projUniform, false, proj);
    gl.uniformMatrix4fv(program.triangleUnlit.viewUniform, false, view);
    gl.uniformMatrix4fv(program.triangleUnlit.modelUniform, false, model); 
    gl.uniform1i(program.triangleUnlit.selectedUniform, selected ? true : false);
    

    //draw from buffers
    // mode, index count, type, offset
    gl.drawElements(gl.TRIANGLES, indicees.length, gl.UNSIGNED_SHORT, 0);
}

function drawTrianglesLit(points, indicees, normals, color, uvs, model, selected, alpha, img) {
    
    // vertex position attribute
    gl.useProgram(program.triangle);
    

    let vertexBuffer = createBufferObject(new Float32Array(points), gl.ARRAY_BUFFER);
    let indexBuffer = createBufferObject(new Uint16Array(indicees), gl.ELEMENT_ARRAY_BUFFER);
    
    gl.vertexAttribPointer(
        program.triangle.positionAttribute, //attrib location
        3, //num elements per attrib,
        gl.FLOAT, //Type of elements,
        gl.FALSE, //is normalized?
        3 * Float32Array.BYTES_PER_ELEMENT, //size of a vertex
        0 // offset
    );
    gl.enableVertexAttribArray(program.triangle.positionAttribute);

    let normalBuffer = createBufferObject(new Float32Array(normals), gl.ARRAY_BUFFER);  
    gl.vertexAttribPointer(
        program.triangle.normalAttribute, //attrib location
        3, //num elements per attrib,
        gl.FLOAT, //Type of elements,
        gl.FALSE, //is normalized?
        3 * Float32Array.BYTES_PER_ELEMENT, //size of a vertex
        0 // offset
    );
    gl.enableVertexAttribArray(program.triangle.normalAttribute);
    
    // mvp matrix passed into shader
    gl.uniformMatrix4fv(program.triangle.projUniform, false, getProj());
    gl.uniformMatrix4fv(program.triangle.viewUniform, false, getView());
    gl.uniformMatrix4fv(program.triangle.modelUniform, false, model);
    // lighting stuff
    gl.uniform3fv(program.triangle.d_colorUniform, new Float32Array(color));
    gl.uniform3fv(program.triangle.viewFromUniform, new Float32Array(cp.camera.position));
    gl.uniform1i(program.triangle.selectedUniform, selected ? true : false);
    gl.uniform1f(program.triangle.idUniform, alpha);

    //texturing
    if(uvs){
        let uvBuffer = createBufferObject(new Float32Array(uvs), gl.ARRAY_BUFFER);    
        gl.vertexAttribPointer(
            program.triangle.txCoordAttribute, //attrib location
            2, //num elements per attrib,
            gl.FLOAT, //Type of elements,
            gl.FALSE, //is normalized?
            2 * Float32Array.BYTES_PER_ELEMENT, //size of a vertex
            0 // offset
        );
        gl.enableVertexAttribArray(program.triangle.txCoordAttribute);
        let texture = createTexture(img);
        gl.uniform1f(program.triangle.useTxUniform, img ? 1.0 : 0.0);
        gl.uniform1i(program.triangle.samplerUniform, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    //draw from buffers
    // mode, index count, type, offset
    gl.drawElements(gl.TRIANGLES, indicees.length, gl.UNSIGNED_SHORT, 0);
}

function drawPoints(points, colors) {
    // vertex position attribute
    gl.useProgram(program.point);
    

    let vertexBuffer = createBufferObject(new Float32Array(points), gl.ARRAY_BUFFER);
    
    gl.vertexAttribPointer(
        program.point.positionAttribute, //attrib location
        3, //num elements per attrib,
        gl.FLOAT, //Type of elements,
        gl.FALSE, //is normalized?
        3 * Float32Array.BYTES_PER_ELEMENT, //size of a vertex
        0 // offset
    );
    gl.enableVertexAttribArray(program.point.positionAttribute);


    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
     gl.vertexAttribPointer(
        program.point.colorAttribute,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(program.point.colorAttribute);
        
    //draw from buffers
    // mode, start, count
    gl.drawArrays(gl.POINTS, 0, points.length/3);
}

function drawLines(points, colors, selected) {
    // vertex position attribute
    gl.useProgram(program.line);

    let vertexBuffer = createBufferObject(new Float32Array(points), gl.ARRAY_BUFFER);
    
    gl.vertexAttribPointer(
        program.line.positionAttribute, //attrib location
        3, //num elements per attrib,
        gl.FLOAT, //Type of elements,
        gl.FALSE, //is normalized?
        3 * Float32Array.BYTES_PER_ELEMENT, //size of a vertex
        0 // offset
    );
    gl.enableVertexAttribArray(program.line.positionAttribute);


    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
     gl.vertexAttribPointer(
        program.line.colorAttribute,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(program.line.colorAttribute);
    gl.uniform1i(program.line.selectedUniform, selected ? true : false);
        
    // mode start count
    gl.drawArrays(gl.LINE_STRIP, 0, points.length/3);
}

function createBufferObject(data, type) {
    let buffer_id = gl.createBuffer();
    if (!buffer_id) {
        throw new Error('Failed to create the buffer object');
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(type, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(type, data, gl.STATIC_DRAW);

    return buffer_id;
}

function createTexture(image){
    let texture = gl.createTexture(); 
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);   
    if(image){
        gl.texImage2D(
            gl.TEXTURE_2D, // type
            0, // level
            gl.RGBA, //internal format
            gl.RGBA, // srcFormat
            gl.UNSIGNED_BYTE, //srcType
            image
        );
    }
    return texture;
}

function getProj(){
    return cp.ortho ? 
        Matrix.getOrtho(-1.0, 1.0, -1.0, 1.0, -10, 1000) :
        Matrix.getPerspective(cp.camera.fov, canvas.width/canvas.height, 1, 100);
}

function getView(){
    let cam = cp.camera;
    let out = Vector.add(cam.position, [0,0,-100]); //(0,0,-100)
    let center = Vector.transform4(
        Matrix.getRotated(cam.rotation), [...out, 1.0]
    );
    return Matrix.getLookAt(
        cam.position[0], cam.position[1], cam.position[2],
        center[0], center[1], center[2],
        0, 1, 0
    );
}

function clear(gl=gl){
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


// parse hex color of the form #XXXXXX to an array of rgb values
function hexToRGB(hex, prefixLength=1){
    let r = parseInt("0x" + hex.substring(prefixLength, prefixLength + 2));
    let g = parseInt("0x" + hex.substring(prefixLength + 2, prefixLength + 4));
    let b = parseInt("0x" + hex.substring(prefixLength + 4, prefixLength + 6));
    return [r/255, g/255, b/255];
    //#234567
}