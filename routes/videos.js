const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuid } = require("uuid");

const multer = require("multer");
const path = require("path"); // used with file upload check

const dataLocation = "./data/video-details.json";

const frontEndFileUrl = "http://localhost:8080/";

// configure multer storage engine to store files
const storageEngine = multer.diskStorage({
  destination: "./public",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

// Create multer instance configured to use storageEngine to handle storage
const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

// Function to check image files are correct type
function checkFileType(file, cb) {
  console.log("inside chekc filetype function");
  // allowed file extension
  const fileTypes = /jpeg|jpg|jfif|png|gif|svg/;

  // check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  // const mimeType = fileTypes.test(file.mimeType);

  // if (mimeType && extName) {
  if (extName) {
    console.log("in check file success");
    return cb(null, true);
  } else {
    console.log("in check file fail");
    console.log("wrong file type uploaded!");
    return cb("Error: You can only upload images!");
  }
}

// Get video list and post new video route
router
  .route("/")
  .get((req, res) => {
    fs.readFile(dataLocation, "utf8", (err, data) => {
      if (err) {
        console.log("error retrieving video list from disk");
        return res.status(404).send(JSON.parse(err));
      } else {
        let videoData = JSON.parse(data);
        videoData = videoData.map((video) => {
          return {
            id: video.id,
            title: video.title,
            channel: video.channel,
            image: frontEndFileUrl + video.image,
          };
        });
        return res.json(videoData);
      }
    });
  })
  .post(upload.single("image"), (req, res) => {
    if (req.file) {
      let videoObj = {
        id: uuid(),
        title: req.body.title,
        channel: "Moo",
        image: req.file.filename,
        description: req.body.description,
        views: "1,000,000",
        likes: "188.888",
        duration: "1:23",
        video: "https://project-2-api.herokuapp.com/stream",
        timestamp: Date.now(),
        comments: [],
      };
      // get the latest video list
      fs.readFile(dataLocation, "utf8", (err, data) => {
        if (err) {
          console.log(
            "error retrieving video list from disk before writing new vid"
          );
          return res.status(404).send(JSON.parse(err));
        }
        let videoData = JSON.parse(data);

        // add new video info to the local copy of video list
        videoData.push(videoObj);

        // write to file by replacing its contents with the local video list
        fs.writeFile(dataLocation, JSON.stringify(videoData), (err) => {
          if (err) {
            return res.status("error writing file");
          }
          res
            .status(201)
            .send("Video added successfully including image upload!");
        });
      });
    } else {
      res.status(400).send("Please upload a valid image");
    }
  });

// Get video details route
router.route("/:id").get((req, res) => {
  fs.readFile(dataLocation, "utf8", (err, data) => {
    if (err) {
      console.log("error retrieving video list for details of a vid");
      return res.send(err);
    }

    const videos = JSON.parse(data);
    let videoMatch = videos.find((vid) => {
      return vid.id === req.params.id;
    });

    if (videoMatch) {
      videoMatch.image = frontEndFileUrl + videoMatch.image; // add URL for image
      return res.json(videoMatch);
    } else {
      return res
        .status(404)
        .send(`Could not find matching video for id: ${req.params.id}`);
    }
  });
});

// Post comments route
router.route("/:id/comments").post((req, res) => {
  // read the file to get a fresh videolist
  // Add the new comment to the video within the list
  // Finally write the updated videolist to file
  fs.readFile(dataLocation, "utf8", (err, data) => {
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
    };
    videoMatch.comments.push(commentObj);

    fs.writeFile(dataLocation, JSON.stringify(videos), (err) => {
      if (err) {
        return res.status(400).send("Error writing comment to file");
      }
      return res.status(201).send("Comment written to file");
    });
  });
});

// Delete comment route
router.route("/:id/comments/:commentId").delete((req, res) => {
  fs.readFile(dataLocation, "utf8", (err, data) => {
    if (err) {
      return res
        .status(404)
        .send("Error reading videos from file for comment deletion");
    }
    let videos = JSON.parse(data);

    let videoMatch = videos.find((vid) => vid.id === req.params.id);
    let commentIndex = videoMatch.comments.findIndex(
      (comm) => comm.id === req.params.commentId
    );

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
      res.status(200).send("Comment deleted permanently.");
    });
  });
});

module.exports = router;
