var numeral = require("numeral");

//Formatea Moneda Extranjera
Number.prototype.toCurrency = function (currencySymbol, qdecimals) {

    numeral.locale('es');
    
    //Q Decimales
    var zeroes = "";
    for (x = 0; x < qdecimals; x++) {
        if (x < 2) //Forzar solamente a 2 decimales
            zeroes += "0";
    }

    //Simbolo
    if (currencySymbol == null)
        currencySymbol = "$";

    var value = this;
    let format = "0,0[.]" + zeroes;
    let isNegative = value < 0;
    if (isNegative) {
        value = -value;
    }
    let numberString = currencySymbol + " " + numeral(value).format(format);
    if (isNegative) {
        numberString = "-" + numberString;
    }

    return numberString;
};