const express = require('express');
const cors = require('cors');
const { fileCsv } = require('./Controller/controllercsv');

require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(cors());

app.get("/", (req, res) => {
    res.send("Ini adalah rute tes. Aplikasi Express bekerja dengan baik!");
});

app.use("/api", fileCsv);
// app.use('/' );


app.listen(port, function(){
    console.log(`Server is running on port ${port}`);
});