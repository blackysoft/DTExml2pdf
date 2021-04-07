//modules
const fs = require('fs');
const xml2js = require('xml2js');
const pdf = require('html-pdf');
const moment = require('moment');
const numeral = require('numeral');
const n2words = require('n2words');
const Canvas = require("canvas");
const PDF417 = require("pdf417-generator");

//helpers & protos
const helpers = require('./helpers')
require("./prototypes");

//set locales
require('numeral/locales');
numeral.locale('es');
moment.locale('es');

//set pdf page options
var options = {
    "height": "11in",
    "width": "8.5in",
    "orientation": "portrait",
    "border": {
        "top": "1.2cm",
        "left": "0",
        "bottom": "1.2cm",
        "right": "0"
    }
}

//EnvioDTE.xml o DTE.xml
const FileName = "DTE.xml";

//init parser
var parser = new xml2js.Parser();

var html = "";

fs.readFile(__dirname + '/' + FileName, { encoding: 'UTF-8' }, function (err, data) {

    parser.parseString(data, function (err, result) {

        var DocumentoNode;

        //Si result contiene nodo EnvioDTE o DTE
        //TO-DO multiples DTES en un mismo envío
        if (result.hasOwnProperty('EnvioDTE')) {
            DocumentoNode = result.EnvioDTE.SetDTE[0].DTE[0].Documento[0];
        } else {

            var TipoDTE = result.DTE
            //si tiene exportacion, liquidación o documento
            if (TipoDTE.hasOwnProperty('Exportaciones')) { //para caso 110, 111, 112
                DocumentoNode = result.DTE.Exportaciones[0]
            } else if (TipoDTE.hasOwnProperty('Liquidacion')) {
                DocumentoNode = result.DTE.Liquidacion[0];
            } else {
                DocumentoNode = result.DTE.Documento[0]
            }
        }

        //tabla info
        var nodoAduana = DocumentoNode.Encabezado[0],
            nodoDoc = DocumentoNode.Encabezado[0].IdDoc[0],
            nodoReceptor = DocumentoNode.Encabezado[0].Receptor[0];

        if (nodoDoc.hasOwnProperty("IndServicio")) {
            var IndServicioVal = "<span>" + helpers.GetIndServicio(parseInt(DocumentoNode.Encabezado[0].IdDoc[0].IndServicio)) + "</span>";
        } else {
            var IndServicioVal = "<span>&nbsp;</span>";
        }

        if (nodoDoc.hasOwnProperty("FmaPago")) {
            var FmaPagoCol = "<span>FORMA DE PAGO:</span>";
            var FmaPagoVal = "<span>" + helpers.GetFmaPago(parseInt(DocumentoNode.Encabezado[0].IdDoc[0].FmaPago)) + "</span>";
        } else {
            var FmaPagoCol = "<span>&nbsp;</span>";
            var FmaPagoVal = "<span>&nbsp;</span>";
        }

        if (nodoDoc.hasOwnProperty('IndTraslado')) {
            var IndTrasladoCol = "<span>TIPO TRASLADO:</span>";
            var IndTrasladoVal = "<span> " + DocumentoNode.Encabezado[0].IdDoc[0].IndTraslado + " </span>";
        } else {
            var IndTrasladoCol = "<span>&nbsp;</span>";
            var IndTrasladoVal = "<span>&nbsp;</span>";
        }

        if (nodoAduana.hasOwnProperty('Transporte')) {

            if(nodoAduana.Transporte[0].hasOwnProperty('Aduana')) {
                if (nodoAduana.Transporte[0].Aduana[0].hasOwnProperty('CodPtoEmbarque')) {
                    var CodPuertoEmbCol = "<span>COD PUERTO EMBARQUE:</span>";
                    var CodPuertoEmbVal = "<span>" + DocumentoNode.Encabezado[0].Transporte[0].Aduana[0].CodPuertoEmb + "</span>";
                } else {
                    var CodPuertoEmbCol = "<span>&nbsp;</span>";
                    var CodPuertoEmbVal = "<span>&nbsp;</span>";
                }
    
                if (nodoAduana.Transporte[0].Aduana[0].hasOwnProperty('CodPtoDesemb')) {
                    var CodPtoDesembCol = "<span>COD PUERTO EMBARQUE:</span>";
                    var CodPtoDesembVal = "<span>" + DocumentoNode.Encabezado[0].Transporte[0].Aduana[0].CodPtoDesemb + "</span>";
                } else {
                    var CodPtoDesembCol = "<span>&nbsp;</span>";
                    var CodPtoDesembVal = "<span>&nbsp;</span>";
                }
    
                if (nodoAduana.Transporte[0].Aduana[0].hasOwnProperty('CodModVenta')) {
                    var CodModVentaCol = "<span>MODALIDAD DE VENTA:</span>";
                    var CodModVentaVal = "<span>" + helpers.GetModVenta(parseInt(DocumentoNode.Encabezado[0].Transporte[0].Aduana[0].CodModVenta)) + "</span>";
                } else {
                    var CodModVentaCol = "<span>&nbsp;</span>";
                    var CodModVentaVal = "<span>&nbsp;</span>";
                }
    
                if (nodoAduana.Transporte[0].Aduana[0].hasOwnProperty('TotBultos')) {
                    var TotBultosCol = "<span>TOTAL BULTOS:</span>";
                    var TotBultosVal = "<span>" + parseInt(DocumentoNode.Encabezado[0].Transporte[0].Aduana[0].TotBultos) + "</span>";
                } else {
                    var TotBultosCol = "<span>&nbsp;</span>";
                    var TotBultosVal = "<span>&nbsp;</span>";
                }
            }

            if (nodoAduana.Transporte[0].DirDest) {
                var DirDest = true;
                var DirDestVal = (DocumentoNode.Encabezado[0].Transporte[0].DirDest != null) ? DocumentoNode.Encabezado[0].Transporte[0].DirDest : "";
            } else {
                var DirDest = false;
            }
        }

        if (nodoReceptor.hasOwnProperty('Contacto')) {
            var ContactoCol = "<span>CONTACTO:</span>";
            if (DocumentoNode.Encabezado[0].Receptor[0].Contacto == null || DocumentoNode.Encabezado[0].Receptor[0].Contacto == "" || DocumentoNode.Encabezado[0].Receptor[0].Contacto == "null") {
                var ContactoVal = "<span>&nbsp;</span>";
            } else {
                var ContactoVal = "<span> " + DocumentoNode.Encabezado[0].Receptor[0].Contacto + " </span>";
            }
        } else {
            var ContactoCol = "<span>&nbsp;</span>";
            var ContactoVal = "<span>&nbsp;</span>";
        }

        var tablaInfo = "";
        switch (parseInt(DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE)) {
            case 110:
            case 111:
            case 112:
                tablaInfo += "        <div style='width: 50%; height: auto; float: left; border: 1px solid #000;'>";
                tablaInfo += "            <div style='padding: 8px 10px; min-height: 134px;'>";
                tablaInfo += "                <div class='col-md-3 nopadding'>";
                tablaInfo += "                    <div class='label-fact-terc'><span>SEÑOR(ES)</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>RUT</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>ID RECEPTOR</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>TIPO MONEDA</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>TIPO CAMBIO</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>PAÍS DESTINO</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>CIUDAD</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>DIRECCIÓN</span>:</div>";
                tablaInfo += "                </div>";
                tablaInfo += "                <div class='col-md-9 nopadding'>";
                tablaInfo += "                    <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].RznSocRecep + "</div>";
                tablaInfo += "                    <div class='txt-fact-terc'>55.555.555-5</div>";
                tablaInfo += "                    <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].Extranjero[0].NumId + "</div>";
                tablaInfo += "                    <div class='txt-fact-terc'> <span> " + DocumentoNode.Encabezado[0].Totales[0].TpoMoneda + "</span> </div>";

                if (DocumentoNode.Encabezado[0].OtraMoneda[0].TpoCambio > 0) {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span>" + numeral(DocumentoNode.Encabezado[0].OtraMoneda[0].TpoCambio).format("$0,0[.]00") + "</span> </div>";
                } else {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span> No Especificado </span> </div>";
                }

                if (DocumentoNode.Encabezado[0].Transporte[0].Aduana[0].CodPaisDestin > 0) {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span>" + helpers.GetPaisDestino(parseInt(DocumentoNode.Encabezado[0].Transporte[0].Aduana[0].CodPaisDestin)) + "</span> </div>";
                } else {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span> &nbsp; </span> </div>";
                }

                if (DocumentoNode.Encabezado[0].Receptor[0].CiudadRecep) {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span>" + DocumentoNode.Encabezado[0].Receptor[0].CiudadRecep + "</span> </div>";
                } else {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span> &nbsp; </span> </div>";
                }

                if (DocumentoNode.Encabezado[0].Receptor[0].DirRecep) {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span>" + DocumentoNode.Encabezado[0].Receptor[0].DirRecep + "</span> </div>";
                } else {
                    tablaInfo += "                    <div class='txt-fact-terc'> <span> &nbsp; </span> </div>";
                }
                tablaInfo += "                </div>";
                tablaInfo += "            </div>";
                tablaInfo += "        </div>";

                tablaInfo += "        <div style='width: 49%; height: auto; float: left; border: 1px solid #000; border-left: none;'>";
                tablaInfo += "            <div style='padding: 5px 10px 4px 10px;min-height: 69px;border-bottom: 1px solid #000;'>";
                tablaInfo += "                <div class='col-md-5 nopadding'>";
                tablaInfo += "                    <div class='label-fact-terc' style='min-height:28px;'><span>INDICADOR DE SERVICIO</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'> " + CodPuertoEmbCol + " </div>";
                tablaInfo += "                    <div class='label-fact-terc'> " + CodPtoDesembCol + " </div>";
                tablaInfo += "                </div>";
                tablaInfo += "                <div class='col-md-7 nopadding'>";
                tablaInfo += "                    <div class='txt-fact-terc' style='min-height:28px;'> " + IndServicioVal + " </div>";
                tablaInfo += "                    <div class='txt-fact-terc'> " + CodPuertoEmbVal + " </div>";
                tablaInfo += "                    <div class='txt-fact-terc'> " + CodPtoDesembVal + " </div>";
                tablaInfo += "                </div>";
                tablaInfo += "            </div>";
                tablaInfo += "            <div style='padding: 5px 10px 4px 10px; min-height: 55px;'>";
                tablaInfo += "                <div class='col-md-5 nopadding'>";
                tablaInfo += "                    <div class='label-fact-terc'>" + TotBultosCol + "</div>";
                tablaInfo += "                    <div class='label-fact-terc'> " + CodModVentaCol + " </div>";
                tablaInfo += "                    <div class='label-fact-terc'><span>FECHA EMISIÓN</span>:</div>";
                tablaInfo += "                    <div class='label-fact-terc'> " + FmaPagoCol + " </div>";
                tablaInfo += "                </div>";
                tablaInfo += "                <div class='col-md-7 nopadding'>";
                tablaInfo += "                    <div class='txt-fact-terc'>" + TotBultosVal + "</div>";
                tablaInfo += "                    <div class='txt-fact-terc'> " + CodModVentaVal + " </div>";
                tablaInfo += "                    <div class='txt-fact-terc'> " + moment(DocumentoNode.Encabezado[0].IdDoc[0].FchEmis, 'YYYY-MM-DD', true).format("DD [de] MMMM [del] YYYY") + " </div>";
                tablaInfo += "                    <div class='txt-fact-terc'> " + FmaPagoVal + " </div>";
                tablaInfo += "                </div>";
                tablaInfo += "            </div>";
                tablaInfo += "        </div>";
                break;

            default:
                tablaInfo += "            <div style='width:60%; height: auto; float: left; border: 1px solid #000;'>";
                tablaInfo += "                <div style='padding:5px 10px 4px 10px; min-height: 80px;'>";
                tablaInfo += "                    <div class='col-md-2 nopadding'>";
                tablaInfo += "                        <div class='label-fact-terc'><span>SEÑOR(ES)</span>:</div>";
                tablaInfo += "                        <div class='label-fact-terc'><span>GIRO</span>:</div>";
                tablaInfo += "                        <div class='label-fact-terc'><span>DIRECCIÓN</span>:</div>";
                tablaInfo += "                        <div class='label-fact-terc'><span>COMUNA</span>:</div>";
                tablaInfo += "                        <div class='label-fact-terc'><span>CIUDAD</span>:</div>";
                tablaInfo += "                    </div>";
                tablaInfo += "                    <div class='col-md-10 nopadding'>";
                tablaInfo += "                        <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].RznSocRecep + "</div>";
                tablaInfo += "                        <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].GiroRecep + "</div>";
                tablaInfo += "                        <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].DirRecep + "</div>";
                tablaInfo += "                        <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].CmnaRecep + "</div>";
                tablaInfo += "                        <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].CiudadRecep + "</div>";
                tablaInfo += "                    </div>";
                tablaInfo += "                </div>";
                tablaInfo += "            </div>";
                tablaInfo += "            <div style='width:39%; height: auto; float: left; border: 1px solid #000; border-left: none;'>";
                tablaInfo += "                <div style='padding:5px 10px 4px 10px; min-height: 80px;'>";
                tablaInfo += "                    <div class='col-md-4 nopadding'>";
                tablaInfo += "                        <div class='label-fact-terc'><span>R.U.T.</span>:</div>";
                tablaInfo += "                        <div class='label-fact-terc'><span>FECHA EMISIÓN</span>:</div>";
                tablaInfo += "                        <div class='label-fact-terc'> " + ContactoCol + " </div>";
                tablaInfo += "                        <div class='label-fact-terc'> " + FmaPagoCol + "</div>";
                tablaInfo += "                        <div class='label-fact-terc'> " + IndTrasladoCol + " </div>";
                tablaInfo += "                    </div>";
                tablaInfo += "                    <div class='col-md-5 nopadding'>";
                tablaInfo += "                        <div class='txt-fact-terc'>" + DocumentoNode.Encabezado[0].Receptor[0].RUTRecep + "</div>";
                tablaInfo += "                        <div class='txt-fact-terc'>" + moment(DocumentoNode.Encabezado[0].IdDoc[0].FchEmis, 'YYYY-MM-DD', true).format("DD [de] MMMM [del] YYYY") + "</div>";
                tablaInfo += "                        <div class='txt-fact-terc'> " + ContactoVal + " </div>";
                tablaInfo += "                        <div class='txt-fact-terc'> " + FmaPagoVal + " </div>";
                tablaInfo += "                        <div class='txt-fact-terc'> " + IndTrasladoVal + " </div>";
                tablaInfo += "                    </div>";
                tablaInfo += "                </div>";
                tablaInfo += "            </div>";
                break;
        }


        //tabla referencia
        //primero verificamos si existe tag referencia
        var referenciaDTE = DocumentoNode;
        var tablaDTERef = "";
        if (referenciaDTE.hasOwnProperty('Referencia')) {
            tablaDTERef += "<div style='font-size: 10px;' class='padd-bottom-xxs padd-top-xxs'><b>REFERENCIAS A OTROS DOCUMENTO</b></div>";
            tablaDTERef += "    <table width='100%' class='factDoc tablaRefer'>";
            tablaDTERef += "        <tr style='background-color: #5f5f5f; color: #fff; font-weight: 400;'>";
            tablaDTERef += "            <td width='30%' style='border-left: 1px solid #000 !important;'><span>TIPO DOCUMENTO REFERENCIADO</span></td>";
            tablaDTERef += "            <td width='10%'><span>FOLIO</span></td>";
            tablaDTERef += "            <td width='20%'><span>FECHA</span></td>";
            tablaDTERef += "            <td width='40%' style='border-right: 1px solid #000 !important;'><span>RAZÓN REFERENCIA</span></td>";
            tablaDTERef += "        </tr>";

            var objRef = DocumentoNode.Referencia.length
            if (objRef > 0) {
                for (var i = 0; i < objRef; i++) {
                    tablaDTERef += "        <tr>";
                    tablaDTERef += "            <td style='border-left: 1px solid #000 !important;'><span> " + helpers.NomReferenciaDTE(parseInt(DocumentoNode.Referencia[i].TpoDocRef)) + " </span></td>";
                    tablaDTERef += "            <td><span>" + DocumentoNode.Referencia[i].FolioRef + "</span></td>";
                    tablaDTERef += "            <td><span>" + moment(DocumentoNode.Referencia[i].FchRef, 'YYYY-MM-DD').format("DD-MM-YYYY") + "</span></td>";
                    if (DocumentoNode.Referencia[i].RazonRef != null) {
                        tablaDTERef += "            <td><span> " + DocumentoNode.Referencia[i].RazonRef + "</span></td>";
                    } else {
                        tablaDTERef += "            <td><span> &nbsp; </span></td>";
                    }
                    tablaDTERef += "        </tr>";
                }
            } else {
                tablaDTERef += "        <tr>";
                tablaDTERef += "            <td style='border-left: 1px solid #000 !important;'><span>&nbsp;</span></td>";
                tablaDTERef += "            <td><span>&nbsp;</span></td>";
                tablaDTERef += "            <td><span>&nbsp;</span></td>";
                tablaDTERef += "            <td><span> - Indicador Global</span></td>";
                tablaDTERef += "        </tr>";
            }
            tablaDTERef += "    </table>";
        }


        //tabla sucursal
        var tablaSucursal = "";
        if (DirDest) {
            tablaSucursal += "<div style='font-size: 10px;' class='padd-bottom-xxs'><b>DIRECCIÓN DESTINO</b></div>";
            tablaSucursal += "    <table width='100%' class='factDoc tablaRefer'>";
            tablaSucursal += "        <tr style='background-color: #5f5f5f; color: #fff; font-weight: 400; border: 1px solid #000 !important;'>";
            tablaSucursal += "            <td width='100%' style='border-left: 1px solid #000 !important;'><span>DIRECCIÓN</span></td>";
            tablaSucursal += "        </tr>";
            tablaSucursal += "        <tr>";
            tablaSucursal += "            <td style='border-left: 1px solid #000 !important;'> " + DirDestVal + " </td>";
            tablaSucursal += "        </tr>";
            tablaSucursal += "    </table>";
        }

        //tabla detalles
        var detalleDTE = DocumentoNode.Detalle;
        var tablaDetalle = "";

        //primero verificamos si existen ciertos campos en los detalles
        var objsTotal = detalleDTE.length;
        var DescuentoCol = false, CodigoCol = false, UMedidaCol = false;
        for (var i = 0; i < objsTotal; i++) {
            var a = detalleDTE[(i)]

            if (a.hasOwnProperty('CdgItem')) {
                CodigoCol = true;

                if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 43) {
                    var codigoTitle = "<span>TIPO DE DOCUMENTO</span>";
                } else {
                    var codigoTitle = "<span>CÓDIGO</span>";
                }
            }

            if (a.hasOwnProperty('UnmdItem')) {
                UMedidaCol = true
            }

            if (a.hasOwnProperty('DescuentoMonto')) {
                DescuentoCol = true;
            }

            if (a.hasOwnProperty('IndExe')) {
                if (parseInt(detalleDTE[(i)].IndExe[0]) == 1) {
                    var IndExe = 1;
                }
            }
        }

        detalleDTE.forEach(function (x) {

            if (x.hasOwnProperty('DscItem')) {
                var DscItemX = x.DscItem;
            } else {
                var DscItemX = "";
            }

            if (x.hasOwnProperty('DescuentoMonto')) {
                var DescuentoMontoX = x.DescuentoMonto;
            } else {
                var DescuentoMontoX = 0;
            }

            if (x.hasOwnProperty('UnmdItem')) {
                var UnmdItemX = x.UnmdItem;
            } else {
                var UnmdItemX = "";
            }

            if (x.hasOwnProperty('PrcItem')) {
                var PrcItemX = Number(x.PrcItem);
            } else {
                var PrcItemX = 0;
            }

            if(CodigoCol) {
                if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 43) {
                    var codigoVal = "Documento " + x.CdgItem[0].VlrCodigo;
                } else {
                    if (x.hasOwnProperty('CdgItem')) {
                        var codigoVal = x.CdgItem[0].VlrCodigo;
                    } else {
                        var codigoVal = "";
                    }
                }
            }

            tablaDetalle += "   <tr style=\'page-break-inside:avoid;\'>";

            if (CodigoCol) {
                tablaDetalle += " <td width='9%' style='word-break:break-all; border-right: 1px solid #000; padding: 0 0 0 3px;'>";
                tablaDetalle += "   <span>" + codigoVal + "</span></td>";
            }
            tablaDetalle += "       <td width='45%' style='border-right: 1px solid #000; text-align:justify; line-height:11px;'>";
            tablaDetalle += "           <span>" + x.NmbItem + "<br>" + DscItemX + "</span> </td>";
            tablaDetalle += "       <td width='4%' style='text-align:center; border-right: 1px solid #000;'> <span> " + parseInt(x.QtyItem) + " </span></td>";

            if (UMedidaCol) {
                tablaDetalle += " <td width='4%' style='text-align:center; border-right: 1px solid #000;'><span> " + UnmdItemX + "</span></td>";
            }

            if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 110 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 111 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 112) {
                tablaDetalle += " <td width='8%' style='text-align:right; border-right: 1px solid #000;'> <span> " + (PrcItemX).toCurrency(helpers.GetFormatMext((DocumentoNode.Encabezado[0].Totales[0].TpoMoneda).toString()), 0) + " </span> </td>";
            } else {
                tablaDetalle += " <td width='8%' style='text-align:right; border-right: 1px solid #000;'> <span> " + numeral(PrcItemX).format("$0,0[.]00") + " </span> </td>";
            }

            if ((DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 34 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 110) && IndExe == 1) {
                if (parseInt(x.IndExe) == 1) {
                    tablaDetalle += "<td width='5%' style='border-right: 1px solid #000; text-align:center;'><span>EX</span></td>";
                } else {
                    tablaDetalle += "<td width='5%' style='border-right: 1px solid #000; text-align:center;'><span>AF</span></td>";
                }
            }

            if (DescuentoCol) {
                tablaDetalle += " <td width='5%' style='border-right: 1px solid #000;'><span>" + DescuentoMontoX + "</span></td>";
            }

            if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 110 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 111 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 112) {
                tablaDetalle += " <td width='10%' style='text-align:right;'><span>" + (Number(x.MontoItem)).toCurrency(helpers.GetFormatMext((DocumentoNode.Encabezado[0].Totales[0].TpoMoneda).toString()), 0) + "</span></td>"; //aplicar acá toCurrency
            } else {
                tablaDetalle += " <td width='10%' style='text-align:right;'><span>" + numeral(x.MontoItem).format("$0,0") + "</span></td>";
            }
            tablaDetalle += "";
            tablaDetalle += "   </tr>";
        });

        //verificamos si existen otros tags aka nodos
        var ImptoRetenReg = false, IndTraslado = false;
        var nodoTotal = DocumentoNode.Encabezado[0].Totales[0],
            nodoEncabezado = DocumentoNode.Encabezado[0].IdDoc[0],
            nodoEmisor = DocumentoNode.Encabezado[0].Emisor[0];

        if (nodoEmisor.hasOwnProperty('Telefono')) {
            var TelefonoVal = "<div class='txt-fact'>FONO: " + nodoEmisor.Telefono + " </div>";
        } else {
            var TelefonoVal = "";
        }

        if (nodoEmisor.hasOwnProperty('Url')) {
            var UrlVal = "<div class='txt-fact'> " + nodoEmisor.Url + " </div>";
        } else {
            var UrlVal = "";
        }

        if (nodoTotal.hasOwnProperty('ImptoReten')) {
            ImptoRetenReg = true;
            var totalImptoRetenReg = nodoTotal.ImptoReten.length;
            var valorImptoReten = 0;
            for (var i = 0; i < totalImptoRetenReg; i++) {
                valorImptoReten = valorImptoReten + Number(nodoTotal.ImptoReten[i].MontoImp);
            }
        }

        if (nodoEncabezado.hasOwnProperty('IndTraslado')) {
            IndTraslado = true;
        }

        if (DocumentoNode.hasOwnProperty('DscRcgGlobal')) {
            if (DocumentoNode.DscRcgGlobal[0].TpoMov == "D") { //Descuento
                var DescRecargo = true;
                if (DocumentoNode.DscRcgGlobal[0].TpoValor == "%") { //Porcentaje
                    var DescPorc = (DocumentoNode.DscRcgGlobal[0].ValorDR) ? numeral(Number(DocumentoNode.DscRcgGlobal[0].ValorDR)).format("0.[00]") : 0;

                    if ((DocumentoNode.Encabezado[0].Totales[0].MntNeto) > 0) {
                        if (IndExe != 1) {
                            var totItem = 0;
                            detalleDTE.forEach(function (y) {
                                tot += Number(y.MontoItem);
                            });
                            var DescTotal = (totItem * Number(DocumentoNode.DscRcgGlobal[0].ValorDR)) / (helpers.shortToLongNumber("100K") - Number(DocumentoNode.DscRcgGlobal[0].ValorDR));
                        }
                    } else {
                        var DescTotal = 0;
                    }

                } else { //si es $
                    var DescTotal = (DocumentoNode.DscRcgGlobal[0].ValorDR) ? numeral(Number(DocumentoNode.DscRcgGlobal[0].ValorDR)).format("$0,0") : 0;

                    if ((DocumentoNode.Encabezado[0].Totales[0].MntNeto) > 0) {
                        if (IndExe != 1) {
                            var totItem = 0;
                            detalleDTE.forEach(function (y) {
                                tot += Number(y.MontoItem);
                            });
                            var DescPorc = (Number(DocumentoNode.DscRcgGlobal[0].ValorDR) / totItem) * 100;
                        }
                    } else {
                        var DescPorc = 0;
                    }
                }

            } else if (DocumentoNode.DscRcgGlobal[0].TpoMov == "R") { //Recargo
                var DescRecargo = false;

                if (DocumentoNode.DscRcgGlobal[0].TpoValor == "%") { //Porcentaje
                    var DescPorc = (DocumentoNode.DscRcgGlobal[0].ValorDR) ? numeral(Number(DocumentoNode.DscRcgGlobal[0].ValorDR)).format("0.[00]") : 0;

                    if ((DocumentoNode.Encabezado[0].Totales[0].MntNeto) > 0) {
                        if (IndExe == 0) {
                            var totItem = 0;
                            detalleDTE.forEach(function (y) {
                                tot += Number(y.MontoItem);
                            });
                            var DescTotal = (totItem * Number(DocumentoNode.DscRcgGlobal[0].ValorDR)) / (helpers.shortToLongNumber("100K") - Number(DocumentoNode.DscRcgGlobal[0].ValorDR));
                        }
                    } else {
                        var DescTotal = 0;
                    }

                } else { //si es $
                    var DescTotal = (DocumentoNode.DscRcgGlobal[0].ValorDR) ? numeral(Number(DocumentoNode.DscRcgGlobal[0].ValorDR)).format("$0,0") : 0;
                    var DescPorc = 0;
                }
            }

        } else {
            var DescPorc = 0;
            var DescTotal = 0;
        }

        //Timbre
        var builder = new xml2js.Builder({ headless: true, rootName: "TED" });
        var timbre = builder.buildObject(DocumentoNode.TED[0]);
        let canvas = new Canvas.createCanvas();
        PDF417.draw(timbre, canvas);

        //estructura pdf:
        html = "<style>.pdf-page{color:#333;position:relative;margin:0;padding:20px 60px 0;font-family:Arial,sans-serif;overflow:hidden;zoom:55%}.nopadding{padding:0;margin:0}.padd-left-xs{float:left;width:100%;padding-left:10px !important}.padd-bottom-xs{float:left;width:100%;padding-bottom:10px !important}.padd-bottom-xxs{padding-bottom:5px !important;float:left;width:100%}.padd-top-xxs{padding-top:6px !important;float:left;width:100%}.pull-right{float:right !important}.col-md-10,.col-md-2,.col-md-3,.col-md-4,.col-md-5,.col-md-6,.col-md-7,.col-md-9{position:relative;min-height:1px;float:left}.col-md-2{width:16.66666667%}.col-md-4{width:33.33333333%}.col-md-5{width:41.66666667%}.col-md-6{width:50%}.col-md-7{width:58.33333333%}.rsocial{font-size:11pt;color:#000;font-weight:bold;text-transform:uppercase}.txt-fact{font-size:9pt;color:#000;font-weight:300;margin-bottom:2px;text-transform:uppercase}.txt-fact span{font-size:11px;color:#000}.cuadrado-rojo{border:3px solid red;margin-top:-2px;color:#f00;text-align:center;padding:6px 20px;}.cuadrado-rojo .normal{font-size:10pt;font-weight:700}.cuadrado-rojo .normal span{font-size:10pt;font-weight:700}.cuadrado-rojo .fuerte{font-size:11pt;font-weight:700}.label-fact-terc{font-size:11px;color:#000;margin-bottom:2px;font-weight:bold;min-width:110px;}.txt-fact-terc{font-size:11px;color:#000;font-weight:300;margin-bottom:2px}.txt-fact-sm{font-size:9px;font-weight:600}.factDoc{border-bottom:1px solid #000;border-collapse:collapse}.factDoc tr:first-child td{border:none;font-size:10px}.factDoc td:first-child{border-left:0px}.factDoc td{padding:2px 5px;border-bottom:1px solid #000}.factDoc tr:not(:first-child){font-size:10px}.tablaRefer td{border-left:1px solid #000;border-right:1px solid #000}.factDocBajada{border-bottom:1px solid #000;border-left:1px solid #000;border-right:1px solid #000;border-collapse:collapse;font-size:10px}.factDocBajada tr{border-bottom:1px solid #000}.factDocBajada td, .factDocBajada th{border:none;padding:5px 5px;font-weight:400}.factDocBajada td span{border:none;padding:5px 5px 5px 10px;font-weight:600}.factDocBajada .totales{font-size:15px;padding:5px 5px 5px 10px;font-weight:600;font-size:15px}.underliner{border-bottom:1px solid black;margin-right:10px;width:330px;float:right;height:9px}.tituloAcuse{font-size:11px;padding:5px 0 5px 10px;border:1px solid #000;border-bottom:none;width:97%}.factRec{border:1px solid #000;font-size:10px;font-weight:400}.factRec tr{border:none}.factRec td{padding:4px 5px 4px 10px}.factAcuseContainer{position:relative;width:100%;padding-left:5px}@page{@bottom-left{content:counter(page) '/' counter(pages)}}</style>";
        html += "<div id='page-container_" + DocumentoNode.$.ID + "' class='page-container hidden-on-narrow'>";
        html += "    <div id='main-dte' class='pdf-page size-letter' style='min-height:12in;'>";

        //  -------- CABECERA --------
        html += "        <div class='nopadding' style='float:left; width:90px; border-right:1px solid #000;'>";
        html += "           <img src='https://cdn.gael.cloud/logos/logo-sample.png' style='height: 80px; width: 80px;'/>";
        html += "        </div>";
        html += "        <div class='col-md-5 nopadding'>";
        html += "            <div class='padd-left-xs align-top'>";
        html += "                <div class='rsocial'>" + DocumentoNode.Encabezado[0].Emisor[0].RznSoc + "</div>";
        html += "                <div class='txt-fact' style='font-weight: bold;'>" + DocumentoNode.Encabezado[0].Emisor[0].GiroEmis + "</div>";
        html += "                <div class='txt-fact'>" + DocumentoNode.Encabezado[0].Emisor[0].DirOrigen + "</div>";
        html += "                <div class='txt-fact'><span> " + DocumentoNode.Encabezado[0].Emisor[0].CmnaOrigen + "</span>, <span>" + DocumentoNode.Encabezado[0].Emisor[0].CiudadOrigen + " </span></div>";
        html += TelefonoVal;
        html += UrlVal;
        html += "            </div>";
        html += "        </div>";
        html += "        <div class='col-md-4 nopadding pull-right'>";
        html += "            <div class='cuadrado-rojo'>";
        html += "                <div style='width: 100%; line-height: 24px;'>";
        html += "                    <div class='fuerte'>RUT: <span>" + DocumentoNode.Encabezado[0].Emisor[0].RUTEmisor + "</span></div>";
        html += "                    <div class='fuerte'> " + helpers.GetNombreDTE(parseInt(DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE)) + "</div>";
        html += "                    <div class='fuerte'>N° <span>" + DocumentoNode.Encabezado[0].IdDoc[0].Folio + "</span></div>";
        html += "                </div>";
        html += "            </div>";
        html += "            <div align='center'><b style='color:#f00;'>S.I.I</b></div>";
        html += "        </div>";
        html += "";
        html += "        <div class='clearfix padd-bottom-xs'></div>";
        html += "";
        html += tablaInfo;
        html += "";
        html += "        <div class='clearfix padd-bottom-xxs'></div>";
        html += "";
        html += tablaDTERef;
        html += "";
        html += "        <div class='clearfix padd-bottom-xxs'></div>";
        html += "";
        html += tablaSucursal;
        html += "";
        html += "        <div class='clearfix padd-bottom-xxs'></div>";

        //  -------- DETALLES --------
        html += "        <div style='font-size:10px; width:100%; margin:6px 0 4px; display:inline-block;'><b>DETALLE</b></div>";
        html += "        <div id='descrip' style='border: 1px solid #000; min-height:460px;'>";
        html += "            <table width='100%' class='factDoc'>";
        html += "                <tbody>";
        html += "                    <tr style='background-color: #5f5f5f; color: #fff; font-weight: 400; text-align:center;'>";

        if (CodigoCol) {
            html += "                        <td width='9%'> " + codigoTitle + " </td>";
        }
        html += "                        <td width='45%' style='text-align:left;'><span>DESCRIPCIÓN</span></td>";
        html += "                        <td width='4%'><span>CANT.</span></td>";

        if (UMedidaCol) {
            html += "                       <td width='4%'><span>U.M</span></td>";
        }
        html += "                       <td width='8%'><span>PRECIO UNIT.</span></td>";
        if ((DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 34 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 110) && IndExe === 1) {
            html += "                       <td width='5%'><span>IND</span></td>";
        }

        if (DescuentoCol) {
            html += "                        <td width='5%'><span>DSCTO</span></td>";
        }
        html += "                        <td width='10%'><span>VALOR</span></td>";
        html += "                    </tr>";

        html += tablaDetalle;

        html += "                </tbody>";
        html += "            </table>";
        html += "        </div>";
        html += "";

        //  -------- TOTALES --------
        html += "        <table width='42%' class='pull-right factDocBajada' border='1' style=\'page-break-inside:avoid;\'>";
        html += "            <tbody>";
        html += "                <tr style='background-color: #5f5f5f; color: #fff;'>";
        switch (parseInt(DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE)) {
            case 110:
            case 111:
            case 112:
                html += "                    <th width='40%'>TOTALES</th>";
                html += "                    <th width='30%'>Moneda Local</th>";
                html += "                    <th wodth='30%'>Moneda Extranjera</th>";
                break;

            default:
                html += "                    <th colspan='2'>TOTALES</th>";
                break;
        }
        html += "                </tr>";
        if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 43 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 110 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 111 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 112) {
            html += "                <tr>";

            if (DescRecargo) {
                html += "                    <td> <span style='padding: 0;font-weight: inherit;'>Descuento Global</span>(" + DescPorc + "%)</td>";
            } else {
                html += "                    <td> <span style='padding: 0;font-weight: inherit;'>Recargo Global</span>(" + DescPorc + "%)</td>";
            }
            html += "                    <td style='text-align:right;'><span> " + numeral(DescTotal).format("$0,0") + " </span></td>";
            html += "                </tr>";
        }

        if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 34 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 110 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 111 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 112) {
            html += "                <tr>";
            html += "                    <td>Monto Neto</td>";
            html += "                    <td style='text-align:right;'><span> " + numeral(DocumentoNode.Encabezado[0].Totales[0].MntNeto).format("$0,0") + " </span></td>";
            html += "                </tr>";
        }

        if ((DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 34 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 110 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 111 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 112) || IndExe === 1) {
            html += "                <tr>";
            html += "                    <td>Monto Exento</td>";
            if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 110 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 111 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 112) {
                html += "                    <td style='text-align:right;'><span> " + numeral(DocumentoNode.Encabezado[0].OtraMoneda[0].MntExeOtrMnda).format("$0,0") + " </span></td>";
                html += "                    <td style='text-align:right;'><span> " + (Number(DocumentoNode.Encabezado[0].Totales[0].MntExe)).toCurrency(helpers.GetFormatMext((DocumentoNode.Encabezado[0].Totales[0].TpoMoneda).toString()), 0) + " </span></td>";
            } else {
                html += "                    <td style='text-align:right;'><span> " + numeral(DocumentoNode.Encabezado[0].Totales[0].MntExe).format("$0,0") + " </span></td>";
            }
            html += "                </tr>";
        }

        if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 34 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 110 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 111 && DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE != 112) {
            html += "                <tr>";
            html += "                    <td>IVA (" + numeral(DocumentoNode.Encabezado[0].Totales[0].TasaIVA).format("0,0") + "%)</td>";
            html += "                    <td style='text-align:right;'><span> " + numeral(DocumentoNode.Encabezado[0].Totales[0].IVA).format("$0,0") + " </span></td>";
            html += "                </tr>";
        }

        if (ImptoRetenReg) {
            html += "                <tr>";
            html += "                    <td>Impuesto Adicional</td>";
            html += "                    <td style='text-align:right;'><span> " + numeral(valorImptoReten).format("$0,0") + " </span></td>";
            html += "                </tr>";
        }

        html += "                <tr class='totales'>";
        html += "                    <td><b>Monto Total</b></td>";

        if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 110 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 111 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 112) {
            html += "                    <td style='text-align:right;'><span><b> " + numeral(DocumentoNode.Encabezado[0].OtraMoneda[0].MntTotOtrMnda).format("$0,0") + "</b></span></td>";
            html += "                    <td style='text-align:right;'><span><b> " + (Number(DocumentoNode.Encabezado[0].Totales[0].MntTotal)).toCurrency(helpers.GetFormatMext((DocumentoNode.Encabezado[0].Totales[0].TpoMoneda).toString()), 0) + " </b></span></td>";
        } else {
            html += "                    <td style='text-align:right;'><span><b> " + numeral(DocumentoNode.Encabezado[0].Totales[0].MntTotal).format("$0,0") + "</b></span></td>";
        }
        html += "                </tr>";
        html += "                <tr>";

        if (DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 110 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 111 || DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE == 112) {
            html += "                    <td colspan='3' style='text-align:right;'> " + n2words(Number(DocumentoNode.Encabezado[0].OtraMoneda[0].MntTotOtrMnda), { lang: 'es' }) + "</td>";
        } else {
            html += "                    <td colspan='2' style='text-align:right;'> " + n2words(Number(DocumentoNode.Encabezado[0].Totales[0].MntTotal), { lang: 'es' }) + "</td>";
        }
        html += "                </tr>";
        html += "            </tbody>";
        html += "        </table>";
        html += "";
        html += "        <div id='cedible-acuserecibo' style='display:none; padding-top: 12px; width: 56.5%; min-height: 200px; page-break-inside:avoid;' class='pull-left'>";
        html += "            <div class='tituloAcuse'><b>ACUSE RECIBO</b></div>";
        html += "            <table width='100%' class='factRec'>";
        html += "                <tbody>";
        html += "                    <tr>";
        html += "                        <td>Nombre:</td>";
        html += "                        <td colspan='2' class='underliner'></td>";
        html += "                    </tr>";
        html += "                    <tr>";
        html += "                        <td>R.U.T.:</td>";
        html += "                        <td colspan='2' class='underliner'></td>";
        html += "                    </tr>";
        html += "                    <tr>";
        html += "                        <td>Fecha:</td>";
        html += "                        <td colspan='2' class='underliner'></td>";
        html += "                    </tr>";
        html += "                    <tr>";
        html += "                        <td>Recinto:</td>";
        html += "                        <td colspan='2' class='underliner'></td>";
        html += "                    </tr>";
        html += "                    <tr>";
        html += "                        <td>Firma:</td>";
        html += "                        <td colspan='2' class='underliner' style='margin-bottom: 6px;'></td>";
        html += "                    </tr>";
        html += "                </tbody>";
        html += "            </table>";
        html += "            <div class='clearfix padd-bottom-xxs'></div>";
        html += "            <div style='padding:0;' class='txt-fact-sm factAcuseContainer'>";
        html += "                <span>El acuse de recibo se declara en este acto, de acuerdo a lo dispuesto en la letra b) del Art. 4o,y";
        html += "                    la letra c) del Art. 5o de la Ley 19.983, acredita que la entrega de mercaderías o servicio(s)";
        html += "                    prestado(s) ha(n) sido recibido(s)</span>";
        html += "            </div>";
        html += "        </div>";
        html += "";
        html += "";
        html += "        <div style='padding-top: 5px; width:58%; page-break-inside:avoid;' class='pull-right timbre-container' id='timbrePre' align='center'>";
        html += "            <img src=" + canvas.toDataURL() + " />";
        html += "            <div class='txt-fact-sm' style='margin-top: 2px;'>";
        html += "                Timbre Electrónico S.I.I.<br>";
        html += "                Res. 42 del 2013 - Verifique documento: www.sii.cl";
        html += "            </div>";
        if (IndTraslado) {
            if (DocumentoNode.Encabezado[0].IdDoc[0].IndTraslado == 1) {
                html += "                   <b style='display:none; color: #f90000; font-size: 16px;' id='cedible-text'>CEDIBLE CON SU FACTURA</b>";
            }
        } else {
            html += "            <b style='display:none; color: #f90000; font-size: 16px;' id='cedible-text'>CEDIBLE</b>";
        }
        html += "        </div>";
        html += "    </div>";
        html += "</div>";

        //create pdf file!
        pdf.create(html, options).toFile(__dirname + "/" + helpers.GetNombreDTE(parseInt(DocumentoNode.Encabezado[0].IdDoc[0].TipoDTE)) + " N°" +  DocumentoNode.Encabezado[0].IdDoc[0].Folio + ".pdf", function (err, res) {
            if (err) return console.log(err);
        });
    });
});
