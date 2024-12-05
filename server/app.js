const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(express.urlencoded({ extended: false }));

const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
    
})

console.log(__dirname + '/public/index.html');



mongoose.connect('mongodb://localhost:27017',{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
})
const Schema = mongoose.Schema;
const dataSchema = mongoose.Schema({
    name: String,
    email: String,
})

const Data = mongoose.model('Data', dataSchema);

app.post('/submit', (req, res) => {
    const {name,email} = req.body;
    const newData = new Data({
        name,
        email,
    });
    newData.save();

    res.send('data Submit Successfully');
})
app.listen(port,() => {
    console.log(`server is running at port ${port}`);
})