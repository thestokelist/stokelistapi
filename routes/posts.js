const Router = require('express-promise-router')
const db = require('../db')
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()
// export our router to be mounted by the parent application
module.exports = router

const postProperties = "id,title,price,location,description,photo_file_size FROM posts"

router.get('/', async (req, res) => {
  const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0;
  const { rows } = await db.query(`SELECT ${postProperties} WHERE deleted_at IS NULL AND sticky IS FALSE AND email_verified IS TRUE ORDER BY created_at DESC LIMIT 50 OFFSET ${offset}`)
  res.send(rows)
})

router.get('/search', async (req, res) => {
  const query = req.query.term
  const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0;
  //node-postgres sanitizes any database input passed as param
  const { rows } = await db.query(`SELECT ${postProperties} WHERE (description ILIKE $1 OR title ILIKE $1) AND deleted_at IS NULL AND email_verified IS TRUE ORDER BY created_at DESC LIMIT 50 OFFSET ${offset}`, [`%${query}%`])
  res.send(rows)
})

router.get('/sticky', async (req, res) => {
  const { rows } = await db.query(`SELECT ${postProperties} WHERE sticky IS TRUE AND deleted_at IS NULL`)
  res.send(rows)
})

router.get('/:id', async (req, res) => {
  const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null;
  if (postID !== null) {
    const { rows } = await db.query(`SELECT created_at,${postProperties} WHERE id=$1 AND email_verified IS TRUE `, [req.params.id])
    res.send(rows[0])
  } else {
    res.send([])
  }
})