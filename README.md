# Subline Inventory Management

## Introduction
Subline Inventory Management is a system for companies to track, update and manage their
inventory in real time.  It is also a tool for gathering and analyzing data on inventory
in order to better manage future costs and reduce food waste for restaurants.

The project is a hybrid single page app.  After log in, users are given a single page app for interacting with the platform.  Everything other than that (landing page, log in, help, etc.) is a more traditional website.  

## Technologies
* HTML (ejs)
* CSS
* Nodejs
* Javascript
* MongoDB

### NPM packages
* axios
* bcryptjs
* compression
* cookie-session
* ejs
* express
* mailgun-js
* mongoose
* browserify (dev)
* watchify (dev)

## Setup

1. Install MongoDB
    https://docs.mongodb.com/manual/installation/

2. Ensure node is installed.  Install if not.  Version 10 or higher.
    $ node --version
    https://nodejs.org/en/

3. $ git clone https://github.com/The-Subline/Inventory-Management.git

4. $ npm install

5. $ npm install -g nodemon (only if you are developing or adding code)

6. Create two environment variables:
    PORT="8080"
    SUBLINE_DB="mongodb://localhost/InventoryManagement"
    SITE="localhost:8080"
    NODE_ENV="development
    
    Mac/Linux Instructions:
    1.  Open '.bashrc' or .bash_profile' from the home directory
    2.  Type the two variables at the bottom file
    3.  Save file
    4.  Close and re-open terminal
    
    Windows Instructions:
    https://ubuntu.com/download/desktop

6. $ sudo service mongod start

7. $ nodemon app.js (if developing)
   $ node app.js (to view)

8. Open a browser and go to 'localhost:8080'