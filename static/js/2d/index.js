let board = document.getElementById("board");
let ctx = board.getContext("2d");
let rect = board.getBoundingClientRect();
let mouse = {
  lock: false
};

// Every element in action is an array
// Each array has values to structure a line
// There are 4 values per line:
// [starting coord, ending coord, color, width]
let actions = []; 

setup();


/**
 * Download
 */
function downloadImage(){
  let projectName = document.getElementById('project').value || "2d.png";
  let link = document.createElement('a');
  link.href = board.toDataURL();
  link.download = projectName;
  link.click();
}

function downloadJSON(){
  reduceSize(true);
  let projectName = document.getElementById('project').value;
  let link = document.createElement('a');
  let blob = new Blob([JSON.stringify(actions)], {type: "application/json"});
  let url = URL.createObjectURL(blob);
  link.href = url;
  link.download = projectName || "2d.json";
  link.click();
}

/**
 * Setup
 */
window.onresize = e => {
  board.width = document.body.clientWidth;
  board.height = document.body.clientHeight;
  setup();
};

function setup(){
  board.width = document.body.clientWidth;
  board.height = document.body.clientHeight;
  ctx.strokeStyle = document.getElementById("color").value;
  ctx.lineWidth = document.getElementById("width").value;
  ctx.lineCap = 'round';
  draw();
}

function clear(){
  ctx.clearRect(0, 0, board.width, board.height);
}

function reset(){
  clear();
  setup();
}

function draw(){
  actions.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(a[0][0] - rect.left, a[0][1] - rect.top);
    ctx.lineTo(a[1][0] - rect.left, a[1][1] - rect.top);
    ctx.strokeStyle = a[2];
    ctx.lineWidth = a[3];
    ctx.stroke();
  });
}

function undo(){
  for(let i = 0; i < document.getElementById("undoSize").valueAsNumber; i++) actions.pop();
  reset();
}
function erase(){
  actions = [];
  reset();
}

function reduceSize(doUntilConverge){
  let threshold = document.getElementById("reduceFactor").valueAsNumber;

  if(doUntilConverge){
    let lastLength = actions.length;
    reduce();
    while(actions.length !== lastLength){
      lastLength = actions.length;
      reduce();
    }
  } else {
    reduce();
  }
  reset();

  function reduce(){
    let size = actions.length;
    for(let i = 0; i < actions.length - 2; i++){
      let endingA = actions[i][1];
      let startingC = actions[i+2][0];
      if(distance(endingA, startingC) < threshold) {
        actions[i][1][0] = actions[i+2][0][0];
        actions[i][1][1] = actions[i+2][0][1];
        delete actions[i+1];
        i++;
      }
    }
    // Whoa! easy way to remove undefined actions :)
    actions = actions.filter(a => a);

    if(actions.length === size) console.log("Reduce did nothing");
  }
}

/**
 * Controls
 */
document.onkeyup = e => {
  if(e.ctrlKey){
    if(e.code === "KeyS"){
      downloadImage();
    } else if (e.code === "KeyZ") {
      undo();
    } else if(e.code === "Space") {
      reduceSize();
    }
  }
};
board.onmousemove = e => {
  if(!mouse.drawingActive) return;
  actions.push([
    [mouse.lastX, mouse.lastY],
    [e.clientX, e.clientY],  
    document.getElementById("color").value,
    document.getElementById("width").valueAsNumber
  ]);
  ctx.beginPath();
  ctx.moveTo(mouse.lastX - rect.left, mouse.lastY - rect.top);
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  mouse.lastX = e.clientX;
  mouse.lastY = e.clientY;

};
board.onmousedown = e => {
  mouse.drawingActive = !mouse.drawingActive;
  mouse.lastX = e.clientX;
  mouse.lastY = e.clientY;
};
board.onmouseup = () => {
  if(!mouse.lock) mouse.drawingActive = false;
};
board.onmouseleave = () => mouse.drawingActive = false;
board.onmouseout = () => mouse.drawingActive = false;
document.getElementById("color").onchange = e => {
  ctx.strokeStyle = e.target.value;
};
document.getElementById("width").onchange = e => {
  ctx.lineWidth = e.target.value;
};
document.getElementById("lock").onchange = e => {
  mouse.lock = e.target.checked;
};

function distance(A, B){
  return Math.sqrt(
    Math.pow(A[0] - B[0], 2) + 
    Math.pow(A[1] - B[1], 2)
  );
}