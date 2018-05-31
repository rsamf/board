
let vue = new Vue({
  el: "#vue",
  delimiters: ['${', '}'],
  unsafeDelimiters: ['!{', '}'],
  data: {

  },
  methods: {

  }
});

let networking = {
  get: function(path, callback, json=true){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
            callback(json ? JSON.parse(xhttp.responseText): xhttp.responseText);
        }
    };
    xhttp.open("GET", path, true);
    xhttp.send();
  },
  post: function(path, data, callback, json=true){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
            callback(json ? JSON.parse(xhttp.responseText): xhttp.responseText);
        }
    };
    xhttp.open("POST", path, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));
  },
  put: function(path, data, callback, json=true){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
            callback(json ? JSON.parse(xhttp.responseText): xhttp.responseText);
        }
    };
    xhttp.open("PUT", path, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));
  }
};