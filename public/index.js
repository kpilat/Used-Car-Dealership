let data;
const ids = ["selectedBrand","selectedModel","selectedYearFrom","selectedYearTo","selectedFuel","selectedKmFrom",
    "selectedKmTo","selectedBodyType","selectedGearbox","powerFrom","powerTo","PriceFrom","PriceTo"];

function getSelectValue(){
    $("#brandInput").val($( "#selectedBrand option:selected" ).text());
}

$(function(){

    //changeBackgroundColor();

    const rawData = $("#brandOutput").val()

    DisplayFilter(rawData)

})

function DisplayFilter(rawData){

    if(rawData !== undefined){

        rawData = rawData.split(';');

        data = JSON.parse(rawData[0]);
        let brandsToDisplay = [];
        data.forEach(function(item){
            brandsToDisplay.push(item.brand);
        })

        brandsToDisplay = prepareToDisplay(brandsToDisplay);

        brandsToDisplay.forEach(function(item){
            $("#selectedBrand").append("<option>" + item + "</option>");
        });

        if(rawData[1] !== ""){
            RecoverFilterParams(JSON.parse(rawData[1]));
        }
    }

}


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

function beautifyToDisplay(input){

    if (typeof input === 'string') {
        let tmp = input.split('_').join(' ');
        return tmp.charAt(0).toUpperCase() + tmp.slice(1);
    } else {
        return input;
    }
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

    let sortedSearchParams = [];


    ids.forEach(function(id) {

        const querySelector = $("#" + id).val();

        if(querySelector === ""){
            sortedSearchParams.push(undefined);
        } else {
            sortedSearchParams.push(querySelector);
        }

    })

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

    $("#brandInput").val(JSON.stringify(toSend));
}

function ResultOptionsChange(){
    const sort = $("#sort-option").children("option:selected").val();
    const count = $("#count-option").children("option:selected").text();


    window.location.replace("/results?sort=" + sort + "&count=" + count);
}

function RecoverFilterParams(object){


    object.brand = beautifyToDisplay(object.brand);
    loopOptions("selectedBrand", object.brand);
    getModel();
    loopOptions("selectedModel", object.model)
    loopOptions("selectedYearFrom", object.yearFrom);
    loopOptions("selectedYearTo", object.yearTo);
    loopOptions("selectedFuel", object.fuel);
    loopOptions("selectedBodyType", object.vehicleType);
    loopOptions("selectedGearbox", object.gearbox);

    const ids = ["selectedBrand","selectedModel","selectedYearFrom","selectedYearTo","selectedFuel","selectedKmFrom",
        "selectedKmTo","selectedBodyType","selectedGearbox","powerFrom","powerTo","PriceFrom","PriceTo"];

    $("#selectedKmFrom").val(object.kmFrom);
    $("#selectedKmTo").val(object.kmTo);
    $("#powerFrom").val(object.powerFrom);
    $("#powerTo").val(object.powerTo);
    $("#PriceFrom").val(object.priceFrom);
    $("#PriceTo").val(object.priceTo);

}

// function changeBackgroundColor(){
//     console.log(window.location.pathname);
//     if(window.location.pathname === "/results"){
//         $("body").css("background-color", "#FCCA2D")
//     } else {
//         $("body").css("background-color", "#f9f9f9")
//     }
// }

function loopOptions(id, objectAtt){
    if(objectAtt && id){
        $("#" + id).children().each(function(){
            if($(this).val() === objectAtt){
                $(this).attr("selected", "selected");
            }
        });
    }
}

