(function(){

    // drawing
    const DrawingState = {
        Active : "ACTIVE",
        Inactive : "INACTIVE"
    };
    const DragState = {
        Active : "ACTIVE",
        Inactive : "INACTIVE"
    };
    let drawingState = DrawingState.Inactive,
        // dragstates used for modifying translation, and rotation
        dragState = DragState.Inactive,
        zDragState = DragState.Inactive,
        rDragState = DragState.Inactive,
        lastPoint = [0,0,0]
    ;

    attachDrawFunctionToEvents(draw);
    attachDrawFunctionToLoop(draw);
    attachDrawFunctionToNetworking(draw);
    draw();
    
    canvas.onmousedown = e => {
        const isRightClick = e.which === 3 || e.ctrlKey || e.altKey;
        const isMiddleClick = e.which === 2;
        const noneIsSelected = selected === -1;
        const coords = getMouseCoords(e);
        let point = [coords[0] + cp.camera.position[0], coords[1] + cp.camera.position[1], 0];        

        draw();
        //Read pixels to see if clicked yellow object (light source 0)
        let clicked = getObj(coords);

        if(drawingState === DrawingState.Inactive) {
            if(clicked > 1) {
                select(clicked, draw);
                if(isMiddleClick) zDragState = DragState.Active;
                else if(isRightClick) rDragState = DragState.Active;
                else dragState = DragState.Active;
                draw();
                return;
            } else {
                select(-1, draw);
                if(isRightClick) dragState = DragState.Active;
                draw();
            }
        }



        // only push sensible coordinates
        let spine = spines[spines.length-1];
        if(noneIsSelected){
            // add spinal points
            if(!isRightClick){
                if(spine.length === 0/* || !Vector.equal(point, spine[spine.length - 1])*/) {
                    if(cp.drawingMethod === DrawingMethod.Manual || drawingState === DrawingState.Inactive){
                        // offset by camera position along x y plane
                        spine.push(point, []); 
                        drawingState = DrawingState.Active;                                    
                    }
                } else if (!Vector.equal(point, spine[spine.length - 2])){
                    if(cp.drawingMethod === DrawingMethod.Manual || drawingState === DrawingState.Inactive){
                        spine.push([]);                
                    }
                }
            }
            // finish spine
            else {
                drawingState = DrawingState.Inactive;
                let p = {
                    position : [0,0,0],
                    rotation : [0,0,0],
                    scale : [1,1,1],
                    color: "#92edd5",
                    image : null
                };
                networking.sendAction("LINE", {spine:spines[spines.length-1], props:p});
                spines.push([]);
                props.push(p);
                save();
            }
        }

    };

    // get rid of dragstates
    canvas.onmouseup = e => {
        dragState = DragState.Inactive;
        zDragState = DragState.Inactive;
        rDragState = DragState.Inactive;
    };

    // Look around initiate
    canvas.ondblclick = e => {
        let coords = getMouseCoords(e);
        let clicked = getObj(coords);
        if(clicked > 1){
            initLoop(() => {
                let condition = selected === -1;
                if(condition){
                    cp.camera.position = [0,0,5];
                    cp.camera.rotation = [0,0,0];
                    cp.camera.animPosition = [0,0,3];
                    cp.camera.animRotation = [0,0,0];
                    draw();
                }
                return condition;
            });
        }
        
    };

    canvas.onmousemove = e => {
        let coords = getMouseCoords(e);
        let point = [coords[0] + cp.camera.position[0], coords[1] + cp.camera.position[1], 0];
        let displacement = Vector.subtract(point, lastPoint); 
        
        // draw rubberbanding cylinders
        if(drawingState === DrawingState.Active) {
            let spine = spines[spines.length-1];
            spine[spine.length-1] = point;
            if(cp.drawingMethod === DrawingMethod.Automatic){
                // if distance between last spine and coords is greater than a certain threshold add spinal point
                if(Vector.distance(spine[spine.length-1], spine[spine.length-2]) > .15) {
                    spines[spines.length-1].push([]);
                }
            }
            draw();            
        }

        // adjust xy translation
        else if(dragState === DragState.Active){
            if(selected === -1){
                if(Math.abs(displacement[1]) > Math.abs(displacement[0]))
                    cp.camera.rotation[0] += displacement[1]*2; // *2 to make the rotation a bit faster  
                else cp.camera.rotation[1] += displacement[0]*2;   
            } else if(selected > 1) {
                let index = selected - 2;
                props[index].position = Vector.add(props[index].position, displacement);
                save();
            }
            draw();
        }
        // adjust z translation
        else if(zDragState === DragState.Active){
            let index = selected - 2;
            props[index].position[2] += displacement[1];
            save();
            draw();            
        }
        // adjust rotation
        else if(rDragState === DragState.Active){
            let index = selected - 2;
            if(Math.abs(displacement[1]) > Math.abs(displacement[0])) props[index].rotation[0] += displacement[1]*4; // *4 to make the rotation a bit faster  
            else props[index].rotation[2] += displacement[0]*4;
            save();
            draw();            
        }
        lastPoint = point;        
    };
        

    function draw(index, mesh){
        if(index > -1){
            let spine = spines[index];
            return spine.length > 2 ? drawMultiple(spine) : drawSingle(spine);
        } else if (mesh){
            spines[spines.length-1] = getSpineOf(mesh);
            spines.push([]);
            props.push({
                position : [0,0,0],
                rotation : [0,0,0],
                scale : [1,1,1],
                color: "#dcebfd",
                image : null
            });
            save();
        }
        clear(gl);
        // Draw created GCs
        for(let i = 0; i < spines.length; i++){
            let spine = spines[i];
            if(spine.length <= 0) return;
            let toBeDrawn = spine.length > 2 ? drawMultiple(spine) : drawSingle(spine);
            let modelMatrix;
            let color; 
            if(i < spines.length - 1) {
                modelMatrix = getModelMatrix(i + 2)
                color = props[i].color;
            } else {
                modelMatrix = Matrix.getIdentity(4);
                color = "#92edd5";
            }
            drawTrianglesLit(
                toBeDrawn.vertices, //vertices
                toBeDrawn.indicees, //indicees
                getCalculatedNormals(toBeDrawn), //normals,
                hexToRGB(color), //color
                toBeDrawn.uvs, //uvs
                modelMatrix, //model matrix
                selected === 2 + i, //isSelected?
                indexToAlpha(i)/255.0, //alpha color
                props[i] && props[i].image
            );                
        }

        function drawSingle(spine){
            // draw a single cylinder
            return Shape.getCylinder(.03, cp.resolution, spine[0], spine[1]);;
        }

        function drawMultiple(spine){
            let vertices1=null;
            let vertices2=null;
            let totalMesh = {
                vertices : [],
                indicees : [],
                uvs : []
            };
            for(let i = 0; i < spine.length - 2; i++){
                // Get Mesh of connected cylinders
                /*
                    implementation for Shape.getConnectedCylinders() is located in math.js, line 388
                */
                let mesh = Shape.getConnectedCylinders(.03, cp.resolution, {
                    length : Vector.distance(spine[i], spine[i + 1]),
                    offset : spine[i],
                    axis : Vector.subtract(spine[i + 1], spine[i]),
                    indexOffset : i * (cp.resolution * 4)
                }, {
                    length : Vector.distance(spine[i + 1], spine[i + 2]),
                    offset : spine[i + 1],
                    axis : Vector.subtract(spine[i + 2], spine[i + 1]),
                    indexOffset : (i + 1) * (cp.resolution * 4)
                });
                if(i===0){
                    // Push a flat circle as theres no need to connect anything to it
                    pushV(onlyStarts(mesh.cyl0.vertices));
                }
                // Push the connecting vertices between cyl0 and cyl1
                pushV(onlyEnds(mesh.cyl0.vertices));
                pushV(onlyStarts(mesh.cyl1.vertices));
                // Push uvs
                totalMesh.uvs.push(...mesh.cyl0.uvs);
                // Always push the indicees of cyl0
                pushI(mesh.cyl0.indicees);
                if(i === spine.length - 3) {
                    // Push the ending flat circle as theres no need to connect anything to it
                    pushV(onlyEnds(mesh.cyl1.vertices));
                    // As well as remaining indicees for the last cylinder
                    pushI(mesh.cyl1.indicees);   
                    //Push ending uvs
                    totalMesh.uvs.push(...mesh.cyl1.uvs);
                }

            }

            // draw multiple cylinders
            return totalMesh;
    
            // Gets the vertices of the initial circle of the cylinder
            function onlyStarts(array){
                let toReturn = [];
                for(let i = 0; i < array.length; i+=12){
                    toReturn.push(array[i], array[i+1],array[i+2]);
                    toReturn.push(array[i+6], array[i+7], array[i+8]);
                }
                return toReturn;
            }
            // Gets the vertices of the final circle of the cylinder
            function onlyEnds(array){
                let toReturn = [];
                for(let i = 3; i < array.length; i+=12){
                    toReturn.push(array[i], array[i+1],array[i+2]);
                    toReturn.push(array[i+6], array[i+7],array[i+8]);   
                }            
                return toReturn;
            }
            
            function pushV(vertices){    
                if(!vertices1){
                    vertices1 = vertices;
                } else {
                    vertices2 = vertices;
                    //must push vertices in correct order to maintain correct index reference
                    for(let i = 0; i < vertices1.length; i+=6){
                        //push vertices referenced by indicees at 0
                        totalMesh.vertices.push(vertices1[i], vertices1[i+1], vertices1[i+2]);
                        //push vertices referenced by indicees at 1
                        totalMesh.vertices.push(vertices2[i], vertices2[i+1], vertices2[i+2]);
                        //push vertices referenced by indicees at 2
                        totalMesh.vertices.push(vertices1[i+3], vertices1[i+4], vertices1[i+5]); 
                        //push vertices referenced by indicees at 3
                        totalMesh.vertices.push(vertices2[i+3], vertices2[i+4], vertices2[i+5]);            
                    }
                    vertices1=null;
                    vertices2=null;
                }
            }
            function pushI(indicees){
                totalMesh.indicees.push(...indicees);
            }
        }
    }

    function getCalculatedNormals(totalMesh, fillOneColor=false){
        // will return this colors array filled
        let totalNormals = [];        
        let verts = totalMesh.vertices;

        setSmoothShadedNormals();            

        //return colors;
        return totalNormals;


        function setSmoothShadedNormals(){
            // faceNormals is a 2d array
            // more specifically, an array of cylinders holding arrays of faceNormals
            let faceNormals = [];
            let vertexIndex;
            // Cylinder index is c
            for(let c = 0; c < verts.length/144; c++){
                faceNormals.push([]);
                // Face Index is f
                for(let f = 0; f < 12; f++){
                    vertexIndex = c*144 + f*12;
                    let v0 = [verts[vertexIndex], verts[vertexIndex + 1], verts[vertexIndex + 2]];
                    let v1 = [verts[vertexIndex + 3], verts[vertexIndex + 4], verts[vertexIndex + 5]];
                    let v2 = [verts[vertexIndex + 6], verts[vertexIndex + 7], verts[vertexIndex + 8]];
                    faceNormals[c].push(getNormal(v0, v1, v2));
                }
            }
            // For every cylinder in this object
            for(let c = 0; c < verts.length/144; c++){
                // For every face in this cylinder
                for(let f = 0; f < 12; f++){
                    // SET NORMALS THAT ARE LOCAL TO THIS FACE
                    // These assignments are normal vectors of faces local to current face
                    // i.e. bottomLeft is the normal of the face that is bottom left of the current face        
                    let bottomLeft = getFromFaceNormals(c - 1, f - 1);
                    let bottom = getFromFaceNormals(c - 1, f);
                    let bottomRight = getFromFaceNormals(c - 1, f + 1);
                    let left = getFromFaceNormals(c, f - 1);
                    let center = getFromFaceNormals(c, f);
                    let right = getFromFaceNormals(c, f + 1);
                    let topLeft = getFromFaceNormals(c + 1, f - 1);
                    let top = getFromFaceNormals(c + 1, f);
                    let topRight = getFromFaceNormals(c + 1, f + 1);

                    // for every vertex in this face
                    for(let v = 0; v < 4; v++){
                        let avgNormal = [0, 0, 0];
                        switch(v % 4) {
                            case 0:
                                //add bottom left face normal
                                avgNormal = Vector.add(avgNormal, bottomLeft);
                                // add bottom face normal
                                avgNormal = Vector.add(avgNormal, bottom);
                                // add left face normal
                                avgNormal = Vector.add(avgNormal, left);
                                // add current face normal
                                avgNormal = Vector.add(avgNormal, center);
                                break;
                            case 1:
                                //add left face normal
                                avgNormal = Vector.add(avgNormal, left);
                                // add current face normal
                                avgNormal = Vector.add(avgNormal, center);
                                // add left face normal
                                avgNormal = Vector.add(avgNormal, topLeft);
                                // add current face normal
                                avgNormal = Vector.add(avgNormal, top);
                                break;
                            case 2:
                                //add bottom face normal
                                avgNormal = Vector.add(avgNormal, bottom);
                                // add bottom right face normal
                                avgNormal = Vector.add(avgNormal, bottomRight);
                                // add current face normal
                                avgNormal = Vector.add(avgNormal, center);
                                // add right face normal
                                avgNormal = Vector.add(avgNormal, right);
                                break;
                            case 3:
                                //add center face normal
                                avgNormal = Vector.add(avgNormal, center);
                                // add right face normal
                                avgNormal = Vector.add(avgNormal, right);
                                // add top face normal
                                avgNormal = Vector.add(avgNormal, top);
                                // add top right face normal
                                avgNormal = Vector.add(avgNormal, topRight);
                            default:
                                //impossible to reach here
                                break;
                        }
                        totalNormals.push(...Vector.normalize(avgNormal));
                    }
                }
                
            }

            function getFromFaceNormals(cylIndex, faceIndex){
                if(cylIndex < 0 || cylIndex >= faceNormals.length){
                    return [0, 0, 0];
                }
                faceIndex %= 12;
                faceIndex = faceIndex < 0 ? faceIndex + 12 : faceIndex;
                return faceNormals[cylIndex][faceIndex];
            }

        }

        function getNormal(v0, v1, v2){
            let v = Vector.subtract(v1,v0);
            let w = Vector.subtract(v2,v1);
            // get normal of quad by taking cross product of v and w
            return Vector.normalize(Vector.cross(v, w));
        }
    }
})();