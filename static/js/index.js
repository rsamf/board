
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
    },
    sharing: false
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
            this.getBoards();
        }, false);
    },
    deleteBoard: function(b){
        networking.get(URL.DELETE_BOARD + '/' + b.id, (res) => {
            console.log(res);
            this.adding = false;
            this.getBoards();
        }, false);
    },
    toggleVisibility: function(b){
        networking.post(URL.TOGGLE_VISIBILITY + '/' + b.id, {}, res => {
            console.log(res);
            this.getBoards();
        }, false)
    },
    copySharingLink: function(b){
        const el = document.createElement('textarea');
        el.value = this.getSharingLink(b);
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    },
    getSharingLink: function(b, origin=true){
        if(b.board_type === '2D') {
            let link = URL.BOARD_LINK_2 + '/' + b.url;
            return origin ? window.location.origin + link : link;
        } else {
            let link = URL.BOARD_LINK_3 + '/' + b.url;
            return origin ? window.location.origin + link : link;
        }
    },
    getBoards: function(){
        networking.get(URL.BOARDS, boards => {
            console.log("n BOARD", boards);
            vue.boards = boards;
        });
    }
  
  }
});

function setup(){
    networking.get(URL.USER, user => {
        vue.user = user;
        if(user) {
            networking.get(URL.BOARDS, boards => {
                console.log("n BOARD", boards);
                vue.boards = boards;
                vue.loading = false;
            });
        } else {
            vue.loading = false;
        }
    });
    
}

(function(){
    setup();
})();
