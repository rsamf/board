/**
 * Richard Franklin
 * objtransform.js
 * For object transformations (including camera, lightsource and GCs)
 * and object picking 
 */
function getObj(coords){
    let c = [Math.floor((coords[0]+1)*(canvas.width/2)), Math.floor((coords[1]+1)*(canvas.height/2)), 0];
    let pixels = new Uint8Array(4);
    gl.readPixels(c[0], c[1], 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if( pixels[0] > 200 && pixels[0]===pixels[1] && pixels[2] < 60)
        return 1;
    let index = alphaToIndex(pixels[3]);
    return index < 0 ? -1 : index + 2;
}

function indexToAlpha(index){
    return 254.0-index;
}

function alphaToIndex(alpha){
    return Math.floor(254.0-alpha);
}

function getModelMatrix(index){
    let pos, rot, sca;
    let offset, offsetBack;
    if(index === 0) {
       return;
    } else {
        index -= 2;
        let centerOfSpine = getCenterOf(spines[index]);
        offset = Vector.scale(centerOfSpine, -1);
        offsetBack = centerOfSpine;
        pos = new Float32Array(props[index].position);
        rot = new Float32Array(props[index].rotation);
        sca = new Float32Array(props[index].scale);   
    }
    
    let O = Matrix.getTranslated(offset);
    let OB = Matrix.getTranslated(offsetBack);
    let T = Matrix.getTranslated(pos);
    let R = Matrix.getRotated(rot);
    let S = Matrix.getScaled(sca);

    // first offset
    // then scale, rotate, and translate,
    // then offsetback to original position
    let result =  
    Matrix.multiply(O, 
        Matrix.multiply(S, 
                Matrix.multiply(R, 
                    Matrix.multiply(T, 
                        OB
                    )
                )
            )
        );
        //console.log(result);
        return result;
}

function cameraLookAround(objPosition){
    //Find Position
    let pos = [...cp.camera.animPosition, 1];
    let R = Matrix.getRotated([0,.005,0]);
    let newPos4 = Vector.transform4(R, pos);
    let newPos = [newPos4[0], newPos4[1], newPos4[2]];
    let newPosOffsetted = Vector.add(newPos, objPosition);

    //Find Rotation
    let a = Vector.normalize([0,0,3]);
    let b = Vector.normalize(newPos);
    // angle is the angle between vector of original position and vector of new position
    let angle = Math.acos(Vector.dot(a, b));
    if(newPos[0] < 0) angle = -angle; //This will prevent camera from rotating the other way
                                      //since Math.acos only returns x where 0 < x < PI (not 0 < x < 2*PI)
    let newRot = [0,angle,0];

    cp.camera.animPosition = newPos;
    cp.camera.animRotation = newRot;
    cp.camera.position = newPosOffsetted;
    cp.camera.rotation = newRot;
}

function getCenterOf(spine){
    let xMin = 1, xMax = -1, yMin = 1, yMax = -1;
    for(let i = 0; i < spine.length; i++){
        if(spine[i][0] < xMin){
            xMin = spine[i][0];
        } 
        if (spine[i][0] > xMax){
            xMax = spine[i][0];
        }
        if(spine[i][1] < yMin){
            yMin = spine[i][1];
        }
        if(spine[i][1] > yMax){
            yMax = spine[i][1];
        }
    }
    return [(xMin+xMax)/2, (yMin+yMax)/2, 0];
}

// gets spinal coordinates of given mesh
function getSpineOf(mesh){
    let v = mesh.vertices;
    let spine = [];
    for(let i = 0; i < v.length; i+=144){
        if(i===0) spine.push([v[i], v[i+1], 0]);
        spine.push([v[i+3], v[i+4], 0])
    }
    return spine;
}