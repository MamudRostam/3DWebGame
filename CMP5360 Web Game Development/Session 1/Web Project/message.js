// Variable in ES5
var x = 1;
var isClicked = true;

// Variable in ES6
let i = 0;
const name = "Odyssey Shooters";

// ES5
function fname() {
    alert("This is a function");
}

// ES6
const message = () => {
    const stringname = "Press Play to Begin";
    return stringname;
};

export { name };
export default message;
