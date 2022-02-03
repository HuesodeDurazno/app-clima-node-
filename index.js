require("dotenv").config();

const {
    inquirerMenu,
    pausa,
    leerInput,
    listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
    const busquedas = new Busquedas();
    let op = "";

    do {
        op = await inquirerMenu();
        switch (op) {
            case 1:
                const termino = await leerInput("Ciudad: ");
                const lugares = await busquedas.ciudad(termino);
                const id = await listarLugares(lugares);
                const lugarSel = lugares.find((lugar) => lugar.id === id);

                if(id === '0') continue;
                busquedas.agregarHistorial(lugarSel.nombre);

                const clima = await busquedas.climaLugar(
                    lugarSel.lat,
                    lugarSel.lng
                );
                console.clear();
                console.log("\n Informacion de la ciudad \n".green);
                console.log("Ciudad: ", lugarSel.nombre);
                console.log("Lat: ", lugarSel.lat);
                console.log("Lng: ", lugarSel.lng);
                console.log("Temperatura: ", clima.temp);
                console.log("Minima: ", clima.max);
                console.log("Maxima: ", clima.min);
                console.log("Como esta el clima: ", clima.desc);

                break;
            case 2:
                busquedas.historialCapitalizado.forEach((lugar,i) => {
                    const idx = `${i+1}.`.green
                    console.log(`${idx} ${lugar}`)
                })
                break;
        }
        if (op !== 0) await pausa();
    } while (op !== 0);
};

main();
