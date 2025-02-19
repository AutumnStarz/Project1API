const respond = (request, response, status, object) => { // function to respond to requests
    let responseContent = '';
    let contentType = 'application/json';
    if (request.headers.accept && request.headers.accept.includes('text/xml')) {
      contentType = 'text/xml';
      responseContent = convertObjectToXML(object, status);
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
  
  const getSuccess = (request, response) => { // success response
    const responseObj = {
      message: 'This is a successful response.',
      id: 'success',
    };
    return respond(request, response, 200, responseObj);
  };
  
  const getBadRequest = (request, response) => { // bad request response
    const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
    if (parsedUrl.searchParams.get('valid') === 'true') {
      const responseObj = {
        message: 'Missing valid query paramter.',
      };
      return respond(request, response, 200, responseObj);
    }
    const responseObj = {
      message: 'Missing valid query parameter set to true.',
      id: 'badRequest',
    };
    return respond(request, response, 400, responseObj);
  };
  
  const getUnauthorized = (request, response) => { // unauthorized response
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
  
  const getForbidden = (request, response) => { // forbidden response
    const responseObj = {
      message: 'You do not have access to this content.',
      id: 'forbidden',
    };
    return respond(request, response, 403, responseObj);
  };
  
  const getInternal = (request, response) => { // internal server error response (aka server exploded)
    const responseObj = {
      message: 'Internal Server Error. Something went wrong.',
      id: 'internal',
    };
    return respond(request, response, 500, responseObj);
  };
  
  const getNotImplemented = (request, response) => { // not implemented response
    const responseObj = {
      message:
        'A GET request for this page has not been implemented yet. Check again later for updated content.',
      id: 'notImplemented',
    };
    return respond(request, response, 501, responseObj);
  };
  
  const notFound = (request, response) => { // not found response
    const responseObj = {
      message: 'The page you are looking for was not found.',
      id: 'notFound',
    };
    return respond(request, response, 404, responseObj);
  };
  
  module.exports = { // export functions
    getSuccess,
    getBadRequest,
    getUnauthorized,
    getForbidden,
    getInternal,
    getNotImplemented,
    notFound,
  };