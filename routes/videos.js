const express = require('express');
const router = express.Router();
const fs = require("fs");

const dataLocation = "./data/video-details.json";

router.route("/")
.get((req, res) => {
    fs.readFile(dataLocation, 'utf8', (err, data) => {
        if (err) {
            console.log("error retrieving video list from disk");
            return res.status(504).send(JSON.parse(err));
        } else {
            let videoData = JSON.parse(data);
            videoData = videoData.map((video) => {
                return ({
                    id: video.id,
                    title: video.title,
                    channel: video.channel,
                    image: video.image
                })
            })
            return res.json(videoData);
        }
    })
})

router.route("/:id")
.get((req, res) => {
    fs.readFile(dataLocation, 'utf8', (err, data) => {
        if (err) {
            console.log("error retrieving video list for details of a vid");
            return res.send(err);
        }

        const videos = JSON.parse(data);
        let videoMatch = videos.find((vid) => {
            return (vid.id === req.params.id)
        })

        if (videoMatch) {
            return res.json(videoMatch)
        } else {
            return res.status(404).send(`Could not find matching video for id: ${req.params.id}`);
        }
    })
})

module.exports = router;