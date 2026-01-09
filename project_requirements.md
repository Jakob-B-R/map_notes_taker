# Plans

## High level plan
This will be a web application prototype. I want to be able to take an image stored on this machine, and use it as the base layer. I need to be able to pan and zoom on the image. After that, I want to be able to add annotations, some for cities, some for people, some for events, some for regular notes.

These different types must all have different, easy to see icons. I want to be able to click on the annotation to edit it, and have a form pop up. I want to be able to delete annotations as well.

I want to be able to save the map as a json file, and load it back in, though we will use the database eventually.

The app should have ctrl+z and cttl+shift+z for undo and redo.

A user should be able to have multiple maps saved, with different annotations on each.

## Architecture

1) Flask
2) If we need a more comprehensive front end, we can discuss using React or Vue.
3) If we need a database, there is a local Postgres database we can use
