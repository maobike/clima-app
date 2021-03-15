require('dotenv').config();

const { inquirerMenu, InquirerPausa, leerInput, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async() => {
    const busquedas = new Busquedas();
    let opt;

    do {
        opt = await inquirerMenu();
        switch (opt) {
            case 1:
                //Mostrar el mensaje
                const txtSearch = await leerInput('Ciudad: ');
                
                // Buscar los lugares
                const lugares   = await busquedas.ciudad( txtSearch );
                
                // Seleccionar el lugar
                const id = await listarLugares(lugares);

                if (id === '0') continue;

                const lugarSel = lugares.find( l => l.id === id);
                
                // Guardar en DB
                busquedas.agregarHistorial( lugarSel.nombre );

                // Clima
                const clima = await busquedas.buscarClimaLugar( lugarSel.lat, lugarSel.lon);

                // Mostrar resultados
                console.clear();
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad:', lugarSel.nombre.green );
                console.log('Latitud:', lugarSel.lat);
                console.log('Longitud:', lugarSel.lon);
                console.log('Temperatura:', clima.temp);
                console.log('Temp min:', clima.min);
                console.log('Temp max:', clima.max);
                console.log('Como está el clima:', clima.desc.green);

            break;

            case 2:
                // Lista las tareas
                busquedas.historialCapitalizado.forEach( (lugar, i) => {
                    const idx = `${ i +1 }.`.green;
                    console.log(`${ idx } ${ lugar }`);
                })
                
            break;
        }
        
        //guardarDb( tareas.listadoArr );
        if (opt !== 0) await InquirerPausa();

    } while ( opt != 0);
}


main();
