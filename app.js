//Declaration et initialisation de tout les modules a utiliser dans le programmes
//const http = require('http');


const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose")
const config = require('./BD.js')
const bodyParser = require('body-parser');
const route = require('./public/route.js')
const PORT = process.env.PORT || 8082
const methodOverride = require('method-override')
mongoose.Promise = global.Promise
mongoose.connect(config.DB,{useUnifiedTopology: true, useNewUrlParser: true }).then(
    () => { console.log("Database is connected") },
    err => { console.log('Can not connect to the database' + err) }
)

app.use(methodOverride('X-HTTP-Method')) 
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride('X-Method-Override'))
app.use(methodOverride('_method'))
// app.use(express.static('./public'))
// app.use(express.static('./public'));
app.use(express.static(__dirname + '/public'));


app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', route)
// extra_fs.emptyDirSync(redacted_files_directory); //Vidage du dossier redacted_files
// extra_fs.emptyDirSync(clickable_files_directory); //Vidage du dossier clickables_files

app.listen(PORT, function(){
    console.log("server running ", PORT);
})

