let saveId = null;
let drawFunction = function(){};

let socket = io("https://board-io.herokuapp.com/");


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
    let actionHash;
    // if(type !== "ERASE") {
    //   actionHash = hash(JSON.stringify(actions));
    // }
    console.log(type, data);
    socket.emit(type, data, actionHash);

    function hash(s){
      return s
        .split("")
        .reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a&a;
        }, 0);          
    }
  }
};

function attachDrawFunctionToNetworking(func){
  drawFunction = func;
}

function save(){
  if(saveId) clearInterval(saveId);
  saveId = setTimeout(()=>{
    networking.put(URL.SAVE + '/' + BOARD_ID, {
      instruction: JSON.stringify({
        spines: spines,
        props: props
      })
    }, (res) => {
      console.log(res);
      console.log("saved");
    }, false);
  }, 1000);
}

(function(){
  networking.get(URL.BOARD + '/' + BOARD_ID, (b) => {
    console.log(b);
    console.log(b.instruction);
    let instruction = JSON.parse(b.instruction);
    if(b.instruction){
      spines = instruction.spines;
      props = instruction.props;
      drawFunction();
    }
    setSocket(b.id);
    document.getElementById("project").innerText = b.name;
  });
  function setSocket(room){
    socket.emit('join', room);
    socket.on('ERASE', ()=>{
      spines = [[]];
      props = [];
      drawFunction();
    });
    socket.on('LINE', (data) => {
      console.log(data);
      spines[spines.length-1] = data.spine;
      spines.push([]);
      props.push(data.props);
      drawFunction();
    });
    socket.on('UNDO', (data)=>{
      let amount = data;
      for(let i = 0; i < amount; i++) {
        spines.pop();
        props.pop();
      }
      spines.push([]);
      drawFunction();
    });
  }
})();

