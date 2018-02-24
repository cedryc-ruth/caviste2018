/**
 * Application cliente
 * 
 * @author C. Ruth
 */

 $(document).ready(function() {
    $('#liste').empty();
    
    let vins = [
        {'name':'vin 1'},
        {'name':'vin 2'},
        {'name':'vin 3'},
    ];
    
    vins.forEach(function(vin) {
        $('#liste').append('<li>'+vin.name+'</li>');
    });
    
    
    
});