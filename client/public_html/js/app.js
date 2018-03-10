/**
 * Application cliente
 * 
 * @author C. Ruth
 */
const API_URL = 'http://caviste.localhost/api';

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

function showWines() {
    //Initialisation 
    $('#liste').empty();  
    
    $.get(API_URL + '/wines', function(data) {
        let vins = JSON.parse(data);
        
        $.each(vins, function(key, vin) {
            $('#liste').append('<li class="list-group-item" data-id="'+vin.id+'">'+vin.name+'</li>');
        });
        
        $('#liste li').on('click', function() {
            let idWine = $(this).data('id');

            $.get(API_URL + '/wines/'+idWine, function(data) {
                let vin = JSON.parse(data);
                
                fillForm(vin);
                
            }).fail(function() {
                reportError('Désolé, la sélection n\'est pas disponible en ce moment.','error');
            });
        });
    }).fail(function() {
        reportError('Désolé, le service n\'est pas disponible en ce moment.','error');
    });
}

function fillForm(vin) {
    $('#frmWine #idWine').val(vin.id);
    $('#frmWine #nameWine').val(vin.name);
    $('#frmWine #grapesWine').val(vin.grapes);
    $('#frmWine #countryWine').val(vin.country);
    $('#frmWine #regionWine').val(vin.region);
    $('#frmWine #yearWine').val(vin.year);
    $('#frmWine #notes').val(vin.description);
    $('#frmWine figure img').attr('src','pics/'+vin.picture);
    $('#frmWine figure figcaption').html(vin.name);    
}

function clearForm() {
    $('#frmWine #idWine').val('');
    $('#frmWine #nameWine').val('');
    $('#frmWine #grapesWine').val('');
    $('#frmWine #countryWine').val('');
    $('#frmWine #regionWine').val('');
    $('#frmWine #yearWine').val('');
    $('#frmWine #notes').val('');
    $('#frmWine figure img').attr('src','pictures/wine1.jpg');
    $('#frmWine figure figcaption').html('Wine 1');
    
    $('#frmWine #nameWine').focus();
}

$(document).ready(function() {    
    showWines();
    
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
                    $('#liste').append('<li class="list-group-item" data-id="'+vin.id+'">'+vin.name+'</li>');
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
    
    $('#btAllWines').on('click', function() {
        //Retirer la notification d'erreur
        removeError();
        
        //Vider le champ de recherche
        $('input[name=search]').val('');
                
        //Afficher la liste de tous les vins
        showWines();
    });
    
    $('#btNewWine').on('click', function() {
        //Retirer la notification d'erreur
        removeError();
        
        clearForm();
    });
    
});