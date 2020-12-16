//Obtener nombre de la referencia DTE según número
module.exports.NomReferenciaDTE = function (NumDTE) {

    var NomRef;

    switch(NumDTE) {
        case 30:
            NomRef = "Factura";
            break;

        case 32:
            NomRef = "Factura no Afecta";
            break;

        case 33:
            NomRef = "Factura Electrónica";
            break;

        case 34:
            NomRef = "Factura Exenta Electrónica";
            break;

        case 35:
            NomRef = "Boleta";
            break;

        case 38:
            NomRef = "Boleta Exenta";
            break;

        case 39:
            NomRef = "Boleta Electrónica";
            break;
        
        case 40:
            NomRef = "Liquidación Factura";
            break;

        case 41:
            NomRef = "Boleta Exenta Electrónica";
            break;

        case 43:
            NomRef = "Liquidación Factura Electrónica";
            break;

        case 45:
            NomRef = "Factura Compra";
            break;

        case 46:
            NomRef = "Factura Compra Electrónica";
            break;

        case 50:
            NomRef = "Guía Despacho";
            break;

        case 52:
            NomRef = "Guía Despacho Electrónica";
            break;

        case 55:
            NomRef = "Nota Débito";
            break;

        case 56:
            NomRef = "Nota Débito Electrónica";
            break;

        case 60:
            NomRef = "Nota Crédito";
            break;

        case 61:
            NomRef = "Nota Crédito Electrónica";
            break;

        case 103:
            NomRef = "Liq. com. dis.";
            break;

        case 110:
            NomRef = "Factura de Exportación Electrónica";
            break;
        
        case 111:
            NomRef = "Nota de Débito de Exportación Electrónica";
            break;

        case 112:
            NomRef = "Nota de Crédito de Exportación Electrónica";
            break;

        case 801:
            NomRef = "Orden de Compra";
            break;

        case 802:
            NomRef = "Nota de Pedido";
            break;

        case 803:
            NomRef = "Contrato";
            break;

        case 804:
            NomRef = "Resolución";
            break;

        case 805:
            NomRef = "Proceso ChileCompra";
            break;
        
        case 806:
            NomRef = "Ficha ChileCompra";
            break;

        case 807:
            NomRef = "DUS";
            break;

        case 808:
            NomRef = "B/L (Conocimiento de embarque)";
            break;

        case 809:
            NomRef = "AWB (Air Will Bill)";
            break;
        
        case 810:
            NomRef = "MIC/DTA";
            break;

        case 811:
            NomRef = "Carta de Porte";
            break;

        case 812:
            NomRef = "Resolución del SNA";
            break;

        case 813:
            NomRef = "Pasaporte";
            break;

        case 814:
            NomRef = "Certificado de Depósito Bolsa Prod. Chile";
            break;

        case 815:
            NomRef = "Vale de Prenda Bolsa Prod. Chile"
            break;
    }

    return NomRef;
}

module.exports.GetNombreDTE = function(TipoDTE) {

    var response = "";

    switch(TipoDTE) {
        case 33:
            response = "FACTURA ELECTRONICA";
        break;
        case 34:
            response = "FACTURA NO AFECTA O EXENTA ELECTRONICA";
        break;
        case 43:
            response = "LIQUIDACIÓN FACTURA ELECTRONICA";
        break;
        case 46:
            response = "FACTURA COMPRA ELECTRÓNICA";
        break;
        case 52:
            response = "GUIA DESPACHO ELECTRONICA";
        break;
        case 56:
            response = "NOTA DEBITO ELECTRONICA";
        break;
        case 61:
            response = "NOTA CREDITO ELECTRONICA";
        break;
        case 110:
            response = "FACTURA DE EXPORTACION ELECTRONICA";
        break;
        case 111:
            response = "NOTA DE DEBITO EXPORTACION ELECTRONICA";
        break;
        case 112:
            response = "NOTA DE CREDITO EXPORTACION ELECTRONICA";
        break;
        default:
            response = "NINGUNO";
        break;
    }
    return response;
}

module.exports.GetPaisDestino = function(CodPaisDestin) {

    var response = "";

    switch(CodPaisDestin) {
        case 225:
            response = "U.S.A.";
            break;

        case 517:
            response = "ESPANA";
            break;

        case 997:
            response = "CHILE";
            break;
    }
    return response;
}

module.exports.GetFormatMext = function(TpoMoneda) {
    
    var response = "";

    switch(TpoMoneda) {
        case "DOLAR USA":
            response = "US$";
            break;

        case "EURO":
            response = "€";
            break;

        case "PESO CL":
            response = "$";
            break;
    }
    return response;
}

module.exports.GetIndServicio = function(IndServicio) {
    
    var response = "";

    switch(IndServicio) {
        case 0:
            response = "Mercaderías";
            break;

        case 3:
            response = "Servicios calificados como tal por aduana";
            break;
        
        case 4:
            response = "Servicios de Hotelería";
            break;

        case 5:
            response = "Servicios de Transporte Terrestre Internacional";
            break;
    }

    return response;
}

module.exports.GetModVenta = function(CodModVenta) {
    
    var response = "";

    switch(CodModVenta) {
        case 1:
            response = "A Firme";
            break;

        case 2:
            response = "Bajo Condición";
            break;
        
        case 3:
            response = "En Consignación Libre";
            break;

        case 4:
            response = "En Consig. con Mínimo a Firme";
            break;

        case 9:
            response = "Sin Pago";
            break;
    }

    return response;
}

module.exports.GetFmaPago = function(FmaPago) {
    
    var response = "";

    switch(FmaPago) {
        case 1:
            response = "Contado";
            break;

        case 2:
            response = "Crédito";
            break;
        
        case 3:
            response = "Sin costo (entrega)";
            break;
    }

    return response;
}

module.exports.shortToLongNumber = function(num) {
    var base = parseInt(num);

    if (num.match(/K/)) {
        return Math.round(base * 1000);

    } else if (num.match(/M/)) {
        return Math.round(base * 1000000);

    } else if (num.match(/B/)) {
        return Math.round(base * 1000000000);

    } else {
        return Math.round(base * 1);
    }
}