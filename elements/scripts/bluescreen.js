function bluescreenon() {
    document.getElementById("overlay").style.display = "block";
}

function bluescreenoff() {
    document.getElementById("overlay").style.display = "none";
}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }
 