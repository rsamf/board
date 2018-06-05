
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
  post: function(path, data, callback, json=true){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if(xhttp.readyState === XMLHttpRequest.DONE) {
            if(xhttp.status === 200)
                callback(json ? JSON.parse(xhttp.responseText): xhttp.responseText);
            else 
                console.error(xhttp.responseText)
        }
    };
    xhttp.open("POST", path, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));
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
  }
};

let vue = new Vue({
  el: "#vue",
  delimiters: ['${', '}'],
  unsafeDelimiters: ['!{', '}'],
  data: {
    loading: true,
    adding: false,
    user: null,
    boards: [],
    newBoard: {
        name: "New Project",
        type: "2D",
        is_public: "PRIVATE"
    }
  },
  methods: {
    beginAdding: function() {
        this.adding = true;
    },
    cancelAdding: function() {
        this.adding = false;
    },
    submitAdding: function(){
        let data = this.newBoard;
        data.is_public = data.is_public === "PUBLIC";
        networking.post(URL.ADD_BOARD, data, (res) => {
            console.log(res);
            this.adding = false;
        }, false);
    }

  }
});

function setup(){
    let req = 0;
    networking.get(URL.USER, user => {
        console.log("n USER", user);
        vue.user = user;
        checkReq();
        if(user) {
            networking.get(URL.BOARDS, boards => {
                console.log("n BOARD", boards);
                vue.boards = boards;
                checkReq();
            });  
        } else {
            checkReq();
        }
    });

    function checkReq(){
        req++;
        if(req == 2) vue.loading = false;
    }
    
}

(function(){
    setup();
})();
