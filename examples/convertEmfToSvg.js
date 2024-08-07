const fs = require('fs');
const CloudConvert = require('cloudconvert');
const https = require('https');
const path = require('path');
const cloudConvert = new CloudConvert("eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNDIxNDA1ZGE5OGJkNzJiNjlmZDVkMTdjYjhiZWRhM2ZiMjVjYTU5OTViZDMzMTg3NjVhNjhhNTU1MTcwNGUyZjllN2Y2YmE2ZDFiYWNkZjIiLCJpYXQiOjE3MjA2MjA3ODEuODgxMDAyLCJuYmYiOjE3MjA2MjA3ODEuODgxMDAzLCJleHAiOjQ4NzYyOTQzODEuODc2Mjk3LCJzdWIiOiI2ODk1ODExMiIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIiwidXNlci53cml0ZSIsInVzZXIucmVhZCJdfQ.aa97tEXr_BxGUte3TtwK87O4RKVeKs1yj_LxX1-Y8xqOKAQiEGlBmRI_-x0dZ__YuP2zGAb4cABCK8YdnIlrlA9KRLqQfnbuc7PBCqv9xn6-1otzgTTzz3fJqxacxWUrDxS37aPbZCpz4TSUYPM0TtNItPIdzq_Wa_pYA-JpxJPQ88djW5oDyIJ_970Hi687Q4WVpoeUdstUi2Xkn2_oz-3U9kw2zRH4xLIIxE5MThZuFx2GIyEcyziP7G777ca1bGgNSx4YD9Lu3kbq48ijaznWH9Uwl6b7kYXHH_02E-gUX5jwLcuYpe86s5ULDD2ldmB_DgLNXN3q4ZWB8mEM5d6F23aQw4_YLAzyhDXpIRLQZv63STrw9opcRYegCYihkZiZndG-L82s1hHWpm-KbtyaTIBI2z9UECL0_wN5HlJ9pccNUSIvpQxUfzVi_lNM8qRUBYL8_gWooe3mGp3CGpwrH8McjbiCkiOrbyFHKGocdj3ofVv34In6jSObYttprGaO_0QN52_RaidsnMRXhJyjmpzuOLtzVrWSOEXywPqJzm7Ui54DZCN62k2-ES8OHNXZtaSL2qxWu7jPuxZbOmBW1TUCt6wk2TCzagdfIGVWmvl5RKrwEOPbM_CDsYtKAC1mQhTJrRC4CSqa-wn0NPneqgKkZICa6l6ChIwXDyo");

async function convertImage(images) {
  const svgFiles = [];

  try {
    for (let i = 0; i < images.length; i++) {
      const fileBuffer = Buffer.from(images[i]).toString('base64');

      let job = await cloudConvert.jobs.create({
        tasks: {
          'import-3': {
            operation: 'import/base64',
            file: fileBuffer,
            filename: `img${i}.emf`
          },
          task2: {
            operation: 'convert',
            input: [
              'import-3'
            ],
            input_format: 'emf',
            output_format: 'svg',
            engine: 'inkscape',
            text_to_path: false,
            engine_version: '1.2.2',
            filename: `output${i}.svg`
          },
          export2: {
            operation: 'export/url',
            input: [
              'task2'
            ],
            inline: false,
            archive_multiple_files: false
          }
        },
        tag: 'jobbuilder'
      });


      job = await cloudConvert.jobs.wait(job.id);

      const file = cloudConvert.jobs.getExportUrls(job)[0];
      const filePath = path.join(__dirname, '_output', `${i + 1}-shape.svg`);
      const writeStream = fs.createWriteStream(filePath);

      await new Promise((resolve, reject) => {
        https.get(file.url, function(response) {
          response.pipe(writeStream);
        }).on('error', reject);

        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      svgFiles.push({ filename: `${i + 1}-shape.svg`, path: filePath });
    
    }
console.log('svgFiles', svgFiles)
    return svgFiles;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = convertImage;
