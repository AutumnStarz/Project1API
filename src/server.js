const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// all endpoints (only new code here)
// 4 GETs and 2 POSTs (6 total which i think is the requirement)
const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/getPokemon': jsonHandler.getPokemon, // GET1
  '/getPokemonType': jsonHandler.getPokemonType, // GET2
  '/getPokemonWeakness': jsonHandler.getPokemonWeakness, // GET3
  '/getPokemonNum': jsonHandler.getPokemonNum, // GET4
  '/addPokemon': jsonHandler.addPokemon, // POST1
  '/editPokemon': jsonHandler.editPokemon, // POST2
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response);
  } else {
    jsonHandler.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
