import { Elysia } from "elysia";
import { Mongoose } from "mongoose";
import { ForvaringsKlass, Lager, Hylla, Produkter, Anstald, Veckoschema, Order, LagerEnVara } from "./class.js";

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

//gen data
//-------------------------------------

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
//-------------------------------------
let forvaringsKlass = await GenData(100);

const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .get("/arbetare", () => {
        let tillbackArray = [];
        forvaringsKlass.andstaldaArray.forEach((element) => {
            tillbackArray.push(element.namn);
        });
        return tillbackArray;
    })
    .get("/arbetare/person-detaljer/:namn", ({ params }) => {
        let nyText = params.namn.replace("-", " ");

        for (let i = 0; i < forvaringsKlass.andstaldaArray.length; i++) {
            if (forvaringsKlass.andstaldaArray[i].namn === nyText) {
                return forvaringsKlass.andstaldaArray[i];
            }
        }
        return "Hittade inte hen";
    })
    .get("/arbetare/jobbar/chaufforer/:tid", ({ params }) => {
        return FaArbetere(params, "chaufför");
    })
    .get("/arbetare/jobbar/plockare/:tid", ({ params }) => {
        return FaArbetere(params, "plockare");
    })
    .get("/lager/ettlager/:sifra", ({ params }) => {
        params.sifra = parseInt(params.sifra);
        if (isNaN(params.sifra)) {
            return "inte ett sifra";
        }
        if (params.sifra < 0 || params.sifra > forvaringsKlass.lagerArray.length - 1) {
            return "inte ett lager";
        }
        return forvaringsKlass.lagerArray[params.sifra].hylla;
    })
    //Fixa
    .get("/lager/envara/:id", ({ params }) => {
        //kolla omm det är ett nummer
        params.id = parseInt(params.id);
        if (isNaN(params.id)) {
            return "inte ett nummer";
        }

        if (params.id > forvaringsKlass.produkterArray.length - 1) {
            return "Den fins inte";
        }

        let tillbackArray = [];

        for (let i = 0; i < forvaringsKlass.lagerArray.length; i++) {
            for (let k = 0; k < forvaringsKlass.lagerArray[i].hylla.length; k++) {
                for (let l = 0; l < forvaringsKlass.lagerArray[i].hylla[k].plats.length; l++) {
                    if (forvaringsKlass.lagerArray[i].hylla[k].plats[l] === params.id) {
                        let lagerEnVara = new LagerEnVara();
                        lagerEnVara.produkte = forvaringsKlass.produkterArray[forvaringsKlass.lagerArray[i].hylla[k].plats[l]];
                        lagerEnVara.saldo = forvaringsKlass.lagerArray[i].hylla[k].saldo[l];
                        lagerEnVara.lager = i;
                        lagerEnVara.hylla = k;
                        lagerEnVara.plats = l;

                        tillbackArray.push(lagerEnVara);
                    }
                }
            }
        }

        if (tillbackArray.length === 0) {
            return "Hittade inte den";
        }
        return tillbackArray;
    })
    .get("/hela", () => {
        return forvaringsKlass;
    })
    .get("/plockas", () => {
        let tillbackArray = [];
        for (let i = 0; i < forvaringsKlass.orderArray.length; i++) {
            if (forvaringsKlass.orderArray[i].satus === "Plockas") {
                tillbackArray.push(forvaringsKlass.orderArray[i]);
            }
        }
        return tillbackArray;
    })
    .get("/plockas/alst", () => {
        let sparaArray = [];
        for (let i = 0; i < forvaringsKlass.orderArray.length; i++) {
            if (forvaringsKlass.orderArray[i].satus === "Plockas") {
                sparaArray.push(forvaringsKlass.orderArray[i]);
            }
        }

        let tillback = new Order();
        tillback.datum = new Date(2024, 12, 30);

        sparaArray.forEach((element) => {
            if (element.datum.getTime() < tillback.datum.getTime()) {
                tillback = element;
            }
        });

        return tillback;
    })
    .get("/korut", () => {
        let tillbackArray = [];
        for (let i = 0; i < forvaringsKlass.orderArray.length; i++) {
            if (forvaringsKlass.orderArray[i].satus === "Körs ut") {
                tillbackArray.push(forvaringsKlass.orderArray[i]);
            }
        }
        return tillbackArray;
    })
    .get("/korut/alst", () => {
        let sparaArray = [];
        for (let i = 0; i < forvaringsKlass.orderArray.length; i++) {
            if (forvaringsKlass.orderArray[i].satus === "Körs ut") {
                sparaArray.push(forvaringsKlass.orderArray[i]);
            }
        }

        let tillback = new Order();
        tillback.datum = new Date(2024, 12, 30);

        sparaArray.forEach((element) => {
            if (element.datum.getTime() < tillback.datum.getTime()) {
                tillback = element;
            }
        });

        return tillback;
    })
    .get("/arbetare/ingenOrder", () => {
        let tillbackArray = [];

        let test = 0;
        forvaringsKlass.andstaldaArray.forEach((element) => {
            if (element.orders.length === 0) {
                tillbackArray.push(element);
            }
        });
        return tillbackArray;
    })
    .get("/cost/:month", ({ params }) => {
        params.month = parseInt(params.month);

        //kolla för saker
        if (isNaN(params.month)) {
            return "inget nummer";
        }
        if (params.month < 0 || params.month > 11) {
            return "Måste vara i mellan 0 och 11";
        }

        //hita rätt månad
        let sparaArray = [];

        forvaringsKlass.orderArray.forEach((element) => {
            if (element.datum.getMonth() == params.month) {
                sparaArray.push(element);
            }
        });

        //räkna ihop
        let tillback = 0;

        for (let i = 0; i < sparaArray.length; i++) {
            for (let k = 0; k < sparaArray[i].produkter.length; k++) {
                tillback += forvaringsKlass.produkterArray[sparaArray[i].produkter[k]].pris * sparaArray[i].mangde[k];
            }
        }
        return tillback;
    })
    .get("/dyrast/monad/:monad", ({ params }) => {
        params.monad = parseInt(params.monad);

        //kolla för saker
        if (isNaN(params.monad)) {
            return "inget nummer";
        }
        if (params.monad < 0 || params.monad > 11) {
            return "Måste vara i mellan 0 och 11";
        }

        //hita rätt månad
        let sparaArray = [];

        forvaringsKlass.orderArray.forEach((element) => {
            if (element.datum.getMonth() == params.monad) {
                sparaArray.push(element);
            }
        });

        //räkna
        let nummerArray = [];

        for (let i = 0; i < sparaArray.length; i++) {
            nummerArray.push(0);
            for (let k = 0; k < sparaArray[i].produkter.length; k++) {
                nummerArray[i] += forvaringsKlass.produkterArray[sparaArray[i].produkter[k]].pris * sparaArray[i].mangde[k];
            }
        }

        let totalkostnad = 0;
        let sparaNum = 0;
        for (let i = 0; i < nummerArray.length; i++) {
            if (totalkostnad < nummerArray[i]) {
                totalkostnad = nummerArray[i];
                sparaNum = i;
            }
        }
        sparaArray[sparaNum].totalkostnad = totalkostnad;

        return sparaArray[sparaNum];
    })
    .listen(8080);

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);

// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/test');

//     // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
//   }
