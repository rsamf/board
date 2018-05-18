let board = document.getElementById("board");
let ctx = board.getContext("2d");
let rect = board.getBoundingClientRect();
let lastX, lastY;
let drawingActive = false;
setup();



board.onmousemove = e => {
  if(!drawingActive) return;
  ctx.moveTo(lastX - rect.left, lastY - rect.top);
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  lastX = e.clientX;
  lastY = e.clientY;
};

window.onresize = e => {
  console.log(e);
  board.width = document.body.clientWidth;
  board.height = document.body.clientHeight;
};

function setup(){
  board.width = document.body.clientWidth;
  board.height = document.body.clientHeight;  
}

/**
 * Mouse Control
 */
board.onmousedown = e => {
  lastX = e.clientX;
  lastY = e.clientY;
  drawingActive = true;
};
board.onmouseup = e => drawingActive = false;
board.onmouseleave = e => drawingActive = false;
board.onmouseout = e => drawingActive = false;



