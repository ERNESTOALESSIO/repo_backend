var express = require('express');
var router = express.Router();
var novedadesModel = require('./../models/novedadesModel');
const cloudinary = require('cloudinary').v2;


router.get('/novedades', async function (req, res, next) {

    let novedades = await novedadesModel.getNovedades();


    novedades = novedades.map(novedades => {
        if (novedades.imagen) {
            const imagen = cloudinary.url(novedades.imagen, {
                width: 100,
                height: 100,
                crop: 'fill'
            });
            return {
                ...novedades,
                imagen
            }
        } else {
            return {
                ...novedades,
                imagen: ''
            }
        }
    });
    res.json(novedades);
});

module.exports = router;