const express = require("express")
const routeExp = express.Router()

const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const extra_fs = require('fs-extra');
const os = require('os')
const cors = require('cors')

const app = express()

//app.use(cors());
var contentDisposition = require('content-disposition')

//Declaration des variables globales
var FILE_NAME = ''; //variable pour stocker le nom de fichier a traiter
var OUTPUT_FILE_NAME = ''; //variable pour stocker le nom de fichier traiter qui sort dans le dossier redacted files
var OUTPUT_FILE_NAME_CLICK = ''; //variable pour stocker le nom de fichier traiter qui sort dans le dossier clickable files
var selected_files = []; //un array pour stocker tout les fichiers pdf dans le dossier selectionner
var pdfpath_redacted; // variable pour le nom de chaque fichier traités + le mot redacted
var pdfpath_clickable; // variable pour le nom de chaque fichier traités + le mot clickable
var Time = 0; //Variable time pour un time quoi
var numBtn = 1; //Variable numbtn a utiliser pour le numero de button (a voir dans la fonction button_redacted)
var dir_home = os.homedir()
var dir_desktop = path.join(dir_home, "Desktop", "Download");


var redacted_files_directory = "Downloads/Readact"; //variable pour le dossier a vider a chaque fois que le programme commence a traiter un dossier selectionné
var zip_files_directory = "Downloads/zip"; //variable pour le dossier a vider a chaque fois que le programme commence a traiter un dossier selectionné
var clickable_files_directory = "Downloads/Clickable"; //variable pour le dossier a vider a chaque fois que le programme commence a traiter un dossier selectionné


// fonction pour ecrire dans un fichier progress.txt (utile pour le loading sur l'interface)
function progress(value) {
    // let fs = require('fs');
    return fs.writeFileSync('./progress.txt', `${value}`);
}

var donne = []
routeExp.route('/parametre').post(function (req, res) {
    donne = req.body
})

var selected_files = [];

const donneAPI = [
    {
        name: 'Email',
        pattern: '[a-zA-Z0-9._%+-]+[a-zA-Z0-9._%+-]+@[A-z]+[a-zA-Z0-9._%+-]+[a-zA-Z]'
    },
    {
        name: 'Numéro téléphone',
        pattern: '[+]3{1}2{1}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{1}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{3}+[ ]{0,1}+[-]{0,1}+[.]{0,1}+\\d{2}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{2}+\\d{0,1}'
    },
    {
        name: 'Numéro permis',
        pattern: '/[1-9]{2}[ .]{0,1}(?:1[0-2]|0[0-9]{1})[ .]{0,1}[0-9]{2}[ .]{0,1}[0-9]{2}[ .]{0,1}[0-9]{4}/g'
    },
    {
        name: 'Employeur identification',
        pattern: '\\b(?:[1-9]{1}[0-9]{11})\\b'
    },
    {
        name: 'Identification nationale',
        pattern: '[0-9]{2}[.](?:1[0-2]|0[0-9]{1})[.](?:3[0-1]|0[1-9]{1}|2[0-9]{1})-[0-9]{3}[.][0-9]{2}'
    },
    {
        name: 'Numéro bancaire',
        pattern: '[A-Z]{2}[0-9]{2} ?\\d{4} ?\\d{4} ?\\d{4} ?(\\w{8})?'
    },
    {
        name: 'Numéro TVA',
        pattern: '[A-Z]{2}[ ]{0,1}[0-9]{4}[^A-Za-z0-9_]{0,1}[0-9]{3}[^A-Za-z0-9_]{0,1}[0-9]{3}'
    },
    // {
    //     name: 'Swift / BIC',
    //     pattern :''
    // },
    // {
    //     name: 'Genre',
    //     pattern :''
    // },
    // {
    //     name: 'Ethinicité',
    //     pattern :''
    // },
    // {
    //     name: "Nom d'utilisateur",
    //     pattern :''
    // },
    {
        name: 'Numéro passport',
        pattern: '\\b(?:[A-Z]{2}[0-9]{6})\\b'
    },
    // {
    //     name: 'Situation familiale',
    //     pattern :''
    // },
    // {
    //     name: "Numéro d'allocation",
    //     pattern :''
    // },
    {
        name: 'Identification véhicule',
        pattern: '\\b(?:[1-8]{1}[-][A-Y]{1}[A-Z]{2}[-][0-9]{3})\\b'
    },
    {
        name: 'VIN',
        pattern: '\\b(?:(?:[0-9]|[A-H]|[J-N]|[P]|[R-Z]){8}(?:[0-9]|[X]){1}(?:[1-9]|[A-H]|[J-N]|[P]|[R-T]|[V-Y]){1}(?:[0-9]|[A-H]|[J-N]|[P]|[R-Z]){1}[0-9]{6})\\b'
    },
    {
        name: 'Nom',
        pattern :''
    },
    {
        name: 'Ville',
        pattern :''
    },
    {
        name: 'Adresse',
        pattern :''
    }
    // {
    //     name: 'Nom de dépendance',
    //     pattern :''
    // }
]

var getParams = []

routeExp.route('/fileuploadAPI').post(function (req, res) {
    // variables à reinitialiser
    if(req.query.nom=='true'){
        let obj = {
            name: 'Nom',
            pattern: ''
        }
        getParams.push(obj)
    }
    if(req.query.adresse=='true'){
        let obj = {
            name: 'Adresse',
            pattern: ''
        }
        getParams.push(obj)
    }
    if(req.query.ville=='true'){
        let obj = {
            name: 'Ville',
            pattern: ''
        }
        getParams.push(obj)
    }
    if(req.query.email=='true'){
        let obj = {
            name: 'Email',
            pattern: '[a-zA-Z0-9._%+-]+[a-zA-Z0-9._%+-]+@[A-z]+[a-zA-Z0-9._%+-]+[a-zA-Z]'
        }
        getParams.push(obj)
    }
    if (req.query.phone=='true') {
        let obj = {
            name: 'Numéro téléphone',
            pattern: '[+]3{1}2{1}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{1}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{3}+[ ]{0,1}+[-]{0,1}+[.]{0,1}+\\d{2}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{2}+\\d{0,1}'
        }
        getParams.push(obj)
    }
    if (req.query.tva=='true') {
        let obj = {
            name: 'Numéro TVA',
            pattern: '[A-Z]{2}[ ]{0,1}[0-9]{4}[^A-Za-z0-9_]{0,1}[0-9]{3}[^A-Za-z0-9_]{0,1}[0-9]{3}'
        }
        getParams.push(obj)
    }
    if (req.query.permis=='true') {
        let obj ={
            name: 'Numéro permis',
            pattern: '/[1-9]{2}[ .]{0,1}(?:1[0-2]|0[0-9]{1})[ .]{0,1}[0-9]{2}[ .]{0,1}[0-9]{2}[ .]{0,1}[0-9]{4}/g'
        }
        getParams.push(obj)
    }
    if (req.query.passport=='true') {
        let obj =  {
            name: 'Numéro passport',
            pattern: '\\b(?:[A-Z]{2}[0-9]{6})\\b'
        }
        getParams.push(obj)
    }
    if (req.query.idVehicule=='true') {
        let obj = {
            name: 'Identification véhicule',
            pattern: '\\b(?:[1-8]{1}[-][A-Y]{1}[A-Z]{2}[-][0-9]{3})\\b'
        }
        getParams.push(obj)
    }
    if (req.query.vinVehicule=='true') {
        let obj =  {
            name: 'VIN',
            pattern: '\\b(?:(?:[0-9]|[A-H]|[J-N]|[P]|[R-Z]){8}(?:[0-9]|[X]){1}(?:[1-9]|[A-H]|[J-N]|[P]|[R-T]|[V-Y]){1}(?:[0-9]|[A-H]|[J-N]|[P]|[R-Z]){1}[0-9]{6})\\b'
        }
        getParams.push(obj)
    }

    for (let index = 0; index < getParams.length; index++) {
        const element = getParams[index];
        //console.log("element");
    }
    
    FILE_NAME = '';
    OUTPUT_FILE_NAME = '';
    OUTPUT_FILE_NAME_CLICK = '';
    pdfpath_redacted;
    Time = 10000;
    numBtn = 1;
    // Utilisation de module formidable pour prendre les fichier dans le dossier selectionnes
    let form = new formidable.IncomingForm();
    form.on('file', function (field, file) {
        //console.log("file file");
        //Insertion des fichiers pdf dans l'array selected_files
        if (file.type === 'application/pdf')
            selected_files.push(file);
    });
    form.parse(req, async function (err, fields, files) {
            extra_fs.emptyDirSync(redacted_files_directory); //Vidage du dossier redacted_files
            extra_fs.emptyDirSync(clickable_files_directory); //Vidage du dossier clickables_files
            
            progress(0); 
            if (selected_files.length === 0) {
                console.log('Aucun fichier PDF...')
            } else {
                //console.log("il y a un fichier");
                for (let file of selected_files) {
                    if (file !== undefined) {
                        setTimeout(async () => {
                            let arr = file.name.split('/');
                            FILE_NAME = arr[arr.length - 1];
                            OUTPUT_FILE_NAME = FILE_NAME.split('.pdf')[0] + '_redacted.pdf';
                            OUTPUT_FILE_NAME_CLICK = FILE_NAME.split('.pdf')[0] + '_clickable.pdf';
                            pdfpath_redacted = path.join(redacted_files_directory, OUTPUT_FILE_NAME)
                            pdfpath_clickable = path.join(clickable_files_directory, OUTPUT_FILE_NAME_CLICK);
                            await create_redaction(file.path, getParams); //une fonction pour traiter un fichier
            
                        }, Time); //Une fonction setTimeout de 10 seconde pour s'assurrer que le traitement du fichier soit bien fini (un fichier = 20 seconde)
                        //NB: Sur cette fonction si un ou plusieurs fichiers presente des champs non traitéés, il faudra augmenter le time
                        Time += 10000;
                    }
                }
                let current_nbr_file = 0; //variable pour compter les fichiers deja traites
                const counter = setInterval(() => {
                    //console.log("redacted " + selected_files.length);
                    fs.readdir(redacted_files_directory, function (err, files) {
                        if (files.length != current_nbr_file) {
                            console.log(files.length + (!(files.length > 1) ? ' fichier traité' : ' fichiers traités'));
                            progress(files.length); //Ecrire le nombre de fichier traités dans progress.txt
                        }
                        
                        current_nbr_file = files.length;
                        if (files.length >= selected_files.length){
                            clearInterval(counter);
                            //console.log("selected_files "+ selected_files.length);
                            for (let i = selected_files.length; i > 0; i--) {
                                selected_files.pop();
                            }
                            //selected_files = []
                            console.log("selected_files " + selected_files.length);
                            console.log('** Redaction terminée... **' );
                            res.sendStatus(200)
                        }
                    });
                }, 2000);
                
            }
        
    });
})
routeExp.route('/fileupload').post(function (req, res) {
    // variables à reinitialiser
    if(req.query.nom=='true'){
        let obj = {
            name: 'Nom',
            pattern: ''
        }
        getParams.push(obj)
    }
    if(req.query.adresse=='true'){
        let obj = {
            name: 'Adresse',
            pattern: ''
        }
        getParams.push(obj)
    }
    if(req.query.ville=='true'){
        let obj = {
            name: 'Ville',
            pattern: ''
        }
        getParams.push(obj)
    }
    if(req.query.email=='true'){
        let obj = {
            name: 'Email',
            pattern: '[a-zA-Z0-9._%+-]+[a-zA-Z0-9._%+-]+@[A-z]+[a-zA-Z0-9._%+-]+[a-zA-Z]'
        }
        getParams.push(obj)
    }
    if (req.query.phone=='true') {
        let obj = {
            name: 'Numéro téléphone',
            pattern: '[+]3{1}2{1}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{1}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{3}+[ ]{0,1}+[-]{0,1}+[.]{0,1}+\\d{2}+[ ]{0,1}+[.]{0,1}+[-]{0,1}+\\d{2}+\\d{0,1}'
        }
        getParams.push(obj)
    }
    if (req.query.tva=='true') {
        let obj = {
            name: 'Numéro TVA',
            pattern: '[A-Z]{2}[ ]{0,1}[0-9]{4}[^A-Za-z0-9_]{0,1}[0-9]{3}[^A-Za-z0-9_]{0,1}[0-9]{3}'
        }
        getParams.push(obj)
    }
    if (req.query.permis=='true') {
        let obj ={
            name: 'Numéro permis',
            pattern: '/[1-9]{2}[ .]{0,1}(?:1[0-2]|0[0-9]{1})[ .]{0,1}[0-9]{2}[ .]{0,1}[0-9]{2}[ .]{0,1}[0-9]{4}/g'
        }
        getParams.push(obj)
    }
    if (req.query.passport=='true') {
        let obj =  {
            name: 'Numéro passport',
            pattern: '\\b(?:[A-Z]{2}[0-9]{6})\\b'
        }
        getParams.push(obj)
    }
    if (req.query.idVehicule=='true') {
        let obj = {
            name: 'Identification véhicule',
            pattern: '\\b(?:[1-8]{1}[-][A-Y]{1}[A-Z]{2}[-][0-9]{3})\\b'
        }
        getParams.push(obj)
    }
    if (req.query.vinVehicule=='true') {
        let obj =  {
            name: 'VIN',
            pattern: '\\b(?:(?:[0-9]|[A-H]|[J-N]|[P]|[R-Z]){8}(?:[0-9]|[X]){1}(?:[1-9]|[A-H]|[J-N]|[P]|[R-T]|[V-Y]){1}(?:[0-9]|[A-H]|[J-N]|[P]|[R-Z]){1}[0-9]{6})\\b'
        }
        getParams.push(obj)
    }

    for (let index = 0; index < getParams.length; index++) {
        const element = getParams[index];
        console.log(element);
    }
    
    FILE_NAME = '';
    OUTPUT_FILE_NAME = '';
    OUTPUT_FILE_NAME_CLICK = '';
    pdfpath_redacted;
    Time = 20000;
    numBtn = 1;
    // Utilisation de module formidable pour prendre les fichier dans le dossier selectionnes
    let form = new formidable.IncomingForm();
    form.on('file', function (field, file) {
        //Insertion des fichiers pdf dans l'array selected_files
        if (file.type === 'application/pdf')
            selected_files.push(file);
    });
    form.parse(req, async function (err, fields, files) {
        if (fields.btn1 == '') {
            //Demarrage du traitement
            extra_fs.emptyDirSync(redacted_files_directory); //Vidage du dossier redacted_files
            extra_fs.emptyDirSync(clickable_files_directory); //Vidage du dossier clickables_files
            
            progress(0); //Ecrire 0 dans le fichier progress.txt
            if (selected_files.length === 0) {
                console.log('Aucun fichier PDF...')
            } else {
                //Basculer l'index html en load html pour suivre la progression du traitement
                //res.redirect('./public/load')

                res.writeHead(200, { 'Content_Type': "text/html" })
                fs.readFile('./public/load.html', null, function (error, data) {
                    if (error) {
                        res.write('file not found')
                    } else {
                        res.write(data)
                    }
                    res.end()
                })
                //res.sendFile('load.html', { root: path.join(__dirname, '../public') });
                for (let file of selected_files) {
                    if (file !== undefined) {
                        setTimeout(async () => {
                            let arr = file.name.split('/');
                            FILE_NAME = arr[arr.length - 1];
                            OUTPUT_FILE_NAME = FILE_NAME.split('.pdf')[0] + '_redacted.pdf';
                            OUTPUT_FILE_NAME_CLICK = FILE_NAME.split('.pdf')[0] + '_clickable.pdf';
                            pdfpath_redacted = path.join(redacted_files_directory, OUTPUT_FILE_NAME)
                            pdfpath_clickable = path.join(clickable_files_directory, OUTPUT_FILE_NAME_CLICK);
            
                            await create_redaction(file.path, donne); //une fonction pour traiter un fichier
            
                        }, Time); //Une fonction setTimeout de 10 seconde pour s'assurrer que le traitement du fichier soit bien fini (un fichier = 20 seconde)
                        //NB: Sur cette fonction si un ou plusieurs fichiers presente des champs non traitéés, il faudra augmenter le time
                        Time += 20000;
                    }
                }
                
                let current_nbr_file = 0; //variable pour compter les fichiers deja traites
                const counter = setInterval(() => {
                    fs.readdir(redacted_files_directory, function (err, files) {
                        if (files.length != current_nbr_file) {
                            console.log(files.length + (!(files.length > 1) ? ' fichier traité' : ' fichiers traités'));
                            progress(files.length); //Ecrire le nombre de fichier traités dans progress.txt
                        }
                        current_nbr_file = files.length;
                        if (files.length >= selected_files.length) {
                            clearInterval(counter);
                            selected_files = []
                            console.log('** Redaction terminée... **');
                        }
                    });
                }, 1000);
            }
        }else{
            extra_fs.emptyDirSync(redacted_files_directory); //Vidage du dossier redacted_files
            extra_fs.emptyDirSync(clickable_files_directory); //Vidage du dossier clickables_files
            
            progress(0);
            if (selected_files.length === 0) {
                console.log('Aucun fichier PDF...')
            } else {
                for (let file of selected_files) {
                    if (file !== undefined) {
                        setTimeout(async () => {
                            let arr = file.name.split('/');
                            FILE_NAME = arr[arr.length - 1];
                            OUTPUT_FILE_NAME = FILE_NAME.split('.pdf')[0] + '_redacted.pdf';
                            OUTPUT_FILE_NAME_CLICK = FILE_NAME.split('.pdf')[0] + '_clickable.pdf';
                            pdfpath_redacted = path.join(redacted_files_directory, OUTPUT_FILE_NAME)
                            pdfpath_clickable = path.join(clickable_files_directory, OUTPUT_FILE_NAME_CLICK);
                            await create_redaction(file.path, getParams); //une fonction pour traiter un fichier
            
                        }, Time); //Une fonction setTimeout de 10 seconde pour s'assurrer que le traitement du fichier soit bien fini (un fichier = 20 seconde)
                        //NB: Sur cette fonction si un ou plusieurs fichiers presente des champs non traitéés, il faudra augmenter le time
                        Time += 20000;
                    }
                }
                let current_nbr_file = 0; //variable pour compter les fichiers deja traites
                const counter = setInterval(() => {
                    fs.readdir(redacted_files_directory, function (err, files) {
                        if (files.length != current_nbr_file) {
                            console.log(files.length + (!(files.length > 1) ? ' fichier traité' : ' fichiers traités'));
                            progress(files.length); //Ecrire le nombre de fichier traités dans progress.txt
                        }
                        current_nbr_file = files.length;
                        if (files.length >= selected_files.length){
                            clearInterval(counter);
                            selected_files = []
                            console.log('** Redaction terminée... **');
                            res.sendStatus(200)
                        }
                    });
                }, 1000);
                
            }
        }
    });
})


app.get('/css/main.css', function (req, res) {
    res.sendFile(__dirname + "/" + "css/main.cs");
});

app.get('/css/_style.css', function (req, res) {
    res.sendFile(__dirname + "/" + "css/_style.css");
});

app.get('/css/normalize.css', function (req, res) {
    res.sendFile(__dirname + "/" + "css/normalize.css");
});
app.get('/css/normalize.css', function (req, res) {
    res.sendFile(__dirname + "/" + "css/normalize.css");
});
app.get('/js/jquery.min.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/jquery.min.js");
});
app.get('/js/parallax.min.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/parallax.min.js");
});
app.get('/js/scrollreveal.min.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/scrollreveal.min.js");
});
app.get('/js/modernizr-3.8.0.min.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/modernizr-3.8.0.min.js");
});
app.get('/js/jquery-3.4.1.min.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/jquery-3.4.1.min.js");
});
app.get('/js/plugins.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/plugins.js");
});
app.get('/js/main.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/main.js");
});
app.get('/js/read.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/read.js");
});
app.get('/js/scrollreveal.min.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/scrollreveal.min.js");
});
app.get('/js/api.js', function (req, res) {
    res.sendFile(__dirname + "/" + "js/api.js");
});
app.get('/hero.jpg', function (req, res) {
    res.sendFile(__dirname + "/" + "hero.jpg");
});
app.get('/visual-v2.jpg', function (req, res) {
    res.sendFile(__dirname + "/" + "visual-v2.jpg");
});
app.get('/visual-v1.jpg', function (req, res) {
    res.sendFile(__dirname + "/" + "visual-v1.jpg");
});

routeExp.route('/apiRest').get(function (req, res) {
    //rsres.writeHead(200, { 'content-type': 'text/plain' });
    fs.readFile('./public/restAPI.html', null, function (error, data) {
        if (error) {
            res.write('file not found')
        } else {
            res.write(data) 
        }
        res.end()
    })
})

routeExp.route('/progress.txt').get(function (req, res) {
    //rsres.writeHead(200, { 'content-type': 'text/plain' });
    fs.readFile('./progress.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        } else {
            res.writeHeader(200, { "Content-Type": "text/plain" });
            res.write(data);
            res.end();
        }
    });
})

routeExp.route('/api/option').get(function (req, res){
    extra_fs.emptyDirSync(zip_files_directory)

    var zipdir = require('zip-dir');
    zipdir('Downloads/Clickable', { saveTo: 'Downloads/zip/Clickable.zip' }, function (err, buffer) {
    });
    zipdir('Downloads/Readact', { saveTo: 'Downloads/zip/Readact.zip' }, function (err, buffer) {
    });
    res.send('Vous pouvez télécharger le zip Clickable et Readact')
})

routeExp.route('/option').get(function (req, res) {
    extra_fs.emptyDirSync(zip_files_directory)
    var zipdir = require('zip-dir');
    zipdir('Downloads/Clickable', { saveTo: 'Downloads/zip/Clickable.zip' }, function (err, buffer) {
    });
    zipdir('Downloads/Readact', { saveTo: 'Downloads/zip/Readact.zip' }, function (err, buffer) {
    });


    res.writeHead(200, { 'Content_Type': "text/html" })
    fs.readFile('./public/option.html', null, function (error, data) {
        if (error) {
            res.write('file not found')
        } else {
            res.write(data) 
        }
        res.end()
    })
})

routeExp.route('/downloadClick').get(function (req, res) {
    var path_click = 'Downloads/zip/Clickable.zip'
    // //Set require Header
    // // Request headers you wish to allow
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', contentDisposition(path_click))
    // // send file
    var stream1 = fs.createReadStream(path_click)
    stream1.pipe(res)
    stream1.on('close', () => {
        stream1.destroy()
    })
    res.writeHeader(200, { "Content-Type": "text/plain" });
    res.write('File downloaded');

})

routeExp.route('/downloadRead').get(function (req, res) {
    var path_readact = 'Downloads/zip/Readact.zip'
    // //Set require Header
    // // Request headers you wish to allow
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', contentDisposition(path_readact))
    // // send file
    var stream2 = fs.createReadStream(path_readact)
    stream2.pipe(res)
    stream2.on('close', () => {
        stream2.destroy()
    })
    res.writeHeader(200, { "Content-Type": "text/plain" });
    res.write('File downloaded');
})

routeExp.route('/').get(function (req, res) {
    fs.readFile("../public/index.html", "UTF-8", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
})

routeExp.route('../public/*')

// PDF REDACTION
const { PDFNet } = require('@pdftron/pdfnet-node')

const route = express.Router();
let Users = require('./model/model')

var province = []

    fs.readFile('./public/json/tableau.json', (err, data) => {
        if (err) throw err;
        var region = JSON.parse(data);
        
        for (let index = 0; index < region.length; index++) {
            province.push(region[index].province)
        }
    });


async function create_redaction(pdffile, cachedata) {

    for (let index = 0; index < cachedata.length; index++) {
        
        let clef = cachedata[index].name
        if (clef == "Nom" || clef == "Adresse" || clef == "Ville") {
            if (clef == "Nom") {
                try {
                    let result = await Users.distinct('nom');
                    result.forEach(async element => {
                        if (element.length !== 0) {
                            let nom =
                            {
                                name: "Noms",
                                pattern: String(element)
                            }
                            await search_redact(nom);
                        }
                    });
                } catch (error) {
                    logger.error(error);
                    res.status(500).json({ details: error });
                }
            } else if (clef == "Adresse") {
                try {
                    let result = await Users.distinct('adresse');
                    result.forEach(async r => {
                        if (r.length !== 0) {
                            let adresse =
                            {
                                name: "Adresse",
                                pattern: String(r)
                            }
                            await search_redact(adresse);
                        }
                    });
                } catch (error) {
                    logger.error(error);
                    res.status(500).json({ details: error });
                }
            } else if (clef == "Ville") {
                try {
                    let result = await Users.distinct('ville');
                    
                    
                    //console.log("provindce == " + province);
                    //province.forEach(element1 => console.log("provindce "))
                    //console.log("res == " + province);
                    result.forEach(async element => {
                        if (element !== "") {
                            let ville =
                            {
                                name: "Ville",
                                pattern: String(element)
                            }
                            await search_redact(ville);
                            //console.log("ville " + JSON.stringify(ville) );
                        }
                    });
                    // result.forEach(async element => {
                    //     if (element.length !== 0) {
                    //         console.log(element);
                    //         let ville =
                    //         {
                    //             name: "Ville",
                    //             pattern: String(element)
                    //         }
                    //         await search_redact(ville);
                    //     }
                    // });
                } catch (error) {
                    logger.error(error);
                    res.status(500).json({ details: error });
                }
            }
        } else {
            await search_redact(cachedata[index]);
        }
    }
    //con.end()

    //console.log("create_redact");

    var inputPath_redacted = pdffile; // pdf a chercher
    var inputPath_clickable = pdffile; // pdf a chercher
    //Fonction pour chercher un mot dans le pdf
    function search_redact(pattern) {
        //console.log("search_reda");
        const main = async () => {
            try {
                const doc = await PDFNet.PDFDoc.createFromUFilePath(pdffile);
                doc.initSecurityHandler();
                doc.lock();
                const txtSearch = await PDFNet.TextSearch.create();
                let mode = (PDFNet.TextSearch.Mode.e_whole_word | PDFNet.TextSearch.Mode.e_highlight) + PDFNet.TextSearch.Mode.e_reg_expression;
                txtSearch.begin(doc, pattern.pattern, mode);
                let result = await txtSearch.run();
                while (true) {
                    if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
                        let hlts = result.highlights;
                        hlts.begin(doc);
                        while ((await hlts.hasNext())) {
                            const quadArr = await hlts.getCurrentQuads();
                            for (let i = 0; i < quadArr.length; ++i) {
                                //Coordonnée du mot trouvé dans le pdf 
                                const currQuad = quadArr[i];
                                const x1 = Math.min(Math.min(Math.min(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                                const x2 = Math.max(Math.max(Math.max(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                                const y1 = Math.min(Math.min(Math.min(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);
                                const y2 = Math.max(Math.max(Math.max(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);
                                redact_create(x1, y1, x2, y2, result.page_num, pattern.name); //Mettre un redact dans le coordonnée designé
                                button_create(x1, y1, x2, y2, result.page_num, pattern.name); //Mettre un masque clickable dans le coordonnée designé
                                break;
                            }
                            hlts.next();
                            break;
                        }
                        while (await hlts.hasNext()) {
                            await hlts.next();
                        }
                    } else if (result.code === PDFNet.TextSearch.ResultCode.e_page) {
                        ////////////////////////////////////////

                    } else if (result.code === PDFNet.TextSearch.ResultCode.e_done) {
                        ///////////////////////////////////////
                        await doc.save(pdfpath_redacted, PDFNet.SDFDoc.SaveOptions.e_linearized);
                        inputPath_redacted = pdfpath_redacted;
                        await doc.save(pdfpath_clickable, PDFNet.SDFDoc.SaveOptions.e_linearized);
                        inputPath_clickable = pdfpath_clickable;
                        break;
                    }
                    result = await txtSearch.run();
                }
            } catch (err) {
                console.log(err);
            }
            //Fonction pour redacter
            function redact_create(x1, y1, x2, y2, page_num, name) {
                ((exports) => {
                    exports.runPDFRedactTest = () => {
                        const main = async () => {
                            try {
                                const doc = await PDFNet.PDFDoc.createFromFilePath(inputPath_redacted);
                                doc.initSecurityHandler();

                                const blankPage = await doc.getPage(page_num);
                                const btn_field = await doc.fieldCreate("button." + numBtn, PDFNet.Field.Type.e_button);
                                const btnbox = await PDFNet.PushButtonWidget.createWithField(doc, await PDFNet.Rect.init(x1, y1, x2, y2), btn_field);
                                btnbox.setBackgroundColor(await PDFNet.ColorPt.init(0, 0, 0), 1);
                                fields = ["button." + numBtn];
                                //await btnbox.setAction(await PDFNet.Action.createHideField(doc, fields));
                                btnbox.setStaticCaptionText(name)
                                btnbox.refreshAppearance();
                                blankPage.annotPushBack(btnbox);

                                numBtn++;

                                await doc.save(pdfpath_redacted, PDFNet.SDFDoc.SaveOptions.e_linearized);
                                inputPath_redacted = pdfpath_redacted;
                            } catch (err) {
                                console.log(err.stack);
                            }
                        };

                        // add your own license key as the second parameter, e.g. PDFNet.runWithCleanup(main, 'YOUR_LICENSE_KEY')
                        PDFNet.runWithCleanup(main).then(function () { PDFNet.shutdown(); });
                    };
                    exports.runPDFRedactTest();
                })(exports);

            }

            // Fonction pour creer un bouton
            function button_create(x1, y1, x2, y2, page_num, name) {
                ((exports) => {

                    exports.runPDFRedactTest = () => {

                        const main = async () => {
                            try {
                                const doc = await PDFNet.PDFDoc.createFromFilePath(inputPath_clickable);
                                doc.initSecurityHandler();
                                const blankPage = await doc.getPage(page_num);

                                const btn_field = await doc.fieldCreate("button." + numBtn, PDFNet.Field.Type.e_button);
                                const btnbox = await PDFNet.PushButtonWidget.createWithField(doc, await PDFNet.Rect.init(x1, y1, x2, y2), btn_field);
                                btnbox.setBackgroundColor(await PDFNet.ColorPt.init(0, 0, 0), 1);
                                fields = ["button." + numBtn];
                                await btnbox.setAction(await PDFNet.Action.createHideField(doc, fields));
                                btnbox.setStaticCaptionText(name)
                                btnbox.refreshAppearance();
                                blankPage.annotPushBack(btnbox);

                                numBtn++;
                                await doc.save(pdfpath_clickable, PDFNet.SDFDoc.SaveOptions.e_linearized);
                                inputPath_clickable = pdfpath_clickable;
                            } catch (err) {
                                console.log(err.stack);
                                ret = 1;
                            }
                        };
                        // add your own license key as the second parameter, e.g. PDFNet.runWithCleanup(main, 'YOUR_LICENSE_KEY')
                        PDFNet.runWithCleanup(main).then(function () { PDFNet.shutdown(); });
                        
                    };
                    exports.runPDFRedactTest();
                })(exports);
            }

        }
        PDFNet.runWithCleanup(main).catch((err) => {
            console.log(err);
        }).then(() => {
            PDFNet.shutdown();
        });

    
    }
}


module.exports = routeExp;