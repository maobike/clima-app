const fs = require('fs');

const axios = require('axios');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; // Para permitir certificados no validos

// Para hacer la prueba que funcione
const array1 = {
	data : {
		features: [
			{
				id: 'place.5346693421448390',
				type: 'Feature',
				place_type: [Array],
				relevance: 1,
				properties: [Object],
				text_es: 'Madridejos',
				language_es: 'es',
				place_name_es: 'Madridejos, Toledo, España',
				text: 'Madridejos',
				language: 'es',
				place_name: 'Madridejos, Toledo, España',
				bbox: [ -3.611693, 39.299327, -3.41772, 39.594094 ],
				center: [ -3.52972, 39.46583],
				geometry: { type: 'Point', coordinates: [Array] },
				context: [ [Object], [Object] ]
			},
			{
				id: 'place.10299848042562040',
				type: 'Feature',
				place_type: [ 'place' ],
				relevance: 1,
				properties: { wikidata: 'Q2316396' },
				text_es: 'Madrid',
				language_es: 'es',
				place_name_es: 'Madrid, Dundinamarca, Colombia',
				text: 'Madrid',
				language: 'es',
				place_name: 'Madrid, Cundinamarca, Colombia',
				bbox: [ -74.328011, 4.682661, -74.174986, 4.865381 ],
				center: [ -74.26389, 4.73056],
				geometry: { type: 'Point', coordinates: [Array] },
				context: [ [Object], [Object] ]
			},
			{
				id: 'place.000003',
				type: 'Feature',
				place_type: [ 'place' ],
				relevance: 1,
				properties: { wikidata: 'Q2316396' },
				text_es: 'Ottawa',
				language_es: 'es',
				place_name_es: 'Ottawa, Ontario, Canadá',
				text: 'Ottawa',
				language: 'es',
				place_name: 'Ottawa, Ontario, Canadá',
				bbox: [Array],
				center: [ -75.69, 45.421 ],
				geometry: { type: 'Point', coordinates: [Array] },
				context: [ [Object], [Object] ]
			},
			{
				id: 'place.000004',
				type: 'Feature',
				place_type: [ 'place' ],
				relevance: 1,
				properties: { wikidata: 'Q2316396' },
				text_es: 'san jose',
				language_es: 'es',
				place_name_es: 'San José, Provincia de San José, Costa Rica',
				text: 'san jose',
				language: 'es',
				place_name: 'San José, Provincia de San José, Costa Rica',
				bbox: [Array],
				center: [ -84.08333, 9.93333 ],
				geometry: { type: 'Point', coordinates: [Array] },
				context: [ [Object], [Object] ]
			},

		]
	}
}

class Busquedas{

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        this.leerDb();
    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );
            return palabras.join(' ');
        });
    }

    get paramMapBox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad( lugar = '' ){

        try {
            //petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramMapBox
            });
            //const resp = await instance.get();
            const resp = array1;
            
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lon: lugar.center[0],
                lat: lugar.center[1],
            }));

        } catch (err) {
            console.log("Error");
            return [];
        }

    }

    async buscarClimaLugar(lat, lon){
        try {
            //petición http
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramWeather, lat, lon }
            });
            const resp = await instance.get();
            const { weather, main} = resp.data;
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp:main.temp
            }

        } catch (err) {
            console.log(err);
        }
    }

    agregarHistorial( lugar = ''){
        if ( this.historial.includes( lugar.toLocaleLowerCase() ) ) {
            return;
        }

        this.historial = this.historial.splice(0,5);
        this.historial.unshift( lugar.toLocaleLowerCase() );
    
        //Grabar en DB
        this.guardarDb();
    }

    guardarDb(){
        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify( payload ) );
    }

    leerDb(){
        if ( !fs.existsSync( this.dbPath ) ) return
    
        const info = fs.readFileSync( this.dbPath , {encoding : 'utf-8'} );
        const data = JSON.parse(info);
        
        this.historial = data.historial ;
        console.log(this.historial);
    
    }

}

module.exports = Busquedas;
