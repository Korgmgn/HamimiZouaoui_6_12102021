const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
//On fait appel au .env afin de sécuriser les informations de connexion à la base de données
dotenv.config();

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

mongoose.connect(`mongodb+srv://${process.env.mongoId}:${process.env.mongoMdp}@cluster0.ncmib.mongodb.net/${process.env.mongoDbName}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

//Paramètres CORS (Cross-origin Ressource Sharing)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//Sécurité supplémentaire contre les attaques XSS, Injections etc.
app.use(helmet());

//Permet de récupérer les inputs formulaire (Requêtes POST), et les transformes en objet javascript, accessibles par req.body
app.use(bodyParser.json());

//Permet de définir le dossier où seront stockées les images traitées par multer
app.use('/images', express.static(path.join(__dirname, 'images')));

//chemin des routeurs principaux
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

//Pour améliorer la sécurité, on désactive cet en-tête, créé par défaut, qui permet de détecter si une app utilise Express
app.disable('x-powered-by');

module.exports = app;