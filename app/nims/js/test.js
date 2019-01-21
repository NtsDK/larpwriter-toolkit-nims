require("../style/experimental.css")
require("../index.html")

//alert("Hello")
console.log('hello')

const a = b => console.log(b);

a(223344);

window.PageManager = {};

window.PageManager.onIndexPageLoad = function () {console.log('Hello, page!')}