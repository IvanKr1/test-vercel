const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const convertText = require('../examples/text'); 
const extractData = require('../examples/textToJson');
const parseRtfImages = require("../examples/images");
const convertImage = require("../examples/convertEmfToSvg");

const app = express()
const PORT = 8000


const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/output', express.static(path.join(__dirname, '../examples/_output')));



const cleanupMiddleware = (req, res, next) => {
  cleanupFolder('../examples/_output');
  cleanupFolder('uploads');
  next();
};

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get("/test", (req, res) => res.send("Express on Vercel"));

app.get('/about', (req, res) => {
  res.send('About route 🎉 ')
})

// Function to clean up files in the exports folder
function cleanupFolder(folderName) {
  const dirPath = path.join(__dirname, folderName);
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(`Error reading ${folderName} directory:`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      fs.unlink(filePath, err => {
        if (err) {
          console.error('Error deleting:', err);
        } else {
          console.log(`Deleted ${folderName}: ${filePath}`);
        }
      });
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})