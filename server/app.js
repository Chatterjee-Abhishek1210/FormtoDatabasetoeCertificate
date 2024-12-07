
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the public directory

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/certificateDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema and model
const dataSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const Data = mongoose.model('Data', dataSchema);

// Function to create PDF certificate
function createPDF(name, callback) {
    const doc = new PDFDocument({
        size: [2000, 1414], // Ensure proper page size
        margin: 0, // Remove margins for a full-page background
    });

    const filePath = path.join(__dirname, 'public', `${name}_certificate.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Add background image
    const backgroundPath = path.join(__dirname, 'public', 'background_image.png');
    doc.image(backgroundPath, 0, 0, { width: 2000, height: 1414 });

    // Add recipient's name
    doc
        .font('Helvetica-Bold')
        .fontSize(50)
        .fillColor('black')
        .text(
            name,
            1000 - 250, // Horizontal position (centered horizontally, adjusted by 200 for offset)
            720 - 30,   // Vertical position (centered vertically, adjusted by font size)
            { align: 'center', width: 500 } // Width to limit text wrapping
        );

    // Finalize the PDF and end the stream
    doc.end();

    // Wait for the stream to finish
    stream.on('finish', () => callback(null, filePath));
    stream.on('error', (error) => callback(error, null));
}

// Route to handle form submission
app.post('/submit', async (req, res) => {
    const { name, email } = req.body;

    // Save user data to MongoDB
    const newData = new Data({ name, email });

    try {
        await newData.save();
        console.log('Data saved successfully');

        // Generate PDF certificate
        createPDF(name, (error, pdfPath) => {
            if (error) {
                console.error('Error generating the PDF:', error);
                res.status(500).send('Error generating the PDF');
                return;
            }

            // Ensure the file is ready for download
            // res.download(pdfPath, (err) => {
            //     if (err) {
            //         console.error('Error downloading the PDF:', err);
            //         res.status(500).send('Error downloading the file');
            //     }
            // });
            res.download(pdfPath, `${name}_certificate.pdf`, (err) => {
                if (err) {
                    console.error('Error downloading the PDF:', err);
                    res.status(500).send('Error downloading the file');
                }
            });
        });
    } catch (error) {
        console.error('Error saving data to the database:', error);
        res.status(500).send('Error submitting data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
