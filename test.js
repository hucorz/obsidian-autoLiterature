function A() {
    return B();
}

function B() {
    throw new Error('error');
}

try {
    A();
}catch(e) {
    console.log(111);
}