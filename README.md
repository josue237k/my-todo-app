# my-todo-app
url 
https://www.kimmichtodoapp.site

this is just a simple app done by me so as to improve my compétences in backend development especially the aspect of authentication and authorization 
the authentication is handle using passport js 
I have 2 strategies google and Spotify 
there is also a local strategy using username and password 
for the database all is the done using mongoDB and a package for handling mongoDB which is called mongoose 
users data is stored on mongoDB Atlas 
the app is deployed on heroku 
for templates I use ejs

#App details 

the app permits users to add tasks which are then stored in sessionstorage delete tasks which are then deleted in sessionstorage 
all tasks added are also saved into the database and when the user goes to the tasks history the app fetches the data from the database and displays it to the front-end 
when the user deletes a task from the task history it also deletes it from the database 

