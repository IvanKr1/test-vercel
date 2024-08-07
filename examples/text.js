const fs = require('fs');
const CloudConvert = require('cloudconvert');
const https = require('https');
const path = require('path');
const cloudConvert = new CloudConvert("eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNDIxNDA1ZGE5OGJkNzJiNjlmZDVkMTdjYjhiZWRhM2ZiMjVjYTU5OTViZDMzMTg3NjVhNjhhNTU1MTcwNGUyZjllN2Y2YmE2ZDFiYWNkZjIiLCJpYXQiOjE3MjA2MjA3ODEuODgxMDAyLCJuYmYiOjE3MjA2MjA3ODEuODgxMDAzLCJleHAiOjQ4NzYyOTQzODEuODc2Mjk3LCJzdWIiOiI2ODk1ODExMiIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIiwidXNlci53cml0ZSIsInVzZXIucmVhZCJdfQ.aa97tEXr_BxGUte3TtwK87O4RKVeKs1yj_LxX1-Y8xqOKAQiEGlBmRI_-x0dZ__YuP2zGAb4cABCK8YdnIlrlA9KRLqQfnbuc7PBCqv9xn6-1otzgTTzz3fJqxacxWUrDxS37aPbZCpz4TSUYPM0TtNItPIdzq_Wa_pYA-JpxJPQ88djW5oDyIJ_970Hi687Q4WVpoeUdstUi2Xkn2_oz-3U9kw2zRH4xLIIxE5MThZuFx2GIyEcyziP7G777ca1bGgNSx4YD9Lu3kbq48ijaznWH9Uwl6b7kYXHH_02E-gUX5jwLcuYpe86s5ULDD2ldmB_DgLNXN3q4ZWB8mEM5d6F23aQw4_YLAzyhDXpIRLQZv63STrw9opcRYegCYihkZiZndG-L82s1hHWpm-KbtyaTIBI2z9UECL0_wN5HlJ9pccNUSIvpQxUfzVi_lNM8qRUBYL8_gWooe3mGp3CGpwrH8McjbiCkiOrbyFHKGocdj3ofVv34In6jSObYttprGaO_0QN52_RaidsnMRXhJyjmpzuOLtzVrWSOEXywPqJzm7Ui54DZCN62k2-ES8OHNXZtaSL2qxWu7jPuxZbOmBW1TUCt6wk2TCzagdfIGVWmvl5RKrwEOPbM_CDsYtKAC1mQhTJrRC4CSqa-wn0NPneqgKkZICa6l6ChIwXDyo");

async function convertText(rtfPath) {
  try {
    // Read the content of img0.emf file 
    const rtfContent = fs.readFileSync(rtfPath);
    const rtfBuffer = Buffer.from(rtfContent).toString('base64');
    

    // Start the conversion job
    let job = await cloudConvert.jobs.create({
        "tasks": {
            "import-1": {
                "operation": "import/base64",
                "file": rtfBuffer,
                "filename": "test.rtf"
            },
            "task-1": {
                "operation": "convert",
                "input_format": "rtf",
                "output_format": "txt",
                "engine": "libreoffice",
                "input": [
                    "import-1"
                ],
            },
            "export-1": {
                "operation": "export/url",
                "input": [
                    "task-1"
                ],
                "inline": false,
                "archive_multiple_files": false
            }
        },
        "tag": "jobbuilder"
    });

 

    job = await cloudConvert.jobs.wait(job.id);

    const file = cloudConvert.jobs.getExportUrls(job)[0];

        // Download the converted file and save it to output.txt
        return new Promise((resolve, reject) => {
          https.get(file.url, (response) => {
            let data = '';
    
            response.on('data', (chunk) => {
              data += chunk;
            });
    
            response.on('end', () => {
              resolve(data);
            });
    
            response.on('error', (error) => {
              reject(error);
            });
          });
        });
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = convertText;
