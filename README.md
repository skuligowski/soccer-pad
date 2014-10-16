Soccer Pad
==========

The web application that allows to note scores of soccer games easily, view player stats and compare your performance with others.

### *TrueSkill(TM)* ratings

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
7. Type `npm install` to download Gruntfile dependencies
8. Go to the *db* directory: `cd db`
9. Log as **root** to the *mysql* database and type `source schema.sql` - it will create soccer pads database schema
10. Type `source data.sql` to add an example data to the database
11. Exit *mysql* and go to the *server* directory: `cd server`
12. Install *node.js* dependencies: `npm install`

### Building *Soccer Pad* for production release

1. Go to the *Soccer Pad* directory: `cd soccer-pad`
2. Run `grunt release`
3. Go to the *server* directory: `cd server`
4. Type `node server` to start *Soccer Pad* server
5. Open a browser and go to: `http://localhost:8000`
6. Click *Players* tab and add several players

### Development flow for *Soccer Pad*

1. Go to the *Soccer Pad* directory: `cd soccer-pad`
2. Run `grunt` and hit enter
3. From now `src/app`, `src/css`, `src/includes` and `src/index.html` are watched for changes. When any file is changed application is rebuild into the `dist` directory. Rebuilding process contains: 
 * weaving all partials that are inlcuded using `<%include src="" %>` directive into dist/index.html
 * rendering `AngularJs` templates into `dist/index.html` file with the following pattern: ```<script id="tplId" type="text/ng-template">html of the template</script>```
 * compilation of *less* files and generation of source maps
 * all *js* file paths are included automatically to the `includes/scripts.html` file which contains asynchronous loader for JavaScript files
 * all *js* files are copied to the `dist/app` directory
4. *NodeJs* server starts automatically. *Watch* Grunt tasks observes files that are in `server/**` directory. After changes the server restarts automatically.

*Note:* `src/img`, `src/fonts`, `src/vendor` are not observed continously since they change infrenquently. After changing one of these files please stop/start the `grunt` command.


