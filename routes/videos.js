const express = require('express');
const router = express.Router();
const fs = require("fs");
const {v4: uuid} = require("uuid");

const dataLocation = "./data/video-details.json";

router.route("/")
.get((req, res) => {
    fs.readFile(dataLocation, 'utf8', (err, data) => {
        if (err) {
            console.log("error retrieving video list from disk");
            return res.status(404).send(JSON.parse(err));
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
.post((req, res) => {
    console.log("req body: ", req.body);
    if (req.body){
        let videoData;
        fs.readFile(dataLocation, 'utf8', (err, data) => {
            if (err) {
                console.log("error retrieving video list from disk before writing new vid");
                return res.status(404).send(JSON.parse(err));
            }
            videoData = JSON.parse(data);
            videoData.push(req.body);

            fs.writeFile(dataLocation, JSON.stringify(videoData), (err) => {
                if (err) {
                    return res.status("error writing file");
                }
                console.log("just before sending video added resp");
                res.status(201).send("video added");
            })
        })
    } else {
        res.status(400).send("No post body received");
    }
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

/*
* read new video list
* extract the current video by video id
* add the new comm object to the curr video's comm array
* verify good
* Update the video list array with the updated video object (
    - Access the video item's comment array directly and edit that
* Write the new videolist arry to file
*/
router.route("/:id/comments")
.post((req, res) => {
    // read the file to get a fresh videolist
    // Add the new comment to the video within the list
    // Finally write the updated videolist to file
    fs.readFile(dataLocation, 'utf8', (err, data) => {
        if (err) {
            console.log("error reading json for comment posting");
            return res.send(err);
        }

        // list of all videos
        const videos = JSON.parse(data);
        
        // this will be a direct reference to the video object in the videolist array, not a copy of values
        let videoMatch = videos.find((vid) => vid.id === req.params.id);

        // Update comments in this video.  Since videoMatch is a reference, then videos list also updated        
        let commentObj = {
            id: uuid(),
            name: req.body.name,
            comment: req.body.comment,
            likes: 0,
            timestamp: Date.now(),
        }
        videoMatch.comments.push(commentObj);

        fs.writeFile(dataLocation, JSON.stringify(videos), (err) => {
            if (err) {
                return res.status(400).send("Error writing comment to file");
            }
            return res.status(201).send("Comment written to file");
        })
    })
})

/*
* Pull latest videos list
* Get ref to matching video
* Find index of matching comment (findIndex()) and splice it out
* Write update videoslist to file
*/
router.route("/:id/comments/:commentId")
.delete((req, res) => {
    fs.readFile(dataLocation, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send("Error reading videos from file for comment deletion");
        }
        let videos = JSON.parse(data);

        let videoMatch = videos.find((vid) => vid.id === req.params.id);
        let commentIndex = videoMatch.comments.findIndex((comm) => comm.id === req.params.commentId);
        
        // need to check if comment index is -1 as that's the 'does not exist' return value of findIndex 
        // yet splice() (which will be used next to delete) treats -1 as last element of array
        if (!commentIndex || commentIndex < 0) {
            return res.status(400).send("Invalid comment id!");
        }
        // Delete the comment from the video's comment array        
        videoMatch.comments.splice(commentIndex, 1);
        // Now update the videolist file
        fs.writeFile(dataLocation, JSON.stringify(videos), (err) => {
            if (err) {
                return res.status(400).send("Error writing comment deletion to file");
            }
            res.status(200).send(`Comment deleted permanently. Comments for the file: ${videos}`)
        })
        
    })
})

module.exports = router;