/**
 * Application cliente
 * 
 * @author C. Ruth
 */
const API_URL = 'http://caviste.localhost/api';
const CATALOGUE_URL = 'http://caviste.localhost/caviste2018/server/public';
let vins = [];

function reportError(message, type = 'secondary') {
    $('#toolbar .alert').html(message).animate({opacity:1}).animate({opacity:0});
    
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
        vins = JSON.parse(data);
        let countries = [];
        let years = []; 
        
        $.each(vins, function(key, vin) {
            $('#liste').append('<li class="list-group-item" data-id="'+vin.id+'">'+vin.name+'</li>');
            
            //Ajout des pays dans un tableau pour affichage dans le filtre
            if(countries.indexOf(vin.country)===-1) {
                countries.push(vin.country);
            }
            
            //Ajout des années dans un tableau pour affichage dans le filtre
            if(years.indexOf(vin.year)===-1) {
                years.push(vin.year);
            }
            
            //Mettre à jour la carte Google Maps
            let geocoder = new google.maps.Geocoder;    //console.log(geocoder);

            geocoder.geocode({'address': vin.region+', '+vin.country }, function(results, status) {
                if(status=='OK') {  //console.log(results)
                    //Ajout des coordonnées au vin
                    vin.coords = results[0].geometry.location;
                    
                    //Récupérer les coordonnées region/country de chaque vin
                    console.log(vins);
                    //Ajouter des marqueurs sur la carte pour chaque vin
                    let marker = new google.maps.Marker({
                        position: vin.coords,
                        map: bigMap,
                        title: vin.name
                        /*icon: 'pictures/marker.png'  bottle | drop */
                    });

                    marker.addListener('click',function() {        
                        info.open(this.get('bigMap'),this);
                    });

                    //Ajouter une info pour chaque marqueur (name, grapes, year,...) 
                    let info = new google.maps.InfoWindow({
                        content: '<h2>vin.name</h2>\
                        <table>\n\
                            <tr><td>Country</td><td>'+vin.country+'</td></tr>\n\
                            <tr><td>Region</td><td>'+vin.region+'</td></tr>\n\
                        </table>'
                    });
                } else {
                    reportError('Impossible de localiser cette région!');
                }
            });
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
        
        //Mise à jour de la liste des filtres par année
              
        $('#listYears').empty();
        
        years.sort();
        
        years.forEach(year => {
           $('#listYears').append('<a class="dropdown-item year-item" href="#">'+year+'</a>');
        });
        
        $('.year-item').on('click', function(){
             let yearSelected = $(this).text();
             var vinsArray = [];
             let vinNewArray = [];
             
             for(let prop in vins){
                if(vins[prop].year == yearSelected){
                    vinNewArray.push(vins[prop]);
                }
             }

            
            $('#liste').empty();
            $('#dropDownYear').text(yearSelected);
            $.each(vinNewArray, function(key, vin) {
                $('#liste').append('<li class="list-group-item" data-id="'+vin.id+'">'+vin.name+'</li>');
            });
        })
        
        
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
    $('#tabs').tabs();
    
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
    
    //Géolocalisation de l'internaute
    let geoloc = navigator.geolocation;
    geoloc.getCurrentPosition(function(position) {  //console.log(position);
        let coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        
        window.map.setCenter(coords);
    }, function(positionError) { 
        //console.log(positionError);
        //Géolocaliser par IP
        $.getJSON('http://ip-api.com/json/?callback=?',function(data) {
            if(data.status=='success') {
                let coords = {
                    lat: data.lat,
                    lng: data.lon
                };
                
                window.map.setCenter(coords);
            }
        });
    });
});

//Affichage de la mini-map
function initMap() {
    let carte = $('#map')[0];
    let coords = { lat: 50.850346, lng: 4.3517 };
    
    window.map = new google.maps.Map(carte,{
        center: coords,
        zoom: 10
    });
    
    let marker = new google.maps.Marker({
        position: coords,
        map: map,
        title: 'Bruxelles',
        icon: 'pictures/marker.png'
    });
    marker.setLabel('*o*');
    marker.addListener('click',function() {        
        info.open(this.get('map'),this);
    });
    
    let info = new google.maps.InfoWindow({
        content: 'L\'EPFC se trouve ici ;)'
    });
    
    //Création de la grande carte
        //Créer la carte
    window.bigMap = new google.maps.Map($('#big-map')[0],{
        center: {lat: 50, lng: 0},
        zoom: 3
    });
}
