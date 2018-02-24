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
            $('#liste').append('<li>'+vin.name+'</li>');
        });
    });
    
    //Gestion des commandes
    $('#btSearch').on('click', function() {
        //Récupérer le mot-clé tapé dans le formulaire
        let keyword = $('form#frmSearch input[name=search]').val();
        
        //Envoyer une requête au serveur pour obtenir les vins 
        //dont le nom contient le mot-clé
        
        
        //Mettre à jour la liste des vins (ul) avec les vins obtenus
        
        alert(keyword);
    });
    
});