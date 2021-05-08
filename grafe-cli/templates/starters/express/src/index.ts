import express = require('express');

const app = express();

// Grafe install midlewares

// Grafe generate routes

// install wrong url catcher

// install errorHandler

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on Port ${port}`);
});
