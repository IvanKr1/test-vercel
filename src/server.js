const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const convertText = require('../examples/text'); 
const extractData = require('../examples/textToJson');
const parseRtfImages = require("../examples/images");
const convertImage = require("../examples/convertEmfToSvg");

const port = 8080;

// Configure multer for file uploads
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


app.get("/test", (req, res) => res.send("Express on Vercel"));

// Define a route handler for file upload
app.post('/upload',cleanupMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log("File uploaded:", req.file);

  const uploadedFilePath = path.join(__dirname, 'uploads', req.file.filename);

  try {
    const textData = await convertText(uploadedFilePath);
    console.log('textData', textData)
    const jsonData = await extractData(textData);
    const images = await parseRtfImages(uploadedFilePath);
    
    const svgFiles = await convertImage(images);

    // Send JSON response to frontend
    res.json({
      data: {
        jsonData,
        svgFiles: svgFiles.map(file => ({
          filename: file.filename,
          url: `/output/${path.basename(file.path)}`
        }))
      }
    });



  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Failed to convert file' });
  }
});

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
