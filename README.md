# Prerequisites

Download & Install latest [NodeJS](https://nodejs.org/en/) version.
Download & Install [MondoDB](https://docs.mongodb.com/manual/administration/install-community/) community.
Make sure you have exported as a global command [mongod](https://docs.mongodb.com/manual/reference/program/mongod/).

# Install AdminBloc

Navigate in a terminal to AdminBloc root location and run:

```bash
npm install
```

This will trigger the installation of everything that is needed. (for both server and client)
If you want to install just the server component or just the client component, you can either navigate to their root location and run `npm install`, or you can run from AdminBloc root location the following commands:

```bash
# server install
npm run server-install
# client install
npm run client-install
```

# Run AdminBloc

Navigate in a terminal to AdminBloc root location and run:

```bash
npm start
```

This will start everything for you. (databse, server and client)
If you want to start each component separately, you can use the following commands, from the root folder:

```bash
# database start
npm run database
# server start
npm run server
# database and server start:
npm run no-client
# client start
npm run client
```
