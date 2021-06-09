import mongoose = require('mongoose');

export function configureDatabase() {
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('src.index: Successfully connected to the Database!');
}).catch(err => {
    console.log(err);
});
}
