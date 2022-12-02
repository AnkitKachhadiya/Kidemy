# CS 555 - Team 14: Fantastic Five

Kidemy

## Project Description

Kidemy is a web app for parents to assign the course to their children and keep track of their progress. Parents can add multiple children to the portal, and this is a free web application for students. Parents can assign relevant courses to their children and track their progress regarding their score and completion of the subject or module of assigned courses.

## Technologies used

HTML, CSS, Bootstrap, Express, Node.js, and MongoDB.

## Prerequisite

-   Install [Nodejs](https://nodejs.org/en/download/)
-   Install [MongoDB](https://www.mongodb.com/try/download/community)

## Project Installation

```
mkdir myfolder

cd myfolder

git clone https://github.com/AnkitKachhadiya/Fantastic-Five.git

cd Fantastic-Five

npm install

npm start
```

## Instructions

-   Create and add `.env` file in the root directory

    -   Add below lines to that `.env` file and add user own email address for the `USER_GMAIL` and password for the `PASSWORD_GMAIL` field
    -   Add your own MongoDB connection url of atlas or your local MongoDB server url for `MONGODB_CONNECTION_LINK`
    -   Add MongoDB database name for `MONGODB_DATABASE`

    ```
    USER_GMAIL=""
    PASSWORD_GMAIL=""
    MONGODB_CONNECTION_LINK=""
    MONGODB_DATABASE=""
    ```

-   Go to http://localhost:3000/ in browser to use the web application.

-   For email verification use valid email address to get emails
