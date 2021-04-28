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

module.exports = {fillYear, getYear};