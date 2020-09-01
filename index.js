const express = require('express');
const bodyParser = require('body-parser');
const cors  = require('cors');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
// directly passing app express object to http server method
// bcoz socket io has to tie up with node and express server
// so we imported io and passed reference to http


// we cant serve socket io with express server directly
// so we have changed to app.listen to http.listen



app.use(express.static(__dirname));
app.use(bodyParser.json());
// to parse incoming json data in req.body

// using cors
app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));
// to parse req.body coming from form data


// mongobd atlas connection string

const dbUrl = process.env.MONGODB_URI || 'mongodb+srv://Jash:jash_u_patel007@atmsystem.8wrl0.mongodb.net/ChatApp?retryWrites=true&w=majority';

// create mongoose schema

const chatMessagesSchema = mongoose.Schema({
  name: String,
  message: String

},{ timestamps : true});

// create mongoose model
// if you dont want mongodb to assign name on its own
// pass third argument collection name
// so collection name willbe exact as mentioned

var ChatMessages = mongoose.model('chatMessage',chatMessagesSchema,'chatMessages');


// const messages = [{ name:'Jash', message:'heyy'},{ name:'Jenny', message:'hii'}];

// route to get mesages
app.get('/messages', (req, res)=>{
  try{

  ChatMessages.find({},(err, messages)=>{

    res.send(messages);

  });

  }
  catch(err){
    res.sendStatus(500);
    return console.error(err)
  }
});

//route to post message
app.post('/messages', (req, res)=>{
  try{

    console.log(req.body);
    const chatMessage = new ChatMessages(req.body);
    chatMessage.save((err)=>{
    if(err){
      res.sendStatus(500);
    }

    //  messages.push(req.body);
    // emitting event message amd passing req.body with it when post is called
     io.emit('message', req.body);
    res.sendStatus(200);

  });

  }
  catch(err){
    // if(err){
          res.sendSstatus(500);
          return console.error(err)
      //   }
  }

  // chatMessage.save().then(()=>{
  //   io.emit('message', req.body);
  //  res.sendStatus(200);


  // })
  // .catch((err)=>{
  //   if(err){
  //     res.sendStatus(500);
  //     return console.error(err)
  //   }

  // })

});


// creating an event for socket io server
// using connection event pass variable socket

io.on('connection', (socket)=>{
    console.log('user connected');
});
// console.log('hii ');

// connect to mongodb server
mongoose.connect(dbUrl,{useNewUrlParser:true, useUnifiedTopology:true }, (err)=>{
  // console.log('hiy ');

  console.log('mongodb connection error: ',err);
})

// cannot serve socket.io directly with express server
// so use hhtp server to serve socketio
// const PORT = process.env.PORT
var PORT = process.env.PORT || 3000; // to listen to the port given by heroku or cloud env to run our server

http.listen(PORT,()=>{
  console.log('chat app server..');
});
