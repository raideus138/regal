const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const port = process.env.TEST_PORT || 3002;
const app = express();
const publicPath = path.join(__dirname, '../regal/');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'main.html'));
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    });

