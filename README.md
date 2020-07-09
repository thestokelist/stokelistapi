# The Stoke List

This is the API for [The Stoke List](https://github.com/lukenorman/stokelistdemo).

If you want to run your own Stoke List, and we encourage you to do so, you'll need a few things.

## Required Services

* PostgreSQL database, with PostGIS extension enabled
* Postmark account with API key
* URL of Frontend
* Google V3 Recaptcha Key/Secret pair
* AWS account - s3 bucket and IAM user with permissions to access
* Gmail Account

## Deploy Locally

Clone this Github
```
https://github.com/thestoke/api.thestoke.ca
```

Download dependencies
```
npm install
```

Configure your environment
```
cp sample.env .env
```
Referring to sample.env, configure the enviroment

Run database migration
```
npx sequelize db:migrate
```

Start the application
```
npm start
```

## Deploy to Heroku

If the `DATABASE_URL` environment variable is set, it will be used instead, both to connect the application to, and for any migrations.

To run migrations on Heroku, first connect to a shell using
```
heroku run bash --app <your_app_name>
```