const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");

const videoData = require('./data/video-details.json');

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

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

app.route("/videos")
.get((req,res) => {
    let filteredVideos = videoData.map((item) => {
        return (
            {
                id: item.id,
                title: item.title,
                channel: item.channel,
                image: item.image
            }
        )})
    res.json(filteredVideos);
})

app.route("/videos/:id")
.get((req, res) => {
    let videoSelected = videoData.filter(item => {
        return (item.id === req.params.id)
    })
    res.json(videoSelected[0]);
})