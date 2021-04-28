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

    if(input !== undefined){
    let output = [];
    output = input.split(' ').join('_');
    output = output.charAt(0).toLowerCase() + output.slice(1);
    return output;
    }
}

function gatherValues(){
    // $("#brandInput").val($( "#selectedBrand option:selected" ).text());
    //$("#brandInput").val($( "#selectedBrand option:selected" ).text());
    const ids = ["selectedBrand","selectedModel","selectedYearFrom","selectedYearTo","selectedFuel","selectedKmFrom",
        "selectedKmTo","selectedBodyType","selectedGearbox","powerFrom","powerTo","PriceFrom","PriceTo"];
    let sortedSearchParams = [];


    //console.log("First: " + $("#" + ids[0]).children("option:selected").val());
    ids.forEach(function(id) {
        if($("#" + id).val() === "")
        console.log( id + ": " + $("#" + id).val());
    })

    ids.forEach(function(id) {

        const querySelector = $("#" + id).val();

        if(querySelector === ""){
            sortedSearchParams.push(undefined);
        } else {
            sortedSearchParams.push(querySelector);
        }

    })

    // const toSend = {
    //     brand: prepareToSend(sortedSearchParams[0]),
    //     model: prepareToSend(sortedSearchParams[1]),
    //     firstRegistration: "{$gt :" + sortedSearchParams[2] + ", " + "$lt : " + sortedSearchParams[3] + "}",
    //     fuelType: sortedSearchParams[4],
    //     kilometer: "{$gt :" + sortedSearchParams[5] + ", " + "$lt : " + sortedSearchParams[6] + "}",
    //     vehicleType: sortedSearchParams[7],
    //     gearbox: sortedSearchParams[8],
    //     powerPS: "{$gt :" + sortedSearchParams[9] + ", " + "$lt : " + sortedSearchParams[10] + "}",
    //     price: {$gt : sortedSearchParams[11] ,  $lt : sortedSearchParams[12] }
    // }


    const toSend = {
        brand: prepareToSend(sortedSearchParams[0]),
        model: prepareToSend(sortedSearchParams[1]),
        yearFrom: sortedSearchParams[2],
        yearTo: sortedSearchParams[3],
        fuel: sortedSearchParams[4],
        kmFrom: sortedSearchParams[5],
        kmTo: sortedSearchParams[6],
        vehicleType: sortedSearchParams[7],
        gearbox: sortedSearchParams[8],
        powerFrom: sortedSearchParams[9],
        powerTo: sortedSearchParams[10],
        priceFrom: sortedSearchParams[11],
        priceTo: sortedSearchParams[12]
    }

    console.log(toSend);
    $("#brandInput").val(JSON.stringify(toSend));
}