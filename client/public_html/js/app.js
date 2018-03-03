/**
 * Application cliente
 * 
 * @author C. Ruth
 */

 $(document).ready(function() {
    const API_URL = 'http://caviste.localhost/api';
    
    //Initialisation 
    $('#liste').empty();  
    
    $.get(API_URL + '/wines', function(data) {
        vins = JSON.parse(data);
        
        $.each(vins, function(key, vin) {
            $('#liste').append('<li class="list-group-item">'+vin.name+'</li>');
        });
    }).fail(function() {
        let notification = '<div class="alert alert-danger" role="alert">\n\
            Désolé, le service n\'est pas disponible en ce moment.\n\
        </div>';
    
        $('#toolbar').append(notification);
    });
    
    //Gestion des commandes
    $('#btSearch').on('click', function() {
        //Récupérer le mot-clé tapé dans le formulaire
        let keyword = $('form#frmSearch input[name=search]').val();
        
        //Envoyer une requête au serveur pour obtenir les vins 
        //dont le nom contient le mot-clé
        $.get(API_URL + '/wines/search/'+keyword, function(data) {
            vins = JSON.parse(data);

            //Mettre à jour la liste des vins (ul) avec les vins obtenus
            $.each(vins, function(key, vin) {
                $('#liste').append('<li class="list-group-item">'+vin.name+'</li>');
            });
        }).fail(function() {
            let notification = '<div class="alert alert-danger" role="alert">\n\
                Désolé, le service n\'est pas disponible en ce moment.\n\
            </div>';

            $('#toolbar').append(notification);
        });    
    });
    
});