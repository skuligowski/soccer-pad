Soccer Pad
==========

The web application that allows to note scores of soccer games easily, view player stats and compare your performance with others.

### *Trueskill(TM)* ratings

The Soccer Pad uses TrueSkill(TM) alghorithm (http://research.microsoft.com/en-us/projects/trueskill/) to calculate ratings for all players. The rating system has been used on XBOX Live platform to rank users. It was developed by Microsoft Research.


## Contribute
  
Our goal is to create a simple way of adding soccer scores. The way that doesn't disturb the most important thing: the play. If you think that you can add a new value to `soccer-pad` project, do not hesitate to join us and fork the project. 

### Getting started

1. Install *mysql* database ([http://dev.mysql.com/downloads/mysql/](http://dev.mysql.com/downloads/mysql/))
2. Install *nodejs* ([http://nodejs.org/download/](http://nodejs.org/download/))
3. Fork the project on GitHub
4. Clone the project: `git clone git@github.com:<github username>/soccer-pad.git`
5. Go to the *Soccer Pad* directory: `cd soccer-pad`
6. Add the main *Soccer Pad* repository as an upstream remote to your repository:
`git remote add upstream https://github.com/skuligowski/soccer-pad.git`
7. Go to the *db* directory: `cd db`
8. Log as **root** to the *mysql* database and type `source schema.sql` - it will create soccer pads database schema
9. Type `source data.sql` to add an example data to the database
8. Exit *mysql* and go to the *server* directory: `cd server`
8. Install *node.js* dependencies: `npm install`

### Running *Soccer Pad*

1. Go to the *Soccer Pad* directory: `cd soccer-pad`
2. Go to the *server* directory: `cd server` 
3. Run the server: `node server`
4. Open a browser and go to: `http://localhost:8000/index.html`
5. Click *Players* tab and add several players


