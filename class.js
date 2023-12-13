export class ForvaringsKlass {
    constructor() {
        this.lagerArray = [];
        this.produkterArray = [];
        this.andstaldaArray = [];
        this.orderArray = [];
    }
}

export class Lager {
    lagerNamn;
    raderHyllor;
    antalP;

    constructor() {
        this.hylla = [];
        //lägg till anstälda här från en stor lista
        this.anstaldaILagert = [];
    }
}

export class Hylla {
    antalPlatser;
    constructor() {
        this.plats = [];
        this.saldo = [];
    }
}

export class Produkter {
    namn;
    pris;
    vikt;
    constructor() {}
}

export class Anstald {
    namn;
    job;
    constructor() {
        //En array med Veckoscheman en för varje dag på året
        this.arSchema = [];
        this.orders = [];
    }
}

export class Veckoschema {
    constructor() {
        //array med 7 platser en för varje dag
        this.startT = [];
        this.stopT = [];
    }
}

//---------------------------------------
// Orders
//---------------------------------------

export class Order {
    orderN;
    satus;
    vecka;
    dag;
    tid;
    datum;
    constructor() {
        //lista på anstälda som jobbar på ordern
        this.andstalda = [];
        //produkter i ett lager
        this.produkter = [];
        this.mangde = [];
    }
}

//---------------------------------------
// tillbacka klasser
//---------------------------------------

export class LagerEnVara {
    produkte;
    saldo;
    lager;
    hylla;
    plats;
    constructor() {}
}
