const express=require('express');
const app=express();
const cors=require('cors');
const MongoClient = require('mongodb').MongoClient;
const bodyParser=require('body-parser');
require('dotenv').config()


const port=process.env.PORT || 5055;


app.use(cors());
app.use(bodyParser.json());

app.use(express.static('services'));
app.use(fileUpload());



app.get('/',(req,res)=>{
    res.send('Hello World!')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fyzwt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookCollection = client.db("homeFix").collection("book");
  const serviceCollection = client.db("homeFix").collection("services");
  console.log('connection err',err)
//   client.close();

app.get('/Book', (req, res) => {
  bookCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
})

app.post('/BooksByDate', (req, res) => {
  const date = req.body;
  const email = req.body.email;
  serviceCollection.find({ email: email })
      .toArray((err, services) => {
          const filter = { date: date.date }
          if (services.length === 0) {
              filter.email = email;
          }
          bookCollection.find(filter)
              .toArray((err, documents) => {
                  console.log(email, date.date, services, documents)
                  res.send(documents);
              })
      })
})

app.post('/addService', (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const email = req.body.email;
  const newImg = file.data;
  const encImg = newImg.toString('base64');

  var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  };

  serviceCollection.insertOne({ name, email, image })
      .then(result => {
          res.send(result.insertedCount > 0);
      })
})

app.get('/doctors', (req, res) => {
  serviceCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});

app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  serviceCollection.find({ email: email })
      .toArray((err, services) => {
          res.send(services.length > 0);
      })
})

});



app.listen(port,()=>{
    console.log(`Example app listening at http://localhost:${port}`)
})