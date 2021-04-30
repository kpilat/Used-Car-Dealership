const date = new Date();

function fillYear(){
    let years = [];
    const currentYear = date.getFullYear();
    for(let i = currentYear; i >= 1970; i--){
        years.push(i);
    }
    return years;
}

function getYear(){
    return date.getFullYear();
}

function GetResultOptions(condition, fisrtElement){

    if(condition === "sort"){

        const sort = [{
                display: "Ceny (najnižšej)",
                value: "pricea"
            },
            {
                display: "Ceny (najvyššej)",
                value: "priced"
            }
        ]
        sort.unshift(sort.splice(sort.findIndex(elt => elt.value === fisrtElement), 1)[0])
        return sort;

    } else if(condition === "count"){

        const count = [10, 15, 20, 30];
        count.unshift(count.splice(count.findIndex(elt => elt === fisrtElement), 1)[0])
        return count;
    }


}


function GetPageNumbers(currentPage, maxLen){

    let numbers = []
    for(let i = currentPage - 2; i <= currentPage + 2; i++){
        if(i > 0 && i <= maxLen){
            numbers.push(i);
        }
    }
    return numbers;
}

module.exports = {fillYear, getYear, GetResultOptions, GetPageNumbers};