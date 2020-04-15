const Router = require('express-promise-router')
const sequelize = require('../db')
const sendPostValidationMessage = require ('../mail')
const { Op } = require("sequelize");
const Post = require('../models/post')
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()
// export our router to be mounted by the parent application
module.exports = router

const postAttributes = ['id','title','price','location','description','photoFileSize','exactLocation'];

const stokeListSanitize = dirty => sanitizeHtml(dirty, {
  allowedTags: [ 'b', 'i', 'p', 'br', 'a', 'img'],
  allowedAttributes: {
    'a': [ 'href' ],
    'img': [ 'src', 'alt' ],
  }
});

//Get 50 latests posts, with optional offset
router.get('/', async (req, res) => {
  //TODO: Only get description snippet, don't need whole thing
  const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0;
  Post.findAll({
    attributes: postAttributes,
    where: {
      sticky: false,
      emailVerified: true
    },
    order: [
      ['created_at', 'DESC'],
    ],
    limit: 50,
    offset: offset
  }).then(posts => res.json(posts))
})

//Get 50 posts that correspond to the search term, with optional offset
router.get('/search', async (req, res) => {
  //TODO: Sequelize should sanitize this for basic attacks, is there more to do here?
  const query = '%'+req.query.term+'%'
  const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0;
  Post.findAll({
    attributes: postAttributes,
    where: {
      [Op.or]: {
        description: {
          [Op.iLike]: query
        },
        title: {
          [Op.iLike]: query
        }
    },
      emailVerified: true
    },
    order: [
      ['created_at', 'DESC'],
    ],
    limit: 50,
    offset: offset
  }).then(posts => res.json(posts))
})

//Get all sticky posts
router.get('/sticky', async (req, res) => {
  Post.findAll({
    attributes: postAttributes,
    where: {
      sticky: true
    },
    order: [
      ['created_at', 'DESC'],
    ]
  }).then(posts => res.json(posts))
})

//Get a single post, by public ID
router.get('/:id', async (req, res) => {
  const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null;
  Post.findOne({
    attributes: postAttributes.concat(['created_at']),
    where: {
      id: postID,
      emailVerified: true
    },
    order: [
      ['created_at', 'DESC'],
    ]
  }).then(post => res.json(post))
})


//TODO: Should be PUT not GET, change once we have a client to link to for validation
//Validate a single post, by private guid
router.get('/v/:uuid', async (req, res) => {
  const postUUID = validator.isUUID(req.params.uuid) ? req.params.uuid : null;
  Post.findOne({
    where: {
      guid: postUUID,
    }
  }).then(post => {
    try {
      post.emailVerified = true
      post.save()
      res.sendStatus(200)
    } catch (err) {
      console.log(err.message)
      res.status(500).send(err.message)
    }
  })
})

//TODO: Should be DELETE not GET, change once we have a client to link to for deletion
//Delete a single post, by private guid
router.get('/d/:uuid', async (req, res) => {
  const postUUID = validator.isUUID(req.params.uuid) ? req.params.uuid : null;
  Post.findOne({
    where: {
      guid: postUUID,
    }
  }).then(post => {
    try {
      post.destroy()
      res.sendStatus(200)
    } catch (err) {
      console.log(err.message)
      res.status(500).send(err.message)
    }
  })
})

//Create a new post
router.post('/', async (req, res) => {
  const post = await Post.build({
    'title': stokeListSanitize(req.body.title) || null, 
    'description' : stokeListSanitize(req.body.description) || null, 
    'price': stokeListSanitize(req.body.price) || null,
    'email': req.body.email || null,
    'location': req.body.location || null,
    'exactLocation' : req.body.exactLocation || null
  });
  post.remoteIp = (req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  try {
    await post.save()
    sendPostValidationMessage(post) 
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
    return
  }
})

//Create a new post
router.post('/sync', async (req, res) => {
  Post.sync({ alter: true })
  res.sendStatus(200);
})