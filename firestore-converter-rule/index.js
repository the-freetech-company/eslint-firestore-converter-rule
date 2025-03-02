const fooBarRule = require("./firestore-converter-rule");
// import fooBarRule from "./firestore-converter-rule";
const plugin = { rules: { "firestore-converter-rule": fooBarRule } };
module.exports = plugin;
