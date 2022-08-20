var express = require('express');
var router = express.Router();
var novedadesModel = require('../../models/novedadesModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;

const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

/* GET home page. */
router.get('/', async function (req, res, next) {

  var novedades = await novedadesModel.getNovedades();
  novedades = novedades.map(novedad => {
    if (novedad.imagen) {
      const imagen = cloudinary.image(novedad.imagen, {
        width: 50,
        height: 50,
        crop: 'fill'
      });
      return {
        ...novedad,
        imagen
      }
    } else {
      return {
        ...novedad,
        imagen: ''
      }

    }
  });
  res.render('admin/novedades', {
    layout: 'admin/layout',
    //persona: req.session.usuario,
    novedades
  });
});

router.get('/agregar', (req, res, next) => {
  res.render('admin/agregar', {
    layout: 'admin/layout'

  })//cierra render
});//cierra get

router.post('/agregar', async (req, res, next) => {
  try {
    var imagen = '';
    //console.log(req.files.imagen);

    if (req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      imagen = (await uploader(imagen.tempFilePath)).public_id;
    }
    if (req.body.titulo != "" && req.body.fecha != "" && req.body.cuerpo != "") {
      await novedadesModel.insertNovedad({
        ...req.body, //spread > titulo subtitulo cuerpo
        imagen
      });
      res.redirect('/admin/novedades')

    } else {
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true,
        message: 'Todos los campos deben completarse',
      })

    }


  } catch (error) {
    console.log(error)
    res.render('admin/agregar', {
      layout: 'admin/layout',
      error: true,
      message: 'Atencion, no se actualizo novedades'
    })
  }
})

/*para eliminar novedades*/

router.get('/eliminar/:id', async (req, res, next) => {
  var id = req.params.id;

    let novedad = await novedadesModel.getNovedadById(id);
    if (novedad.imagen) {
      await (destroy(novedad.imagen));
    }
  await novedadesModel.deleteNovedadesById(id);
  res.redirect('/admin/novedades');


});

/*para listar una sola novedad by id/modificar*/

router.get('/modificar/:id', async (req, res, next) => {
  var id = req.params.id;
  //console.log(req.params.id);
  var novedad = await novedadesModel.getNovedadById(id);


  res.render('admin/modificar', {
    layout: 'admin/layout',
    novedad
  })
});

//para modificar la novedad

router.post('/modificar', async (req, res, next) => {
  try {
    let imagen = req.body.img_original;
    let borrar_img_vieja = false;
    if (req.body.img_delete == "1") {
      imagen = null;
      borrar_img_vieja = true;
    } else {
      if (req.files && Object.keys(req.files).length > 0) {
        imagen = req.files.imagen;
        imagen = (await uploader(imagen.tempFilePath)).public_id;
        borrar_img_vieja = true;
      }
    }
    if (borrar_img_vieja && req.body.img_original) {
      await (destroy(req.body.img_original));
    }
    var obj = {
     
      titulo: req.body.titulo,
      fecha: req.body.fecha,
      imagen,
      cuerpo: req.body.cuerpo

    }
    console.log(obj)

    await novedadesModel.modificarNovedadById(obj, req.body.id);
    res.redirect('/admin/novedades');

  } catch (error) {
    console.log(error)
    res.render('admin/modificar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se modifico la novedad'
    })

  }
})

module.exports = router;