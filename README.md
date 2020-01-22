# Subline Inventory Management

Subline Inventory Management is a system for companies to track, update and manage their
inventory in real time.  It is also a tool for gathering and analyzing data on inventory
in order to better manage future costs and reduce food waste for restaurants.

# Getting Started

1. Install MongoDB
    https://docs.mongodb.com/manual/installation/

2. Ensure node is installed.  Install if not.  Version 10 or higher.
    $ node --version
    https://nodejs.org/en/

3. $ git clone https://github.com/The-Subline/Inventory-Management.git

4. $ npm install

5. $ npm install -g nodemon (only if you are developing or adding code)

6. Create two environment variables:
    export PORT="8080"
    export SUBLINE="mongodb://localhost/InventoryManagement"
    
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

8. Open a browser and go to 'localhost:8000'
