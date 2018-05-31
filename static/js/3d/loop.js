/**
 * Richard Franklin
 * loop.js
 * For animations
 */ 
let loopDrawFunction = null;

function loop(breakExec){
    if(selected>1){
        let index = selected-2;
        let position = Vector.add(getCenterOf(spines[index]), props[index].position);
        cameraLookAround(position); //call to rotate camera around an object (in objtransform.js)
    }
    loopDrawFunction();
    if(!breakExec()) requestAnimationFrame(()=>loop(breakExec));
}

function initLoop(breakExec){
    cp.camera.animPosition = [0,0,3];
    cp.camera.animRotation = [0,0,0];
    loop(breakExec);
}

function attachDrawFunctionToLoop(drawFunction){
    loopDrawFunction = drawFunction;
}