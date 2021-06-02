import express = require('express');
import { initCore } from '@grafe/grafe-core/build';

const app = express();

initCore('../grafe.json', app);

// get the port the server should use
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on Port ${port}`);
});
