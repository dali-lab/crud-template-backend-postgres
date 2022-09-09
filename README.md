# CRUD Template - Backend - PostgreSQL

This repository is the default backend starter pack for new DALI React projects. Installation and setup instructions are included below. You should eventually customize this README file with project-specific documentation.

## Tech Stack
  - [Express](https://expressjs.com/)
  - [PostgreSQL](https://www.postgresql.org/)
  - [Sequelize](https://sequelize.org/)
  - [sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript)
  - [Passport.js](https://www.passportjs.org/)
  - [aws-sdk](https://aws.amazon.com/developer/tools/)
  - [axios](https://github.com/axios/axios)

## Directory Structure

    .
    ├── ...         
    ├── src                    
    |   └── auth                # JWT middleware
    |   └── controllers         # dispatch input; output
    |   └── db                  # PostgreSQL database definitions
    |     └── config            # define database modes
    |     └── migrations        # Sequelize migrations
    |     └── models            # defines structure of PostgreSQL tables
    |     └── seeders           # code to populate database with initial data
    |   └── errors              # internal error handling
    |   └── routers             # route url endpoint
    |     └── __tests__         # test cases for routers
    |   └── services            # handles database queries and related functionality
    |     └── __tests__         # test cases for services
    |   └── validation          # validates input w/ joi
    |   └── constants.ts        # server constants
    |   └── server.ts           # starting point of server
    └── ...

## Setup

1. clone repo and `npm install`
2. Install PostgreSQL + management tool
  - Windows
    - Install [Windows Subsystem for Linux (WSL)](https://ubuntu.com/tutorials/install-ubuntu-on-wsl2-on-windows-10#1-overview)
    - Follow directions [here](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-postgresql) to install PostgreSQL on WSL
    - Install [pgAdmin](https://www.pgadmin.org/)
    - Follow directions [here](https://www.vultr.com/docs/install-pgadmin-4-for-postgresql-database-server-on-ubuntu-linux/) to connect pgAdmin to PostgreSQL and WSL
  - MacOS
    - Ensure [Homebrew](https://brew.sh/) is installed
    - Run `brew install postgresql` if PostgreSQL isn't installed
    - If you'd like to use a GUI to interact with PostgreSQL, download one. We recommend [Postico](https://eggerapps.at/postico/)
3. Create a PostgreSQL DB called `backend_template` if setting up locally, using your GUI of choice (Postico or pgAdmin).
4. Set up Google Developer API (for email sending)
   - You will need to enable [2 Step Auth](https://support.google.com/accounts/answer/185839) on your desired Google account and generate an [App Specific Password](https://myaccount.google.com/security). See this [StackExchange thread](https://stackoverflow.com/questions/19877246/nodemailer-with-gmail-and-nodejs?answertab=modifieddesc#tab-top) for more details.
   - Alternatively just comment out all the nodemailer stuff if you don't want to use/need to set up the email service.
5. Create a `.env` file in the root directory
  - Should be in the following format:
  - ```
    AUTH_SECRET=*secret assortment of characters used for encryption*
    PORT=*insert desired backend server port here*
    DATABASE_URL=postgres://username:password@localhost:5432/backend_template
    GOOGLE_CLIENT_EMAIL=*Google Developer API email*
    GOOGLE_CLIENT_PASS=*Google Developer API password*
    ```
6. Run `npx sequelize db:migrate` to apply migrations to DB.
7. Run `npx sequelize db:seed:all` to load initial data.
8. App should be ready for use now
  - `npm start` to run in production mode
  - `npm run dev` to run with hot reloading

#### Redux Debugging

Download the [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) extension.

#### Linting

ESLint is set up in this project. To keep code clean, always remember to run `npm run lint` and fix any lint problems before merging into master.

#### Unit Testing

Jest unit testing is set up for the controllers, routers, and services. Remember to run `npm test` and fix any breaking changes that might've occured. 
  - You can also run just an individual test file with `npm test -- *filename*`

## Authors & Credits
- Eric Lu '25

Additional credit goes to Adam McQuilkin '22, Ziray Hao '22, Jack Keane '22, Thomas Monfre '21 for developing the original DALI [CRUD Template Backend](https://github.com/dali-lab/crud-template-backend), which this starter pack was evolved from.
