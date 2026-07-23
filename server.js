const express = require("express");
const muhammara = require("muhammara");
const { Buffer } = require("buffer");

const app = express();

// Increase limit because PDFs in Base64 can be large
app.use(express.json({ limit: "100mb" }));

app.post("/encrypt", (req, res) => {
    try {
        const { fileBase64, password } = req.body;

        if (!fileBase64 || !password) {
            return res.status(400).json({
                error: "fileBase64 and password are required",
            });
        }

        // Decode Base64 PDF
        const pdfBuffer = Buffer.from(fileBase64, "base64");

        const readStream = new muhammara.PDFRStreamForBuffer(pdfBuffer);
        const writeStream = new muhammara.PDFWStreamForBuffer();

// Encrypt PDF
muhammara.recrypt(readStream, writeStream, {
    userPassword: password,  
    ownerPassword: password, 
    userProtectionFlag: 4,
});

        const encryptedBase64 = writeStream.buffer.toString("base64");

        res.json({
            success: true,
            encryptedFileBase64: encryptedBase64,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});