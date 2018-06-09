// document.addEventListener("DOMContentLoaded", app);
// function app(){
  let board = document.getElementById("board");
  let ctx = board.getContext("2d");
  let rect = board.getBoundingClientRect();
  let mouse = {
    lock: false
  };
  let savingId;
  let socket = io("https://"+window.location.hostname+":8001");
  
  // Every element in action is an array
  // Each array has values to structure a line
  // There are 4 values per line:
  // [starting coord, ending coord, color, width]
  let actions = [];
  const networking = {
    get: function(path, callback, json=true){
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if(xhttp.readyState === XMLHttpRequest.DONE) {
          if(xhttp.status === 200)
            // console.log(xhttp.responseText);
            callback(json ? JSON.parse(xhttp.responseText): xhttp.responseText);
          else
            console.error(xhttp.responseText);
        }
      };
      xhttp.open("GET", path, true);
      xhttp.send();
    },
    put: function(path, data, callback, json=true){
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if(xhttp.readyState === XMLHttpRequest.DONE) {
          if(xhttp.status === 200)
            callback(json ? JSON.parse(xhttp.responseText): xhttp.responseText);
          else
            console.error(xhttp.responseText);
        }
      };
      xhttp.open("PUT", path, true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(JSON.stringify(data));
    },
    /**
     * LINE - array
     * UNDO - int
     * ERASE
     */
    sendAction: function(type, data){
      socket.emit(type, data, null);
    }
  };
  
  setup();
  
  
  /**
   * Download
   */
  function downloadImage(){
    let projectName = document.getElementById('project').innerText || "2d";
    let link = document.createElement('a');
    link.href = board.toDataURL();
    link.download = projectName;
    link.click();
    reset();
  }
  
  function downloadJSON(){
    reduceSize(true);
    let projectName = document.getElementById('project').innerText || "2d";
    let link = document.createElement('a');
    let blob = new Blob([JSON.stringify({actions:actions})], {type: "application/json"});
    let url = window.URL.createObjectURL(blob);
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
    reset();
  };
  function setup(){
    getBoard(b => {
      setSocket(b.id);
      board.width = document.body.clientWidth;
      board.height = document.body.clientHeight;
      actions = b.instruction ? JSON.parse(b.instruction) : [];
      document.getElementById("project").innerText = b.name;
      reset();
    });

    function setSocket(room){
      socket.emit('join', room);
      socket.on('ERASE', ()=>{
        actions = [];
        reset();
      });
      socket.on('LINE', (data) => {
        actions.push(data);
        draw();
      });
      socket.on('UNDO', (data)=>{
        let amount = data;
        for(let i = 0; i < amount; i++) 
          actions.pop();
        reset();
      });
    }
  }
  function clear(){
    ctx.clearRect(0, 0, board.width, board.height);
  }
  function reset(){
    ctx.strokeStyle = document.getElementById("color").value;
    ctx.lineWidth = document.getElementById("width").value;
    ctx.lineCap = 'round';
    clear();
    draw();
  }
  function draw(){
    actions.forEach(a => {
      ctx.beginPath();
      ctx.strokeStyle = a[2];
      ctx.lineWidth = a[3];
      ctx.moveTo(a[0][0] - rect.left, a[0][1] - rect.top);
      ctx.lineTo(a[1][0] - rect.left, a[1][1] - rect.top);
      ctx.stroke();
    });
  }
  function undo(){
    let amount = document.getElementById("undoSize").valueAsNumber;
    networking.sendAction("UNDO", amount);
    for(let i = 0; i < amount; i++) 
      actions.pop();
    reset();
    save();
  }
  function erase(){
    networking.sendAction("ERASE");
    actions = [];
    reset();
    save();
  }
  function save(){
    console.log("saving");
    networking.put(URL.SAVE + '/' + BOARD_ID, {
      instruction: JSON.stringify(actions)
    }, (res)=>{
      console.log("saved", res);
    }, false);
  }
  function getBoard(callback){
    networking.get(URL.BOARD + '/' + BOARD_ID, callback);
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
    let color = document.getElementById("color").value;
    let width = document.getElementById("width").valueAsNumber;
    let toPush = [
      [mouse.lastX, mouse.lastY],
      [e.clientX, e.clientY],  
      color,
      width
    ];
    networking.sendAction("LINE", toPush);
    actions.push(toPush);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(mouse.lastX - rect.left, mouse.lastY - rect.top);
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
    if(savingId) {
      clearInterval(savingId);
    }
    savingId = setTimeout(save, 1000);
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
// }

