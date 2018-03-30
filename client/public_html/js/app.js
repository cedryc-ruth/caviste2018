/**
 * Application cliente
 * 
 * @author C. Ruth
 */
const API_URL = 'http://caviste.localhost/api';
const CATALOGUE_URL = 'http://caviste.localhost/caviste2018/server/public';

function reportError(message, type = 'secondary') {
    $('#toolbar .alert').html(message).fadeOut(2000);
    
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
        let countries = [];
        
        $.each(vins, function(key, vin) {
            $('#liste').append('<li class="list-group-item" data-id="'+vin.id+'">'+vin.name+'</li>');
            
            //Ajout des pays dans un tableau pour affichage dans le filtre
            if(countries.indexOf(vin.country)===-1) {
                countries.push(vin.country);
            }
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
        
        //Mise à jour de la liste des filtres par pays
        $('#listePays').empty();
        
        countries.forEach(country => {
            $('#listePays').append('<a class="dropdown-item" href="#">'+country+'</a>');
        });
        
        $('#listePays a').on('click', function() {
            let country = $(this).text();

            $.get(API_URL + '/wines', function(data) {
                let vins = JSON.parse(data);    //console.log(vins);
                
                //Filtrer la liste des vins
                vins = $.map(vins, function(vin, index) {
                    return [vin];
                });     //console.log(vins);
                
                vins = vins.filter(vin => vin.country == country);
                
                $('#liste').empty();
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
    $('#frmWine figure img').attr('src',CATALOGUE_URL+'/pics/'+vin.picture);
    $('#frmWine figure figcaption').html(vin.name);
    
    $('#uploadZone').uploadFile({
        'url':API_URL+'/wines/'+getFormData()['id']+'/pics',
        'fileName':'newPicture',
        'acceptFiles':'image/*',
        'onSuccess': function(files,data,xhr,pd) {
            if(data) {
                //Actualiser l'image du vin
                $('#frmWine figure img').attr('src',CATALOGUE_URL+'/pics/'+files[0]);

                reportError('L\'image du vin a bien été remplacée.','success');

		$('#frmWine .ajax-file-upload-statusbar').fadeOut( "slow" );

            } else {
                reportError('Désolé, Impossible de remplacer l\'image de ce vin!','error');
            }

        }
    });
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

function getFormData() {
    let vin = {};
    
    vin.id = $('#frmWine #idWine').val();
    vin.name = $('#frmWine #nameWine').val();
    vin.grapes = $('#frmWine #grapesWine').val();
    vin.country = $('#frmWine #countryWine').val();
    vin.region = $('#frmWine #regionWine').val();
    vin.year = $('#frmWine #yearWine').val();
    vin.description = $('#frmWine #notes').val();
    vin.picture = $('#frmWine figure img').attr('src')
        .slice($('#frmWine figure img').attr('src').lastIndexOf('/'));
    
    //Validation des champs
    if((vin.id.trim()!='' ? !$.isNumeric(vin.id) : false) || !$.isNumeric(vin.year) 
            || vin.name.trim()==''
            || vin.grapes.trim()==''
            || vin.country.trim()==''
            || vin.region.trim()=='') {

        return null;
    }
    return vin;
}

$(document).ready(function() {    
  //Initialisation de la page
    //Afficher la liste des vins
    showWines();
    
    //Préparer le formulaire
    $('#yearWine').val( (new Date()).getFullYear() );
    
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
    
    $('#btSaveWine').on('click', function() {
        //Retirer la notification d'erreur
        removeError();
        
        //Récupérer les données du formulaire
        let vin = getFormData();
        
        if(vin) {
            if(vin.id=='') {    //Insertion d'un nouveau vin
                //Sauver le vin dans la base de données
                $.post(API_URL + '/wines', vin, function(data) {
                    if(data) {
                        //Actualiser la liste de tous les vins
                        showWines();
                        clearForm();
                        
                        reportError('Le vin a bien été enregistré.','success');
                    } else {
                        reportError('Désolé, Impossible de sauver ce vin!','error');
                    }
                },'json').fail(function() {
                    reportError('Désolé, Impossible de sauver ce vin!','error');
                });
            } else {    //Modification d'un vin existant
                $.ajax({
                    'url':API_URL + '/wines/'+vin.id,
                    'method':'PUT',
                    'data':JSON.stringify(vin),
                    'contentType':'application/json'
                }).done(function(data) {
                        if(data) {
                            //Actualiser la liste de tous les vins
                            showWines();

                            reportError('Le vin a bien été modifié.','success');
                        } else {
                            reportError('Désolé, Impossible de modifier ce vin!','error');
                        }
                }).fail(function() {
                    reportError('Désolé, Impossible de modifier ce vin!','error');
                });
            }
        } else {
            reportError('Veuillez remplir le formulaire en respectant les consignes, svp!','error');
        }
        
        //Annuler l'envoi du formulaire
        event.preventDefault();
        return false;
    });
    
    $('#btDeleteWine').on('click', function() {
        //Retirer la notification d'erreur
        removeError();
        let vin = getFormData();
        
        if(confirm('Confirmer la suppression ?')){        
            $.ajax({
                'method':'DELETE',
                'url':API_URL+'/wines/'+vin.id,
            }).done(function(data) {
                if(data) {
                //Actualiser la liste de tous les vins
                    showWines();
                    reportError('Le vin a bien été supprimé.','success');
                }else {

                    reportError('Désolé, Impossible de supprimer ce vin!','error');
                }
            }).fail(function() {
                        reportError('Désolé, Impossible de supprimer ce vin!','error'); 
            });
        }
        //Annuler l'envoi du formulaire
        event.preventDefault();
        return false;
    });
    
    $()
});



