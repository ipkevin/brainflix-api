const express = require("express");
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log("Server is now listening on port 8080");
})

app.route("/")
.get((req,res) => {
    res.send("We got your request. Sit tight and we'll be with you shortly.");
})
.post((req, res) => {
    res.send("POST request received!");
})