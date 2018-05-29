let board = document.getElementById("board");
let ctx = board.getContext("2d");
let rect = board.getBoundingClientRect();
let mouse = {
  lock: false
};
setup();

/**
 * Styling
 */
function setColor(value){
  ctx.fillStyle=`rgb(${value[0]}, ${value[1]}, ${value[2]})`;
}

/**
 * Image Download
 */
function downloadImage(){
  let link = document.createElement('a');
  link.href = board.toDataURL();
  link.download = 'image';
  link.click();
  document.removeChild(link);
}

/**
 * Setup
 */
window.onresize = e => {
  board.width = document.body.clientWidth;
  board.height = document.body.clientHeight;
};

function setup(){
  board.width = document.body.clientWidth;
  board.height = document.body.clientHeight;
  ctx.strokeStyle = document.getElementById("color").value;
}

/**
 * Controls
 */
document.onkeyup = e => {
  console.log(e.which);
  switch(e.which) {
    case 65:
      downloadImage();
      break;
    case 16:
      mouse.lock = !mouse.lock;
      break;
  }
};
board.onmousemove = e => {
  if(!mouse.drawingActive) return;
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