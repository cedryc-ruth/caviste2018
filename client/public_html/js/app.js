/**
 * Application cliente
 * 
 * @author C. Ruth
 */
function reportError(message, type = 'secondary') {
    $('#toolbar .alert').html(message);
    
    switch(type) {
        case 'error':
            $('#toolbar .alert').addClass('alert-danger'); break;
        case 'success':
            $('#toolbar .alert').addClass('alert-success'); break;
        default:
            $('#toolbar .alert').addClass('alert-secondary');
    }
}

function removeError() {
    $('#toolbar .alert').html('');
    
    $('#toolbar .alert').removeClass().addClass('alert');
}

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
        reportError('Désolé, le service n\'est pas disponible en ce moment.','error');
    });
    
    //Gestion des commandes
    $('input[name=search]').on('keypress',function() {
        if(event.keyCode==13) {
            $('#btSearch').click();
        }
    });
    
    $('#btSearch').on('click', function() {
        removeError();
        
        //Récupérer le mot-clé tapé dans le formulaire
        let keyword = $('form#frmSearch input[name=search]').val();
        
        if(keyword && keyword.trim()!='') {
            //Envoyer une requête au serveur pour obtenir les vins 
            //dont le nom contient le mot-clé
            $.get(API_URL + '/wines/search/'+keyword, function(data) {
                vins = JSON.parse(data);

                //Vider la liste
                $('#liste').empty();

                //Mettre à jour la liste des vins (ul) avec les vins obtenus
                $.each(vins, function(key, vin) {
                    $('#liste').append('<li class="list-group-item">'+vin.name+'</li>');
                });
            }).fail(function() {
                reportError('Désolé, la recherche n\'est pas disponible en ce moment.','error');
            });
        } else {
            reportError('Veuillez entrer un mot-clé dans la barre de recherche.','error');
        }
        
        //Annuler l'envoi du formulaire
        event.preventDefault();
        return false;
    });
    
});