/**
 * Richard Franklin
 * interface.js
 * Used to set up gui elements (outside of canvas element) like control-panel and info-panel
 */
const reader = new FileReader();
// coordinates for GCs
let spines = [[]];
let props = [];
let selected = -1;

// control panel DOM
const
    CPprojection = document.getElementById("projection"),
    CPdiffCol = document.getElementById("diffuseColor"),
    CPmethod = document.getElementById("method"),
    CPerase = document.getElementById("erase"),
    CPresetView = document.getElementById("resetView")
;

const DrawingMethod = {
    Manual : "MANUAL",
    Automatic : "AUTOMATIC"
};
let light0state = true;
let cp = {
    ortho : true,
    resolution : 12,
    ambCol : [.0625, .09375, .0625],
    diffCol : [1, 1, 1],
    camera : {
        fov : 25,
        position : [0, 0, 4],
        rotation : [0, 0, 0]
    },
    drawingMethod : DrawingMethod.Manual
};

// go away context menu!
canvas.oncontextmenu = e => false;

//setup fileload
// Need to give up the index.js draw() function and spine array to the control-panel onchange events,
// so that the events may redraw the cylinders when the settings are changed or manipulated
function attachDrawFunctionToEvents(drawFunction){
    // set events
    CPprojection.onchange = e => {
        cp.ortho = e.target.value === "ORTHO";
        drawFunction();
    };
    CPmethod.onchange = e => {
        cp.drawingMethod = e.target.value;
    }; 
    CPerase.onclick = e => {
        spines = [[]];
        props = [];
        networking.sendAction("ERASE");
        drawFunction();
    };
    CPresetView.onclick = e => {
        cp.camera.position = [0,0,4];
        cp.camera.rotation = [0,0,0];
        drawFunction();
    };
    /**
     * Camera Movements / View&Proj Transformations
     */
    // Zooming if no obj selected
    // Scaling if obj selected
    window.addEventListener('wheel', e => {
        e.preventDefault();
        e.stopPropagation();
        let dir = e.deltaY < 0 ? -1 : 1;
        if(selected === -1) {
            if(dir === 1) {
                cp.camera.fov--;
                drawFunction();
            } else {
                cp.camera.fov++;
                drawFunction();
            }
        } else if (selected > 1){
            let index = selected - 2;
            props[index].scale = Vector.add(props[index].scale, Vector.scale([1,1,1], .025 * dir) );
            drawFunction();
        }

    });
    // Moving and Panning
    window.addEventListener("keydown", e => {
        // x
        let LFT = e.code === "KeyA" || e.which === 65;
        let RGT = e.code === "KeyD" || e.which === 68;
        // y
        let DWN = e.code === "KeyQ" || e.which === 81;
        let UP  = e.code === "KeyE" || e.which === 69;        
        // z
        let BCK = e.code === "KeyS" || e.which === 83;        
        let FWD = e.code === "KeyW" || e.which === 87;

        if(LFT) {
            cp.camera.position = Vector.add(cp.camera.position, [-.04, 0, 0]);
            drawFunction();            
        } else if(RGT) {
            cp.camera.position = Vector.add(cp.camera.position, [.04, 0, 0]);
            drawFunction();            
        } else if(DWN) {
            cp.camera.position = Vector.add(cp.camera.position, [0, -.04, 0]);  
            drawFunction();            
        } else if(UP) {
            cp.camera.position = Vector.add(cp.camera.position, [0, .04, 0]);
            drawFunction();            
        } else if(BCK) {
            cp.camera.position = Vector.add(cp.camera.position, [0, 0, .04]);
            drawFunction();            
        } else if(FWD) {
            cp.camera.position = Vector.add(cp.camera.position, [0, 0, -.04]);
            drawFunction();            
        }
    });
}

function select(index, drawFunction){
    selected = index;
    let name = document.getElementById("obj-name");
    let color = document.getElementById("obj-color");
    let file = document.getElementById("obj-file");
    let texture = document.getElementById("obj-texture");
    // let value = [0,0,0];

    if(index === -1){
        name.innerHTML = "(Select an object first)";
        color.innerHTML = "";
        file.innerHTML = "";
        texture.innerHTML = "";
    } else {
        name.innerHTML = `<h3>GC ${index - 2}</h3>`;
        color.innerHTML = `
            <label for="colorInput">Color</label>
            <input type="color" id="colorInput" value="${props[index-2].color}">
        `;
        let colorInput = document.getElementById("colorInput");
        colorInput.onchange = e => {
            props[index - 2].color = e.target.value;
            save();
            drawFunction();
        };
        file.innerHTML = `
            <label for="file-save">Save as .obj</label><br>        
            <button id="file-save" type="button">Save</button>                    
        `;
        let saveButton = document.getElementById("file-save");
        saveButton.onclick = e => {
            let mesh = drawFunction(index-2);
            if(mesh){
                saveFile(new SOR(`GC ${index - 2}`, mesh.vertices, mesh.indicees));            
            } else {
                alert("No cylinders created");
            }
        };
        texture.innerHTML = `
            <div>
                <label for="tx-file">Texture</label><br>                    
                <span><input type="file" accept="image/*" id="tx-file"/></span>
            </div>
        `;
        let txInput = document.getElementById("tx-file");
        txInput.onchange = e => {
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = function(){
                let img = new Image();
                img.src = reader.result;
                img.onload = e => {
                    props[index - 2].image = img;
                    console.log(props);
                    drawFunction();
                };
            };
        };
    }
}

// Normalize mouse coordinates to the canvas element
function getMouseCoords(e){
    let x = e.clientX; // x coordinate of a mouse pointer
    let y = e.clientY; // y coordinate of a mouse pointer
    let rect = e.target.getBoundingClientRect();

    // Will allow the center (origin of the canvas) to be [0,0]
    // Graphical representation would look like:
    //
    //        (0, 1) ^  +Y
    //               |
    //-X (-1, 0)<----|----> (1,0) +X
    //               |
    //      (0, -1)  v -Y
    //           
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return [x, y, 0];
}