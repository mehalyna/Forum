<a href="https://softserve.academy/"><img src="https://s.057.ua/section/newsInternalIcon/upload/images/news/icon/000/050/792/vnutr_5ce4f980ef15f.jpg" title="SoftServe IT Academy" alt="SoftServe IT Academy"></a>

***INSERT GRAPHIC HERE (include hyperlink in image)***

# Repository Title Goes Here

> This project aims to facilitate the collaboration between startups and investors, providing a platform for them to discover and connect with each other. It serves as a business-to-business solution, enabling the exchange of information between startups and potential investors.

>  Business-to-business solution B2B

> Django backend serves

**Badges will go here**

- build status
- coverage
- issues (waffle.io maybe)
- devDependencies
- npm package
- slack
- downloads
- gitter chat
- license
- etc.

[![Build Status](https://img.shields.io/travis/ita-social-projects/Forum/master?style=flat-square)](https://travis-ci.org/github/ita-social-projects/Forum)
[![Coverage Status](https://img.shields.io/gitlab/coverage/ita-social-projects/Forum/master?style=flat-square)](https://coveralls.io)
[![Github Issues](https://img.shields.io/github/issues/ita-social-projects/Forum?style=flat-square)](https://github.com/ita-social-projects/Forum/issues)
[![Pending Pull-Requests](https://img.shields.io/github/issues-pr/ita-social-projects/Forum?style=flat-square)](https://github.com/ita-social-projects/Forum/pulls)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- For more on these wonderful  badges, refer to <a href="#" target="_blank">#</a>.

---

## Table of Contents (Optional)

> If your `README` has a lot of info, section headers might be nice.

- [Installation](#installation)
  - [Required to install](#Required-to-install)
  - [Environment](#Environment)
  - [Clone](#Clone)
  - [Setup](#Setup)
  - [How to run local](#How-to-run-local)
  - [How to run Docker](#How-to-run-Docker)
- [Usage](#Usage)
  - [How to work with swagger UI](#How-to-work-with-swagger-UI)
  - [How to run tests](#How-to-run-tests)
  - [How to Checkstyle](#How-to-Checkstyle)
- [Documentation](#Documentation))
- [Contributing](#contributing)
  - [git flow](#git-flow)
  - [issue flow](#git-flow)
- [FAQ](#faq)
- [Support](#support)
- [License](#license)

---

## Installation

- All the `code` required to get started
- Images of what it should look like

### Required to install
* Python 3.9
* PostgreSQL 14
* Django 4.2.3
* NodeJS Frontend

```shell
$ pip install -r requirements.txt
```


### Environment

Global variables backend and sample filling
Django

```properties
DEBUG=True or False #Django backend debug mode

db details
SECRET_KEY= key ... # Use rules for hashed data
PG_DB= Database name
PG_USER= Database user
PG_PASSWORD= Database user password
DB_HOST=sample filling => localhost or '127.0.0.1' # Database host
DB_PORT=sample filling => 5432 # Database port

SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST="mail server address"
EMAIL_PORT=sample filling => 523 # Server port
EMAIL_USE_TLS=sample filling => 1
EMAIL_HOST_USER= User login
EMAIL_HOST_PASSWORD= key ... user password

Origin hostnames allowed to make cross-site HTTP requests
CORS_ORIGIN_WHITELIST="frontend address:port" #docker-compose and settings.py
CORS_ALLOWED_ORIGINS= sample filling => http://localhost:8080 #settings.py
ALLOWED_ENV_HOST="frontend address:port" #docker-compose and settings.py

Used by Docker
PGADMIN_DEFAULT_PASSWORD= key ... #Use rules for hashed data. Used by Docker
PGADMIN_DEFAULT_EMAIL= "user login" sample filling admin@admin.com . Used by Docker
POSTGRES_DB= database name
ENGINE= #docker-compose.dev.yml
```
Global variables frontend and sample filling

```properties
REACT_APP_BASE_API_URL= sample filling => http://localhost:8000 #Path to the backend API server
REACT_APP_PUBLIC_URL= sample filling => http://localhost:8080 #Path to the frontend visualization
```

### Clone

- Clone this repo to your local machine using `____`

### Setup

- If you want more syntax highlighting, format your code like this:
- Localhost

> update and install this package first

```shell
$ pip install -r requirements.txt
```

> now install npm and bower packages

```shell
$ sudo apt update
$ sudo apt install nodejs
$ sudo apt install npm

```

- For all the possible languages that support syntax highlithing on GitHub (which is basically all of them), refer <a href="https://github.com/github/linguist/blob/master/lib/linguist/languages.yml" target="_blank">here</a>.

### How to run local
### Django backend server
- Setup  .env
> Setup .env
``` shell
#db details
SECRET_KEY= 'key ...'
PG_DB= sample filling => forum
PG_USER= sample filling => postgres
PG_PASSWORD= sample filling => postgres
DB_HOST=  sample filling => localhost
DB_PORT=  sample filling => 5432

#SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST= sample filling => "127.0.0.1"
EMAIL_PORT= sample filling => 1025
EMAIL_USE_TLS= sample filling => 1
EMAIL_HOST_USER= sample filling =>test@test.com
EMAIL_HOST_PASSWORD= sample filling => 'key ...'

#origin hostnames allowed to make cross-site HTTP requests
CORS_ORIGIN_WHITELIST= sample filling => "http://localhost:8080"
#CORS_ALLOWED_ORIGINS= sample filling => "http://localhost:8080"

PGADMIN_DEFAULT_PASSWORD= 'key ...'
PGADMIN_DEFAULT_EMAIL=  sample filling => admin@admin.com

DEBUG=True or False  
ENGINE= # docker-compose.dev.yml
POSTGRES_DB= sample filling =>  forum  # docker-compose
ALLOWED_ENV_HOST=sample filling => "http://localhost:8080" # docker-compose and settings.py
REDIS_URL= sample filling =>  redis://localhost:6379/0 #local
```
- User, run the local server on port localhost:8000
``` shell
$ python manage.py makemigrations
$ python manage.py migrate
$ python manage.py runserver
```
### Celery and Redis
Correct application operation (in terms of moderation autoapprove functionality, to be precise) requires a running Celery worker and a Redis server. The simplest way to start Redis is:

`docker run --rm -p 6379:6379 redis:7`

Docker will automatically download the image and run the Redis server with the ports exposed. Redis will be available at 127.0.0.1:6379. You should place this host and port in the environment variable REDIS_URL, which Celery uses through Django's settings.py.

Don't forget to install Celery via pip.  
```instal
pip install -r requirements.txt
```
Add in BackEnd .env
```.env 
REDIS_URL= redis://localhost:6379/0
```

The Celery worker itself needs to be started in a separate terminal (in the directory where manage.py is located) with the command:

`celery -A forum worker --loglevel=info`

On some Windows machines, there might be issues, in that case try:

`celery -A forum worker --loglevel=info -P eventlet`

### Node JS  frontend server
- Setup frontend .env
> Setup frontend .env

``` shell
REACT_APP_BASE_API_URL= sample filling => http://localhost:8000 # Path to the backend API server
REACT_APP_PUBLIC_URL= sample filling => http://localhost:8080 # Path to the frontend visualization
```

- User, run the local server on port localhost:8080 
``` shell
PORT=8080 npm start
or
PORT=8080 npm restart
```

### Google ReCAPTCHA V2
The project is currently using ReCAPTCHA V2 Invisible. Note that if the free monthly Google quota expires, users will be able to sign in and sign up without ReCAPTCHA verification.

For proper ReCAPTCHA setup provide public and private keys from Google:

Add in BackEnd .env
```.env 
RECAPTCHA_V2_PRIVATE_KEY = "your-private-key"
RECAPTCHA_URL="https://www.google.com/recaptcha/api/siteverify"
```

Add in FrontEnd .env
```.env 
REACT_APP_RECAPTCHA_V2_SITE_KEY = "your-public-key"
```

### How to run Docker

- Setup Docker  
> Setup .env
``` shell

```
> Run Docker comands
```shell
$ docker compose build
$ docker compose up
$ docker exec -i contener-name-exemple python manage.py makemigrations
$ docker exec -i contener-name-exemple python manage.py migrate
```

> Stop Docker comands
```shell
ctrl + c
$ docker stop $(docker ps -q)
```
---

## Usage
### How to work with swagger UI
### How to run tests
- User, run test:
```shell
$ python manage.py test --settings=forum.test_settings
```
- Running tests from Docker container:
```
$ docker compose -f docker-compose.dev.yml exec api-dev python manage.py test --settings=forum.test_settings
```
### How to Checkstyle

---

## Documentation
- 🔃 Documentation <a href="https://github.com/ita-social-projects/Forum/wiki" target="_blank">Forum/wiki</a>.

---

## Contributing

### Git flow
We are using simplest GitHub flow to organize our work:
![Git Flow Ilustration](https://camo.githubusercontent.com/249bd600310c01188d4daf366519c24044e9883e/68747470733a2f2f7363696c6966656c61622e6769746875622e696f2f736f6674776172652d646576656c6f706d656e742f696d672f6769746875622d666c6f772e706e67)


### Note! Contribution rules:
1. All Pull Requests should start from prefix #xxx-yyy where xxx - task number and yyy - short description e.g. #020-CreateAdminPanel
2. Pull requests should not contain any files not required by the task.

In case of any violations, the pull request will be rejected.

#### Step 1

- **Option 1**
    - 🍴 Fork this repo!

- **Option 2**
    - 👯 Clone this repo to your local machine using `https://github.com/ita-social-projects/Forum.git`

#### Step 2

- **HACK AWAY!** 🔨🔨🔨

#### Step 3

- 🔃 Create a new pull request using <a href="#" target="_blank">https://github.com/ita-social-projects/Forum.git</a>.

### Issue flow

---

## Team

> Or Contributors/People

[![@lhalam](https://avatars3.githubusercontent.com/u/3837059?s=100&v=4)](https://github.com/lhalam)
[![@lhalam](https://avatars3.githubusercontent.com/u/3837059?s=100&v=4)](https://github.com/lhalam)
 

- You can just grab their GitHub profile image URL
- You should probably resize their picture using `?s=200` at the end of the image URL.

---

## FAQ

- **How do I do *specifically* so and so?**
    - No problem! Just do this.

---

## Support

Reach out to me at one of the following places!

- Website at <a href="#" target="_blank">`#`</a>
- Facebook at <a href="#" target="_blank">`#`</a>
- Insert more social links here.

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2020 © <a href="https://softserve.academy/" target="_blank"> SoftServe IT Academy</a>.
