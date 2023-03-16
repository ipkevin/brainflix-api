const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");
const videosRoute = require('./routes/videos');

app.use(express.static('public'));
app.use(express.json());
app.use(cors());


app.use("/videos", videosRoute);

app.route("/")
.get((req,res) => {
    res.status(204).send("We got your request but we're not going to do anything about it. Any plans for the summer? Mooo.");
})

app.listen(port, () => {
    console.log("Server is now listening on port 8080");
})