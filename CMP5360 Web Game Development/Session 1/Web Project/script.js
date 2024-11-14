console.log("This is a code inside my http://script.js");
/////////////////////////// FUnction declartion//////////////////
const clickFunction=()=>{    
    document.getElementById("demo").innerHTML = "This is new content";}
    //////////Main logic////////////////////
    //This is demonstration of event listener
    document.getElementById("demo").addEventListener("click", clickFunction);
