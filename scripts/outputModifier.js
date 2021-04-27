

function fillYear(){
    var years = [];
    const date = new Date();
    const currentYear = date.getFullYear();
    for(var i = currentYear; i >= 1970; i--){
        years.push(i);
    }
    return years;
}

module.exports = {fillYear};