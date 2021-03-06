let data;
const ids = ["selectedBrand","selectedModel","selectedYearFrom","selectedYearTo","selectedFuel","selectedKmFrom",
    "selectedKmTo","selectedBodyType","selectedGearbox","powerFrom","powerTo","PriceFrom","PriceTo"];

function getSelectValue(){
    $("#brandInput").val($( "#selectedBrand option:selected" ).text());
}

$(function(){

    const rawData = $("#brandOutput").val()
    
    const reportDes = $("#reportDescription")

    reportDes.on("change keyup paste", function () {
        charsLeft = 120 - reportDes.val().length;
        $("#charsLeft").text("Ešte máte " + charsLeft + " znakov")
    })

    DisplayFilter(rawData)

})

function DisplayFilter(rawData){

    if(rawData !== undefined){

        rawData = rawData.split(';');

        data = JSON.parse(rawData[0]);

        if(rawData[1] !== ""){
            RecoverFilterParams(JSON.parse(rawData[1]));
        }
    }

}


function getModel(){

    let brand = $("#selectedBrand option:selected").text();
    let models = [];


    data.forEach(function(item){
        if(brand === " " + item.brand + " "){
            models = item.models;
        }
    })

    models = models.sort();

    $("#selectedModel").empty().append("<option>Model</option>");
    models.forEach(function(item){
        $("#selectedModel").append("<option>" + item + "</option>");
    });
}




function gatherValues(searchOrCreate){

    let sortedSearchParams = [];


    ids.forEach(function(id) {

        const querySelector = $("#" + id).val();

        if(querySelector === ""){
            sortedSearchParams.push(undefined);
        } else {
            sortedSearchParams.push(querySelector);
        }

    })

    let toSend;
    if(searchOrCreate === "search") {

        toSend = {
            brand: sortedSearchParams[0],
            model: (sortedSearchParams[1] === "Model") ? undefined : sortedSearchParams[1],
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
        };
    } else if (searchOrCreate === "create"){

        toSend = {
            brand: sortedSearchParams[0],
            model: (sortedSearchParams[1] === "Model") ? undefined : sortedSearchParams[1],
            firstRegistration: sortedSearchParams[2],
            fuelType: sortedSearchParams[4],
            kilometer: sortedSearchParams[5],
            vehicleType: sortedSearchParams[7],
            gearbox: sortedSearchParams[8],
            powerPS: sortedSearchParams[9],
            price: sortedSearchParams[11]
        };
    }

    console.log(toSend);
    $("#brandInput").val(JSON.stringify(toSend));
}


function ResultOptionsChange(pageNumber){
    const sort = $("#sort-option").children("option:selected").val();
    const count = $("#count-option").children("option:selected").text();


    window.location.replace("/results?sort=" + sort + "&count=" + count + "&page=" + pageNumber);
}

function RecoverFilterParams(object){

    console.log(object);

    loopOptions("selectedBrand", object.brand);
    getModel();
    loopOptions("selectedModel", object.model)
    loopOptions("selectedYearFrom", object.yearFrom);
    loopOptions("selectedYearFrom", (object.firstRegistration) ? (object.firstRegistration).toString() : undefined);
    loopOptions("selectedYearTo", object.yearTo);
    loopOptions("selectedFuel", object.fuel);
    loopOptions("selectedFuel", object.fuelType);
    loopOptions("selectedBodyType", object.vehicleType);
    loopOptions("selectedGearbox", object.gearbox);

    const ids = ["selectedBrand","selectedModel","selectedYearFrom","selectedYearTo","selectedFuel","selectedKmFrom",
        "selectedKmTo","selectedBodyType","selectedGearbox","powerFrom","powerTo","PriceFrom","PriceTo"];

    $("#selectedKmFrom").val(object.kmFrom);
    $("#selectedKmFrom").val(object.kilometer);
    $("#selectedKmTo").val(object.kmTo);
    $("#powerFrom").val(object.powerFrom);
    $("#powerFrom").val(object.powerPS);
    $("#powerTo").val(object.powerTo);
    $("#PriceFrom").val(object.priceFrom);
    $("#PriceFrom").val(object.price);
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

