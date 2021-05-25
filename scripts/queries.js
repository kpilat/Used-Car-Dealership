const paramModify = require("../scripts/paramModify");



function PrepareForSearch(packedFilterParams) {

    let readyParams;

    if(typeof packedFilterParams === "string"){
        readyParams = JSON.parse(packedFilterParams);
    } else {
        readyParams = packedFilterParams;
    }


    //let readyParams = Clean(filterParams);

    const conditions = {
        brand: (readyParams.brand) ? readyParams.brand : /.*/,
        model: (readyParams.model) ? readyParams.model : /.*/,
        kilometer: {
            $gt: (readyParams.kmFrom) ? readyParams.kmFrom : 0,
            $lt: (readyParams.kmTo) ? readyParams.kmTo : 1000000
        },
        firstRegistration: {
            $gt: (readyParams.yearFrom) ? readyParams.yearFrom : 1970,
            $lt: (readyParams.yearTo) ? readyParams.yearTo : paramModify.getYear()
        },
        powerPS: {
            $gt: (readyParams.powerFrom) ? readyParams.powerFrom : 0,
            $lt: (readyParams.powerTo) ? readyParams.powerTo : 15000
        },
        price: {
            $gt: (readyParams.priceFrom) ? readyParams.priceFrom : 0,
            $lt: (readyParams.priceTo) ? readyParams.priceTo : 100000000
        },
        fuelType: (readyParams.fuel) ? readyParams.fuel : /.*/,
        vehicleType: (readyParams.vehicleType) ? readyParams.vehicleType : /.*/,
        gearbox: (readyParams.gearbox) ? readyParams.gearbox : /.*/,

    };

    return conditions;
}

// function Clean(obj){
//
//     if(obj.model === "Model"){
//         delete obj.model;
//     }
//     return obj;
// }

function SortBy(input){
    let output = "";
    const diff = (diffMe, diffBy) => diffMe.split(diffBy).join('')

    const sortBy = [
        {
            name: "pricea",
            value: {price: 1}
        },
        {
            name: "priced",
            value: {price: -1}
        }
    ];

    sortBy.forEach(function(item){
        if(item.name === input){
            output = item.value;
        }
    });

    return output;
}

module.exports = {PrepareForSearch, SortBy};