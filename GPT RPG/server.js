const express = require("express");
const app = express();
const path = require("path");
const mime = require('mime-types');

app.get('/dist/bundle.js', (req, res) => {
    res.setHeader('Content-Type', mime.contentType('js'));
    res.sendFile(path.join(__dirname, 'dist', 'bundle.js'));
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});