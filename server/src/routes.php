<?php

use Slim\Http\Request;
use Slim\Http\Response;
use \RedBeanPHP\R as R;

// Routes
/*
$app->get('/[{name}]', function (Request $request, Response $response, array $args) {
    // Sample log message
    $this->logger->info("Slim-Skeleton '/' route");

    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});
*/
$app->get('/api/', function(Request $request, Response $response, array $args) {
   
    
    echo "API!";
});

/**
 * Tous les vins
 */
$app->get('/api/wines', function(Request $request, Response $response, array $args) {
    $wines = R::findAll('wine');
    
    return json_encode($wines,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
});

$app->get('/api/wines/search/{name}', function(Request $request, Response $response, array $args) {
    $name = $args['name'];
    
    $wines = R::find('wine','name LIKE ?',[ "%$name%" ]);
    //var_dump($wines);
    return json_encode($wines,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
});

$app->get('/api/wines/10', function(Request $request, Response $response, array $args) {
    echo "Vin n°10";
});

$app->post('/api/wines', function(Request $request, Response $response, array $args) {
    echo "Ajoute un vin!";
});

$app->put('/api/wines/10', function(Request $request, Response $response, array $args) {
    echo "Modifie le vin n°10";
});

$app->delete('/api/wines/10', function(Request $request, Response $response, array $args) {
    echo "Supprime le vin n°10";
});

$app->get('/catalogue/', function(Request $request, Response $response, array $args) {
    echo "Catalogue!";
});