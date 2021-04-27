let data;

function getSelectValue(){
    $("#brandInput").val($( "#selectedBrand option:selected" ).text());
}

$(document).ready(function(){


    data = JSON.parse($("#brandOutput").val());

    let brandsToDisplay = [];

    data.forEach(function(item){
        brandsToDisplay.push(item.brand);
    })

    brandsToDisplay = prepareToDisplay(brandsToDisplay);

    brandsToDisplay.forEach(function(item){
        $("#selectedBrand").append("<option>" + item + "</option>");
    });

})

function getModel(){
    let brand = $("#selectedBrand option:selected").text();
    let models = [];
    let modelsToDisplay = [];

    brand = prepareToSend(brand);

    data.forEach(function(item){
        if(brand === item.brand){
            models = item.models;
        }
    })

    modelsToDisplay = prepareToDisplay(models);

    $("#selectedModel").empty().append("<option>Model</option>");
    modelsToDisplay.forEach(function(item){
        $("#selectedModel").append("<option>" + item + "</option>");
    });
}




function prepareToDisplay(input){
    let output = [];
    input.forEach(function(item){
        if (typeof item === 'string') {
            let tmp = item.split('_').join(' ');
            output.push(tmp.charAt(0).toUpperCase() + tmp.slice(1));
        } else {
            output.push(item);
        }
    })
    return output.sort();
}




function prepareToSend(input){

    let output = [];
    output = input.split(' ').join('_');
    output = output.charAt(0).toLowerCase() + output.slice(1);
    return output;
}

function gatherValues(){
    // $("#brandInput").val($( "#selectedBrand option:selected" ).text());
    $("#brandInput").val($( "#selectedBrand option:selected" ).text());
}
