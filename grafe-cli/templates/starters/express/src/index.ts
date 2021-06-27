import express = require('express');
import { initCore } from '@grafe/grafe-core';
import * as path from 'path';

const app = express();

initCore(path.join(__dirname, '../grafe.json'), app);

// get the port the server should use
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on Port ${port}`);
});
