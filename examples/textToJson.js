const fs = require('fs');
const path = require('path');

async function txtToJSON(textData) {
    try {
        // Function to parse the data
        function parseData(data) {
            // Extract the "Šipke - specifikacija" section
            const specificationSection = data.split('Šipke - specifikacija')[1].split('Šipke - rekapitulacija')[0].trim();
            
            // Split the section into lines and filter out empty lines
            const lines = specificationSection.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            const rekapitulacijaSection = data.split('Šipke - rekapitulacija')[1].trim();
            const rekapitulacijaLines = rekapitulacijaSection.split('\n').filter(line => line.trim() !== '');
            
            // Initialize result array
            const result = [];

            // Skip initial header lines (assuming the actual data starts after a few lines)
            let dataStartIndex = 0;
            for (let i = 0; i < lines.length; i++) {
                if (!isNaN(parseFloat(lines[i])) && lines[i].length > 0) {
                    dataStartIndex = i;
                    break;
                }
            }

            // Process each row assuming each entry is 5 lines
            for (let i = dataStartIndex; i < lines.length; i += 5) {
                // Check if there are enough lines to form a complete entry
                if (i + 4 < lines.length) {
                    // Create entry
                    const entry = {
                        ozn: lines[i],
                        "Ø [cm]": lines[i + 1],
                        "lg [m]": lines[i + 2],
                        "n [kom]": lines[i + 3],
                        "lgn [m]": lines[i + 4]
                    };

                    // Only add entry if it has valid values
                    if (Object.values(entry).every(value => !isNaN(parseFloat(value)) || value.length > 0)) {
                        result.push(entry);
                    }
                }
            }

            rekapitulacijaLines.forEach((line, index) => {
                // Handle B 500B section
                console.log('line', line)
                if (line.startsWith('B 500B')) {
                    current = {
                        "summary": true,
                        Ø: rekapitulacijaLines[index + 1],
                        'lgn [m]': rekapitulacijaLines[index + 2],
                        'Jedinična težina [kg/m\']': rekapitulacijaLines[index + 3],
                        'Težina [kg]': rekapitulacijaLines[index + 4]
                    };
                }

            });

            console.log('current', current)

            // Extract "Ukupno" values
            const ukupnoSection = data.split('Šipke - rekapitulacija')[1].split('Ukupno')[1];
            const ukupnoLines = ukupnoSection.split('\n').filter(line => line.trim() !== '');
            if (ukupnoLines.length > 1) {
                current["Ukupno"] = ukupnoLines[1].trim(); // Assuming "Ukupno" value is in the second line
            }

            console.log('current', current)

            result.push(current);

            return result;
        }
        // Parse the data and convert to JSON
        const jsonData = parseData(textData);
        return jsonData; // Return the JSON data directly

    } catch (error) {
        console.error('Error:', error);
        throw error; // Throw error to be handled by caller
    }
}

// txtToJSON();

module.exports = txtToJSON;
