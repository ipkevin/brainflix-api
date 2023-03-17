const express = require("express");
const app = express();
const port = 8080;
const multer = require("multer");
const path = require("path"); // used with file upload check
const cors = require("cors");
const videosRoute = require('./routes/videos');

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// configure multer storage engine to store files
const storageEngine = multer.diskStorage({
    destination: "./public",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}--${file.originalname}`)
    },
});

// Create multer instance configured to use storageEngine to handle storage
const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 2000000},
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
        return cb("Error: You can only upload images!")
    }
};

// Use the multer middleware to process image uploads
app.post("/singleimage", upload.single("image"), (req, res) => {
    if (req.file) {
        console.log("*** in successs state of singleimage route");
        res.send("Single file upload successfully");
    } else {
        console.log("*** in err state of singleimage route");
        res.status(400).send("Please upload a valid image");
    }
})

app.use("/videos", videosRoute);

app.route("/")
.get((req,res) => {
    res.status(204).send("We got your request but we're not going to do anything about it. Any plans for the summer? Mooo.");
})

app.listen(port, () => {
    console.log("Server is now listening on port 8080");
})