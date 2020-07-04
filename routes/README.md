This is the API for [The Stoke List](https://github.com/lukenorman/stokelistdemo).

If you want to run our own Stoke List, and we encourage you to do so, you'll need a few things. It's possible that bits of the stack can be swapped out for other tech, but this is what we recommend

## Required Services

Postgres database server
Postmark account with API key
URL of Frontend
Google V3 Recaptcha Key/Secret pair
AWS account - s3 bucket and IAM user with permissions to access
Gmail Account

## Get started

Clone this Github
'npm install'

Referring to sample.env, configure the enviroment, either by it to .env, or setting the appropriate variables in your deployment platform

'npx sequelize db:migrate' to set up your database

npm start


