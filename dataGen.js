import { Elysia } from "elysia";
import { Mongoose } from "mongoose";
import { ForvaringsKlass, Lager, Hylla, Produkter, Anstald, Veckoschema, Order, LagerEnVara } from "./class.js";

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = "mongodb+srv://theo:LoJgJnbY6jGWiYMF@logisttiksystem.lkfv2di.mongodb.net/?retryWrites=true&w=majority";
//LoJgJnbY6jGWiYMF Lösenord

async function getText(path) {
    const file = Bun.file(path);
    const text = await file.text();
    let namnArray = text.split("\n");
    return namnArray;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//gen data
//-------------------------------------

function genOrder(satus, orderNummer, forvaringsKlass, index, i) {
    // för den nuvarande dagen
    //per timme

    let hurManga;
    if (forvaringsKlass.andstaldaArray[forvaringsKlass.lagerArray[index].anstaldaILagert[i]].job === "chaufför") {
        hurManga = getRndInteger(3, 5);
    } else {
        hurManga = getRndInteger(1, 4);
    }

    for (let k = 0; k < hurManga; k++) {
        let order = new Order();
        order.orderN = orderNummer;
        orderNummer++;

        order.tid = getRndInteger(forvaringsKlass.andstaldaArray[i].arSchema[50].startT[0], forvaringsKlass.andstaldaArray[i].arSchema[50].stopT[0] + 1);
        order.dag = 0;
        order.vecka = 50;

        order.datum = new Date(2023, 11, getRndInteger(9, 13), getRandomInt(24), 0, 0);

        order.satus = satus;
        order.andstalda = forvaringsKlass.lagerArray[index].anstaldaILagert[i];
        forvaringsKlass.andstaldaArray[forvaringsKlass.lagerArray[index].anstaldaILagert[i]].orders = orderNummer;

        forvaringsKlass.orderArray.push(order);

        // randomis prudukter (kolla nså att inte samma fins flera gånger) ()
        // ramdomis anstälda;

        let produktM = getRndInteger(1, 10);
        for (let o = 0; o < produktM; o++) {
            let arSamma = true;
            let produktId;

            while (arSamma === true) {
                produktId = getRandomInt(forvaringsKlass.lagerArray[index].antalP);

                arSamma = false;
                order.produkter.forEach((element) => {
                    if (produktId === element) {
                        arSamma = true;
                    }
                });
            }
            order.produkter.push(produktId);
            order.mangde.push(getRndInteger(1, 100));
        }
    }
}

async function GenData(antalLager) {
    let forvaringsKlass = new ForvaringsKlass();

    let forstaNamn = await getText("./textfiles/first-names.txt");
    let efterNamn = await getText("./textfiles/last-names.txt");

    let mjuktTar = await getText("./textfiles/SoftWoods.txt");
    let hartTar = await getText("./textfiles/hardwood.txt");
    let varjation = await getText("./textfiles/Varjation.txt");

    let produktRakning = 0;
    let produktVarjation = 0;
    let boolHardEllerMjuk = true;

    for (let i = 0; i < mjuktTar.length * 4 + hartTar.length * 4 - 1; i++) {
        let produkte = new Produkter();

        if (boolHardEllerMjuk === true) {
            produkte.namn = hartTar[produktRakning] + " " + varjation[produktVarjation];
            produkte.pris = getRandomInt(5000) + 0.99;
            produkte.vikt = getRandomInt(20);
        } else {
            produkte.namn = mjuktTar[produktRakning] + " " + varjation[produktVarjation];
            produkte.pris = getRandomInt(5000) + 0.99;
            produkte.vikt = getRandomInt(20);
        }

        //logik för att se till att vi inte får dubleter
        if (produktVarjation < 3) {
            setInterval;
            produktVarjation++;
        } else {
            produktVarjation = 0;
            produktRakning++;
        }

        if (boolHardEllerMjuk === true) {
            if (produktRakning >= 267) {
                boolHardEllerMjuk = false;
                produktRakning = 0;
            }
        } else {
            if (produktRakning >= 68) {
                console.log("error - gick över gränsen på prudkter \n");
            }
        }
        forvaringsKlass.produkterArray.push(produkte);
    }

    //läger in pruduckter i lageret
    for (let index = 0; index < antalLager; index++) {
        forvaringsKlass.lagerArray[index] = new Lager();
        forvaringsKlass.lagerArray[index].lagerNamn = "Lager" + index;

        forvaringsKlass.lagerArray[index].raderHyllor = getRndInteger(100, 250);

        let nuvarandePruduktId = 0;
        for (let i = 0; i < forvaringsKlass.lagerArray[index].raderHyllor; i++) {
            forvaringsKlass.lagerArray[index].hylla[i] = new Hylla();
            forvaringsKlass.lagerArray[index].hylla[i].antalPlatser = getRndInteger(1, 5);

            for (let k = 0; k < forvaringsKlass.lagerArray[index].hylla[i].antalPlatser; k++) {
                forvaringsKlass.lagerArray[index].hylla[i].plats.push(nuvarandePruduktId);
                forvaringsKlass.lagerArray[index].hylla[i].saldo.push(getRandomInt(60));
                nuvarandePruduktId++;
            }
        }
        forvaringsKlass.lagerArray[index].antalP = nuvarandePruduktId;

        //randommis
        let antalAnstalda = getRndInteger(5, 25);

        // räkna ut hur många som kör vs plockar
        for (let i = 0; i < antalAnstalda; i++) {
            let tempHald = new Anstald();
            tempHald.namn = forstaNamn[getRandomInt(forstaNamn.length - 1)].trim() + " " + efterNamn[getRandomInt(efterNamn.length - 1)].trim().toLowerCase();
            //vilket job

            if (i / antalAnstalda > 0.7) {
                tempHald.job = "chaufför";
            } else {
                tempHald.job = "plockare";
            }

            for (let k = 0; k < 52; k++) {
                let tempVeckoschema = new Veckoschema();
                for (let l = 0; l < 5; l++) {
                    tempVeckoschema.startT[l] = getRndInteger(5, 16);
                    tempVeckoschema.stopT[l] = tempVeckoschema.startT[l] + getRndInteger(4, 8);
                }
                tempHald.arSchema[k] = tempVeckoschema;
            }
            //tryck till förvaring
            forvaringsKlass.andstaldaArray.push(tempHald);
            forvaringsKlass.lagerArray[index].anstaldaILagert[i] = forvaringsKlass.andstaldaArray.length - 1;
        }
    }

    //skapar personer som arbetar på flera lager
    for (let index = 0; index < antalLager; index++) {
        let randomLager = getRandomInt(antalLager);
        if (randomLager === index) {
            continue;
        } else {
            let mangdeDelade = getRndInteger(0, forvaringsKlass.lagerArray[randomLager].anstaldaILagert.length - 3);
            for (let i = 0; i < mangdeDelade; i++) {
                let randomId = getRandomInt(forvaringsKlass.lagerArray[randomLager].anstaldaILagert.length - 1);
                if (randomId === index) {
                    continue;
                } else {
                    forvaringsKlass.lagerArray[index].anstaldaILagert.push(forvaringsKlass.lagerArray[randomLager].anstaldaILagert[randomId]);
                }
            }
        }
    }

    //------------------------------------------------------
    // skapa orders
    //------------------------------------------------------
    let orderNummer = 0;
    //vecka | dag i veckan | tid
    let tid = "50";

    //för nuvarande dag vecka 50 dag 0 / måndag

    for (let index = 0; index < forvaringsKlass.lagerArray.length; index++) {
        for (let i = 0; i < forvaringsKlass.lagerArray[index].anstaldaILagert.length; i++) {
            let ingetAG = getRndInteger(0, 20);
            if (ingetAG != 1) {
                if (forvaringsKlass.andstaldaArray[forvaringsKlass.lagerArray[index].anstaldaILagert[i]].job === "chaufför") {
                    genOrder("Körs ut", orderNummer, forvaringsKlass, index, i);
                } else {
                    genOrder("Plockas", orderNummer, forvaringsKlass, index, i);
                }
            }
        }
    }

    for (let index = 0; index < forvaringsKlass.lagerArray.length; index++) {
        for (let v = 0; v < 50; v++) {
            for (let d = 0; d < 5; d++) {
                for (let i = 0; i < forvaringsKlass.lagerArray[index].anstaldaILagert.length; i++) {
                    let ingetAG = getRndInteger(0, 20);
                    if (ingetAG != 1) {
                        // för den nuvarande dagen
                        //per timme

                        if (forvaringsKlass.andstaldaArray[forvaringsKlass.lagerArray[index].anstaldaILagert[i]].job === "chaufför") {
                            let hurManga = getRndInteger(3, 5);

                            for (let k = 0; k < hurManga; k++) {
                                let order = new Order();
                                order.orderN = orderNummer;
                                orderNummer++;
                                order.tid = getRndInteger(forvaringsKlass.andstaldaArray[i].arSchema[v].startT[d], forvaringsKlass.andstaldaArray[i].arSchema[v].stopT[d] + 1);
                                order.dag = d;
                                order.vecka = v;

                                let dagSpara;
                                switch (v / 4 - Math.floor(v / 4)) {
                                    case 0:
                                        dagSpara = 0;
                                        break;
                                    case 0.25:
                                        dagSpara = 7;
                                        break;
                                    case 0.5:
                                        dagSpara = 14;
                                        break;
                                    case 0.75:
                                        dagSpara = 21;
                                        break;
                                }

                                order.datum = new Date(2023, Math.floor(v / 4) - 2, dagSpara + d, getRandomInt(24), 0, 0);

                                order.satus = "Ut körd";
                                order.andstalda = forvaringsKlass.lagerArray[index].anstaldaILagert[i];
                                forvaringsKlass.orderArray.push(order);

                                // randomis prudukter (kolla nså att inte samma fins flera gånger) ()
                                // ramdomis anstälda;

                                let produktM = getRndInteger(1, 10);
                                for (let o = 0; o < produktM; o++) {
                                    let arSamma = true;
                                    let produktId;

                                    while (arSamma === true) {
                                        produktId = getRandomInt(forvaringsKlass.lagerArray[index].antalP);

                                        arSamma = false;
                                        order.produkter.forEach((element) => {
                                            if (produktId === element) {
                                                arSamma = true;
                                            }
                                        });
                                    }
                                    order.produkter.push(produktId);
                                    order.mangde.push(getRndInteger(1, 100));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return forvaringsKlass;
}

function FaArbetere(params, job) {
    //vecka tid
    let nyText = params.tid.split(":");

    nyText[0] = parseInt(nyText[0]);
    nyText[1] = parseInt(nyText[1]);
    nyText[2] = parseInt(nyText[2]);

    //Nummber check
    if (isNaN(nyText[0])) {
        return "inget nummer";
    }
    if (isNaN(nyText[1])) {
        return "inget nummer";
    }
    if (isNaN(nyText[2])) {
        return "inget nummer";
    }

    //day check
    if (nyText[0] > 52 || nyText[0] < 0) {
        return "inget datum --- vecka:dag sen start av veckan:tid";
    }
    if (nyText[1] > 7 || nyText[1] < 0) {
        return "inget datum --- vecka:dag sen start av veckan:tid";
    }
    if (nyText[2] > 24 || nyText[2] < 0) {
        return "inget datum --- vecka:dag sen start av veckan:tid";
    }

    let tillbackArray = [];

    for (let i = 0; i < forvaringsKlass.andstaldaArray.length; i++) {
        if (forvaringsKlass.andstaldaArray[i].job != job) {
            continue;
        }
        if (forvaringsKlass.andstaldaArray[i].arSchema[nyText[0]].startT[nyText[1]] <= nyText[2] && forvaringsKlass.andstaldaArray[i].arSchema[nyText[0]].stopT[nyText[1]] >= nyText[2]) {
            tillbackArray.push(forvaringsKlass.andstaldaArray[i]);
        }
    }

    if (tillbackArray.length === 0) {
        return "Ingen hitades";
    }
    return tillbackArray;
}

//mongoose
//-------------------------------------

const mongoose = require("mongoose");

async function main() {
    await mongoose.connect(uri);
    console.log("connected to mongoose");
}
let forvaringsKlass = await GenData(100);
main().catch((err) => console.log(err));
