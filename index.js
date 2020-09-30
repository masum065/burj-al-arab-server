const express = require('express');



const port = 5000;
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()

// const uri =
//   `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}.fwfle.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
app.use(bodyParser.json());
app.use(cors());


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.fwfle.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});




const serviceAccount = require('./burj-al-arab-1819b-firebase-adminsdk-6de66-85da678a8b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://burj-al-arab-1819b.firebaseio.com',
});


client.connect((err) => {
  const bookings = client.db('burjAlArab').collection('bookings');

  app.post('/addBooking', (req, res) => {
    const body = req.body;
    bookings.insertOne(body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });



  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;

    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log(idToken);
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;

          if (tokenEmail && queryEmail) {
            bookings
              .find({
                email: req.query.email
              })
              .toArray((err, documents) => {
                res.send(documents);
              });
          } else {
            res.status(401).send('unauthorized');
          }
        })
        .catch(function (error) {
          res.status(401).send('unauthorized');
        });
    } else {
      res.status(401).send('unauthorized');
    }

    // bookings.find({ email: req.query.email }).toArray((err, documents) => {
    //   res.send(documents);
    // });
  });
});


app.get('/', (req, res) => {
  res.send('hello world');
});

app.listen(port);