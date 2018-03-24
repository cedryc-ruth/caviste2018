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

$app->get('/api/wines/{id}', function(Request $request, Response $response, array $args) {
    $id = $args['id'];
    
    $wine = R::load('wine',$id);
    //var_dump($wine);die;
    return json_encode($wine,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
});

$app->post('/api/wines', function(Request $request, Response $response, array $args) {
    $wineData =$request->getParsedBody();
    
    $wine = R::dispense('wine');
    $wine->name = $wineData['name'];
    $wine->grapes = $wineData['grapes'];
    $wine->country = $wineData['country'];
    $wine->region = $wineData['region'];
    $wine->year = $wineData['year'];
    $wine->picture = $wineData['picture'];
    $wine->description = $wineData['description'];
    
    if(R::store($wine)) {
        return json_encode(true);
    }
    return json_encode(false);
});

$app->put('/api/wines/{id}', function(Request $request, Response $response, array $args) {
    $wineData = $request->getParsedBody();
    //print_r($request->getParsedBody());die;
    $wine = R::load('wine',$args['id']);
    $wine->name = $wineData['name'];
    $wine->grapes = $wineData['grapes'];
    $wine->country = $wineData['country'];
    $wine->region = $wineData['region'];
    $wine->year = $wineData['year'];
    $wine->picture = $wineData['picture'];
    $wine->description = $wineData['description'];
    
    if(R::store($wine)) {
        return json_encode(true);
    }
    return json_encode(false);
});

$app->delete('/api/wines/{id}', function(Request $request, Response $response, array $args) {
    R::trash('wine', $args['id']);
    $wine = R::find('wine','id='.$args['id']);
    
    if(empty($wine)) {
        return json_encode(true);
    }
    return json_encode(false);  
});

$app->post('/api/wines/{id}/pics', function(Request $request, Response $response, array $args) {
    $output_dir = "../public/pics/";
    //var_dump($args['id']);die;
    
    if(isset($_FILES["newPicture"]) && empty($_FILES["myfile"]["error"])) {
        $filename = $_FILES["newPicture"]["name"];

        if(move_uploaded_file($_FILES["newPicture"]["tmp_name"],$output_dir.$filename)) {
            $wine = R::load('wine',$args['id']);
            var_dump($wine);
            if($wine->id!=0) {
                $wine->picture = $filename;
                
                if(R::store($wine)) {
                    return json_encode(true);
                }
            }
        }
     }

     return json_encode(false);
});

$app->get('/catalogue/', function(Request $request, Response $response, array $args) {
    echo "Catalogue!";
});