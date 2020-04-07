const Router = require('express-promise-router')
const sequelize = require('../db')
const { Op } = require("sequelize");
const Post = require('../models/post')
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()
// export our router to be mounted by the parent application
module.exports = router

const postAttributes = ['id','title','price','location','description','photoFileSize'];

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
  //create a new post object from the parameters
  //add ip address from req
  //check that the captcha worked
  //fire the email to the user (how?? - stub for now)
  //fire a 200
  
  console.log('Got body:', req.body);
  res.sendStatus(200);
})