const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require("fast-csv");
const { pool } = require('../models/config');
const app = express();

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = './uploads/';
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    cb(null, 'fast_' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// untuk buat ketika koneksi internet terputus
pool.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Koneksi ke database terputus');
        tambahkanLog(err);
    } else {
        console.error('Kesalahan koneksi database:', err.message);
    }
});

const uploadcsv = async (filePath) => {
    const connection = await pool.promise().getConnection();
    try {
        let stream = fs.createReadStream(filePath);
        let csvDataColl = [];
        let batchCount = 0;
        // fungsi untuk menjalankan method csv mengambil dari csv-parser
        const fileStream = csv.parse()
            .on('data', async function (data) {
                console.log('Data dari CSV:', data); // Log setiap baris data

                csvDataColl.push(data);

                if (csvDataColl.length >= 5000) {
                    fileStream.pause();

                    // Proses setiap data dan masukkan ke database
                    for (const row of csvDataColl) {
                        const no = row[0];
                        const product = row[1];
                        const name = row[2];
                        const buy = row[3];
                        // console.log("cek row1", row1);
                        // console.log("cek row2", row2);
                        // console.log("cek row3", row3);
                        // console.log("cek row4", row1);

                        const query = "INSERT INTO tbl_csv (no, product, name, buy) VALUES (?, ?, ?, ?)";
                        const values = [no, product, name, buy];

                        await connection.query(query, values);
                    }

                    // Bersihkan array untuk batch berikutnya
                    csvDataColl = [];

                    batchCount++;

                    // Logika untuk memberhentikan proses pengunggahan setelah beberapa batch
                    if (batchCount >= 2) {
                        fileStream.resume();
                    } else {
                        setTimeout(() => {
                            fileStream.resume();
                        }, 1000);
                    }
                }
            })
            .on('end', async function () {
               console.log("tes");
            });

        stream.pipe(fileStream);
    } catch (error) {
        console.log(error);
    }
}

// Endpoint untuk mengunggah file CSV
const fileCsv = app.post('/csv', upload.single('csvFile'), async (req, res) => {
    try {
        // Mengambil path file yang diunggah
        const filePath = req.file.path;

        // Proses file CSV sesuai kebutuhan Anda
        await uploadcsv(filePath);

        // Respon ke klien
        res.status(200).json({ message: 'File CSV berhasil diunggah', filePath });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengunggah file CSV' });
    }
});
module.exports={
    fileCsv 
}