const fs = require("fs");
const axios = require("axios");

class Busquedas {
    historial = [];
    dbPath = "./db/database.json";

    constructor() {
        this.leerDB();
    }

    get historialCapitalizado(){
        return this.historial.map((consulta)=>consulta.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase()))))
    }

    get paramsMapbox() {
        return {
            access_token: process.env.MAPBOX_KEY,
            limit: 5,
            lenguage: "es",
        };
    }

    get paramsWheater() {
        return {
            units: "metric",
            appid: process.env.OPENWEATHER_KEY,
            lang: "es",
        };
    }

    async ciudad(lugar = "") {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/`,
                params: this.paramsMapbox,
            });

            const resp = await instance.get(`${lugar}.json`);

            return resp.data.features.map((lugar) => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async climaLugar(lat, lon) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5`,
                params: { ...this.paramsWheater, lat, lon },
            });

            const resp = await instance.get(`weather`);
            const { weather, main } = resp.data;
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            };
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar = "") {
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial =this.historial.splice(0,5)
        this.historial.unshift(lugar.toLocaleLowerCase());

        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial,
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB() {
        if (!fs.existsSync(this.dbPath)) {
            return null;
        }
        const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
        const data = JSON.parse(info);
        this.historial=data.historial
    }
}

module.exports = Busquedas;
