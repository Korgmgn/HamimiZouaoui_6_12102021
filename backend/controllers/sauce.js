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
  if(userId == req.body.userId) {
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
  } else {
    res.status(403).json({ message: 'Unauthorized request !' })
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
              Sauce.deleteOne({ _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                  .catch(error => res.status(400).json({ error }));
          })
      })
      .catch(error => res.status(400).json({ error }));
};

exports.ratingSauce = (req, res, next) => {
    console.log(req.body)
    if(req.body.like == 1){
        Sauce.updateOne({ _id: req.params.id }, { usersLiked: req.body.userId, likes: +1 })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
    } else if(req.body.like == -1){
        Sauce.updateOne({ _id: req.params.id }, { usersDisliked: req.body.userId, dislikes: +1 })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
    } else if(req.body.like == 0){
        Sauce.updateOne({ _id: req.params.id }, { usersDisliked: req.body.userId }) //Il faut supprimer l'userId de l'array usersliked ou usersdisliked et mettre à jour le décompte de like & dislike
        .then(sauce => res.status(200).json(sauce))
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