const Sauce = require('../models/Sauce');
const jwt = require('jsonwebtoken');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id; 
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;

    const sauceObject = req.file ?
        { 
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    if(userId == sauceObject.userId) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                        .catch(error => res.status(400).json({ error }));
                })
        })
    } else {
        res.status(403).json({ message: 'Unauthorized request !' })
    }
};

exports.deleteSauce = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(sauce.userId == userId) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                        .catch(error => res.status(400).json({ error }));
                })
            } else {
                res.status(403).json({ message: 'Unauthorized request !' })
            }
        })
        .catch(error => res.status(400).json({ error }));  
};

exports.ratingSauce = (req, res, next) => {
    const requestUserId = req.body.userId
    if(req.body.like == 1){
        Sauce.updateOne({ _id: req.params.id }, { usersLiked: requestUserId, $inc: { likes: +1 } })
            .then(sauce => res.status(200).json(sauce))
            .catch(error => res.status(400).json({ error }));
    } else if(req.body.like == -1){
        Sauce.updateOne({ _id: req.params.id }, { usersDisliked: requestUserId, $inc: { dislikes: +1 } })
            .then(sauce => res.status(200).json(sauce))
            .catch(error => res.status(400).json({ error }));
    } else if(req.body.like == 0){
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const foundUserLike = sauce.usersLiked.find(item => item == requestUserId)
                if(foundUserLike) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: foundUserLike }, $inc: { likes: -1 } })
                    .then(sauce => res.status(200).json(sauce))
                    .catch(error => res.status(400).json({ error }));
                } else {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: requestUserId }, $inc: { dislikes: -1 } })
                    .then(sauce => res.status(200).json(sauce))
                    .catch(error => res.status(400).json({ error }));
                }
            })
            .catch(error => res.status(400).json({ error }));
    }
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};