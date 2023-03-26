# CRUD Template - Backend - PostgreSQL

This repository is an optional backend starter pack for new DALI React projects. Installation and setup instructions are included below. You should eventually customize this README file with project-specific documentation.

## Designs
[Screenshot description]

[Link to the project Figma]()

[2-4 screenshots from the app]

## Architecture
### Tech Stack
  - [Express](https://expressjs.com/)
  - [PostgreSQL](https://www.postgresql.org/)
  - [Sequelize](https://sequelize.org/)
  - [sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript)
  - [Passport.js](https://www.passportjs.org/)
  - [axios](https://github.com/axios/axios)
  - [TypeScript](https://www.typescriptlang.org/docs/)

#### External Packages
- [aws-sdk](https://yarnpkg.com/package/aws-sdk)
- [@sendgrid/mail](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)
- [Add any other notable external packages here]

### Style
[Describe notable code style conventions]

We are using [typically a configuration like [CS52's React-Native ESLint Configuration](https://gist.github.com/timofei7/c8df5cc69f44127afb48f5d1dffb6c84) or [CS52's ES6 and Node ESLint Configuration](https://gist.github.com/timofei7/21ac43d41e506429495c7368f0b40cc7)]

### Data Models
[Brief description of typical data models.]

[Detailed description should be moved to the repo's Wiki page]

### Directory Structure

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
    |   └── util                # util functions, usually used by services
    |   └── validation          # validates input w/ joi
    |   └── constants.ts        # server constants
    |   └── server.ts           # starting point of server
    └── ...

For more detailed documentation on our file structure and specific functions in the code, feel free to check the project files themselves.

## Setup

1. Clone repo and `npm install`
2. Install PostgreSQL + management tool
  - Make sure to do `npm install --save-dev sequelize-cli` if you don't have the sequelize cli yet.
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
4. Set up Sendgrid API (for email sending)
   - Information about SendGrid API keys: https://docs.sendgrid.com/ui/account-and-settings/api-keys
5. Set up Amazon AWS s3 bucket (for photo storage)
   - https://cs52.me/assignments/sa/s3-upload/
6. Create a `.env` file in the root directory
  - Should be in the following format:
  - ```
    AUTH_SECRET=*secret assortment of characters used for encryption*
    PORT=*insert desired backend server port here*
    DATABASE_URL=postgres://username:password@localhost:5432/backend_template
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    S3_BUCKET_NAME=
    SENDGRID_EMAIL=
    SENDGRID_API_KEY=
    DEBUG=true
    ```
7. Run `npx sequelize db:migrate` to apply migrations to DB.
8. Run `npx sequelize db:seed:all` to load initial data.
9. App should be ready for use now
  - `npm start` to run in production mode
  - `npm run dev` to run with hot reloading

#### Linting

ESLint is set up in this project. To keep code clean, always remember to run `npm run lint` and fix any lint problems before merging into master.

#### Unit Testing

Jest unit testing is set up for the controllers, routers, and services. Remember to run `npm test` and fix any breaking changes that might've occured. 
  - You can also run just an individual test file with `npm test -- *filename*`

## Deployment
[Where is the app deployed? i.e. Expo, Surge, TestFlight etc.]

[What are the steps to re-deploy the project with any new changes?]

[How does one get access to the deployed project?]

## Authors
* Firstname Lastname 'YY, role

## Acknowledgments
We would like to thank [anyone you would like to acknowledge] for [what you would like to acknowledge them for].

---
Designed and developed by [@DALI Lab](https://github.com/dali-lab)

### Template
- Eric Lu '25

Additional credit goes to Adam McQuilkin '22, Ziray Hao '22, Jack Keane '22, Thomas Monfre '21 for developing the original DALI [CRUD Template Backend](https://github.com/dali-lab/crud-template-backend), which this starter pack was evolved from.
