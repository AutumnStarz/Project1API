const fs = require('fs');
const path = require('path');
const querystring = require('querystring'); // from node < https://nodejs.org/api/querystring.html

// TODO: test by sorting the pokedex array by various fields
// add thinh in client to sort by num
// maybe clean up html
// make sure to test all the endpoints THOROUGHLY (im lookin at you, laaazy)
// maybe i should put stuff ina  different file cuz this is getting long

let pokedex; // array of pokemon
try { // try to load the pokedex data
  pokedex = JSON.parse(fs.readFileSync(path.join(__dirname, '../dataset/pokedex.json')));
} catch (error) {
  console.error('Error loading pokedex data:', error);
  pokedex = [];
}

// taken straight from the previous assignment
const respond = (request, response, status, object) => {
  let responseContent = '';
  let contentType = 'application/json';
  if (request.headers.accept && request.headers.accept.includes('text/xml')) {
    contentType = 'text/xml';
  } else {
    responseContent = JSON.stringify(object);
  }
  console.log(responseContent);
  const headers = {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(responseContent, 'utf8'),
  };
  response.writeHead(status, headers);
  if (request.method !== 'HEAD') {
    response.write(responseContent);
  }
  response.end();
};

// base endpoints (yoinked from previous assignment)
const getSuccess = (request, response) => {
  const responseObj = {
    message: 'This is a successful response.',
    id: 'success',
  };
  return respond(request, response, 200, responseObj);
};

const getBadRequest = (request, response) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
  if (parsedUrl.searchParams.get('valid') === 'true') {
    const responseObj = {
      message: 'Missing valid query parameter.',
    };
    return respond(request, response, 200, responseObj);
  }
  const responseObj = {
    message: 'Missing valid query parameter set to true.',
    id: 'badRequest',
  };
  return respond(request, response, 400, responseObj);
};

const getUnauthorized = (request, response) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
  if (parsedUrl.searchParams.get('loggedIn') === 'yes') {
    const responseObj = {
      message: 'You have successfully viewed the content.',
    };
    return respond(request, response, 200, responseObj);
  }
  const responseObj = {
    message: 'Missing loggedIn query parameter set to yes.',
    id: 'unauthorized',
  };
  return respond(request, response, 401, responseObj);
};

const getForbidden = (request, response) => {
  const responseObj = {
    message: 'You do not have access to this content.',
    id: 'forbidden',
  };
  return respond(request, response, 403, responseObj);
};

const getInternal = (request, response) => {
  const responseObj = {
    message: 'Internal Server Error. Something went wrong.',
    id: 'internal',
  };
  return respond(request, response, 500, responseObj);
};

const getNotImplemented = (request, response) => {
  const responseObj = {
    message:
      'A GET request for this page has not been implemented yet. Check again later for updated content.',
    id: 'notImplemented',
  };
  return respond(request, response, 501, responseObj);
};

const notFound = (request, response) => {
  const responseObj = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return respond(request, response, 404, responseObj);
};

// pokemon endpoints (REMEMBER TO CHANGE ANYTHING TO LOWERCASE) also add HEAD
// each endpoint here basically is a search for a pokemon by name, type, weakness, or number using similar code
// it searches through the pokedex array and returns the pokemon that matches the search
// if no pokemon is found it returns the appropriate error message
// if the search is successful it returns the pokemon(s) < is that the plural of pokemon? or is it just pokemon?
// GET
const getPokemon = (request, response) => { // gets the pokemon by name
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`); // parses the url
  const name = parsedUrl.searchParams.get('name'); // gets the name parameter from the url
  const limit = parsedUrl.searchParams.get('limit'); // gets the limit parameter from the url

  if (!name) { // if the name parameter is missing
    const responseObj = { message: 'Missing name parameter.', id: 'badRequest' };
    return respond(request, response, 400, responseObj);
  }

  const result = pokedex.filter((pokemon) => pokemon.name.toLowerCase() === name.toLowerCase()); // if the name is found
  let limitedResult = result;
  if (limit) {
    const limitNum = parseInt(limit);
    if (!isNaN(limitNum)) {
      limitedResult = result.slice(0, limitNum);
    }
  }
  if (limitedResult.length === 0) {
    const responseObj = { message: 'Pokemon not found.', id: 'notFound' }; // if no pokemon is found
    return respond(request, response, 404, responseObj);
  }
  return respond(request, response, 200, limitedResult);
};

// gets the pokemon by type
const getPokemonType = (request, response) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
  const type = parsedUrl.searchParams.get('type');
  const limit = parsedUrl.searchParams.get('limit');

  if (!type) {
    const responseObj = { message: 'Missing type parameter.', id: 'badRequest' };
    return respond(request, response, 400, responseObj);
  }

  const result = pokedex.filter((pokemon) => {
    if (Array.isArray(pokemon.type)) {
      return pokemon.type.map((t) => t.toLowerCase()).includes(type.toLowerCase()); // if the type is found
    }
    return pokemon.type && pokemon.type.toLowerCase() === type.toLowerCase();
  });

  let limitedResult = result;
  if (limit) {
    const limitNum = parseInt(limit);
    if (!isNaN(limitNum)) {
      limitedResult = result.slice(0, limitNum);
    }
  }
  if (limitedResult.length === 0) {
    const responseObj = { message: 'No Pokemon found with the given type.', id: 'notFound' }; // if no pokemon is found with the given type
    return respond(request, response, 404, responseObj);
  }
  return respond(request, response, 200, limitedResult);
};

// gets the pokemon by weakness
const getPokemonWeakness = (request, response) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
  const weakness = parsedUrl.searchParams.get('weakness');
  const limit = parsedUrl.searchParams.get('limit');

  if (!weakness) {
    const responseObj = { message: 'Missing weakness parameter.', id: 'badRequest' };
    return respond(request, response, 400, responseObj);
  }

  const result = pokedex.filter((pokemon) => {
    if (Array.isArray(pokemon.weaknesses)) {
      return pokemon.weaknesses.map((w) => w.toLowerCase()).includes(weakness.toLowerCase()); // if the weakness is found
    }
    return pokemon.weaknesses && pokemon.weaknesses.toLowerCase() === weakness.toLowerCase();
  });

  let limitedResult = result;
  if (limit) {
    const limitNum = parseInt(limit);
    if (!isNaN(limitNum)) {
      limitedResult = result.slice(0, limitNum);
    }
  }
  if (limitedResult.length === 0) {
    const responseObj = { message: 'No Pokemon found with the given weakness.', id: 'notFound' }; // if no pokemon is found with the given weakness
    return respond(request, response, 404, responseObj);
  }
  return respond(request, response, 200, limitedResult);
};

// gets the pokemon by number (in the pokedex)
// aka  "num": "001" in the json file
const getPokemonNum = (request, response) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
  const num = parsedUrl.searchParams.get('num');

  if (!num) {
    const responseObj = { message: 'Missing number parameter.', id: 'badRequest' };
    return respond(request, response, 400, responseObj);
  }

  const result = pokedex.find(
    (pokemon) => pokemon.num === num || pokemon.num === parseInt(num).toString(),
  );
  if (!result) {
    const responseObj = { message: 'No Pokemon found with the given number.', id: 'notFound' }; // if no pokemon is found with the given number
    return respond(request, response, 404, responseObj);
  }
  return respond(request, response, 200, result);
};

// POST
// POST /addPokemon < adds now pokemon to the pokedex
const addPokemon = (request, response) => {
  if (request.method !== 'POST') { // if the method is not POST
    const responseObj = { message: 'Only Post', id: 'notPost' };
    return respond(request, response, 405, responseObj);
  }
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', () => {
    let data;
    const contentType = request.headers['content-type'];
    if (contentType === 'application/json') {
      try {
        data = JSON.parse(body);
      } catch (error) {
        const responseObj = { message: 'Invalid JSON format.', id: 'badRequest' };
        return respond(request, response, 400, responseObj);
      }
    } else if (contentType === 'application/x-www-form-urlencoded') { // if the content type is not json (created using ChatGPT)
      data = querystring.parse(body);
    } else {
      try {
        data = JSON.parse(body);
      } catch (error) {
        const responseObj = { message: 'Invalid JSON.', id: 'badRequest' };
        return respond(request, response, 400, responseObj);
      }
    }
    if (!data.name || !data.type || !data.weaknesses) { // if the required fields are missing
      const responseObj = {
        message: 'Missing required fields. Name, type, and weaknesses are required!',
        id: 'badRequest',
      };
      return respond(request, response, 400, responseObj);
    }
    // check if Pokemon with that name already exists (functions similar to /adduser)
    const existing = pokedex.find((pokemon) => pokemon.name.toLowerCase() === data.name.toLowerCase());
    if (existing) {
      const responseObj = { message: 'Pokemon with that name already exists.', id: 'badRequest' };
      return respond(request, response, 400, responseObj);
    }
    const newPokemon = {
      name: data.name,
      type: Array.isArray(data.type) ? data.type : [data.type],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [data.weaknesses],
      num: data.num || (pokedex.length + 1).toString(),
    };
    pokedex.push(newPokemon);
    const responseObj = { message: 'Pokemon added successfully.', pokemon: newPokemon };
    return respond(request, response, 201, responseObj);
  });
};

// POST /editPokemon < edits a pokemon in the pokedex
const editPokemon = (request, response) => {
  if (request.method !== 'POST') {
    const responseObj = { message: 'Only Post', id: 'notPost' };
    return respond(request, response, 405, responseObj);
  }
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', () => {
    let data;
    const contentType = request.headers['content-type'];
    if (contentType === 'application/json') {
      try {
        data = JSON.parse(body);
      } catch (error) {
        const responseObj = { message: 'Invalid JSON format.', id: 'badRequest' };
        return respond(request, response, 400, responseObj);
      }
    } else if (contentType === 'application/x-www-form-urlencoded') { // if the content type is not json
      data = querystring.parse(body);
    } else {
      try {
        data = JSON.parse(body);
      } catch (error) {
        const responseObj = { message: 'Invalid JSON.', id: 'badRequest' };
        return respond(request, response, 400, responseObj);
      }
    }
    // name is required to identify the Pokemon in the pokedex
    if (!data.name) {
      const responseObj = { message: 'Missing name to identify the Pokemon.', id: 'badRequest' };
      return respond(request, response, 400, responseObj);
    }
    const pokemon = pokedex.find((p) => p.name.toLowerCase() === data.name.toLowerCase());
    if (!pokemon) {
      const responseObj = { message: 'Pokemon not found.', id: 'notFound' };
      return respond(request, response, 404, responseObj);
    }
    // update the Pokemon with the new data
    if (data.type) {
      pokemon.type = Array.isArray(data.type) ? data.type : [data.type];
    }
    if (data.weaknesses) {
      pokemon.weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [data.weaknesses];
    }
    // return if the Pokemon was updated successfully
    response.writeHead(204, {
      'Content-Type': 'application/json',
      'Content-Length': 0,
    });
    response.end();
  });
};

module.exports = {
  getSuccess,
  getBadRequest,
  getUnauthorized,
  getForbidden,
  getInternal,
  getNotImplemented,
  notFound,
  getPokemon,
  getPokemonType,
  getPokemonWeakness,
  getPokemonNum,
  addPokemon,
  editPokemon,
};
