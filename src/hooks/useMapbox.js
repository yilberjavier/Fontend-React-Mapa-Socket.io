import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid'
import { Subject } from 'rxjs';


mapboxgl.accessToken = 'pk.eyJ1Ijoic2ltb25wZXRyaWtvdiIsImEiOiJja3g5ZTV3cGUzZGtpMm9xM3dzbmFqbjRxIn0.DCb8ZuMydouO0x6nrlFirg';



export const useMapbox = ( puntoInicial ) => {

    // Referncia al DIV del mapa
    const mapaDiv = useRef();
    const setRef = useCallback( ( node ) => {
        mapaDiv.current = node;
    }, []);

    // Referancia a los marcadores
    const marcadores = useRef({});

    // Observables de Rxjs
    const movimienMarcador =  useRef( new Subject() );;
    const nuevoMarcador = useRef( new Subject() );


    // Mapa y coords
    const mapa = useRef();
    const [cords, setCords] = useState( puntoInicial );

    // funcion para agregar marcadores

    const agregarMarcador = useCallback( ( ev, id ) => {

        const { lng, lat } = ev.lngLat || ev;

            const marker = new mapboxgl.Marker();
            marker.id = id ?? v4();


            marker
                .setLngLat([ lng, lat ])
                .addTo( mapa.current )
                .setDraggable( true );
            
            // Asignamos al objeto de marcadores
            marcadores.current[ marker.id ] = marker;

            if ( !id ) {

                nuevoMarcador.current.next( {
                    id: marker.id,
                    lng, 
                    lat
                } );

            }
            

            // escuchar movimientos del marcadores

            marker.on('drag', ({target}) => {

                const { id } = target;
                const { lng, lat } = target.getLngLat();
            
                movimienMarcador.current.next({
                    id, 
                    lng,
                    lat
                });
            });


    }, [])


    // Funcion para actulizar la ubicacion del marcador

    const actualizarPosicion = useCallback( ( {id, lng, lat} ) => {

        marcadores.current[ id ].setLngLat([ lng, lat ]);

    }, []);


    useEffect(() => {

        const map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [ puntoInicial.lng, puntoInicial.lat ],
            zoom: puntoInicial.zoom 
        });

        mapa.current = map;

    }, [ puntoInicial ]);

    // Cuando se mueve el mapa
    useEffect(() => {
        
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            setCords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
        });


    }, []);


    // Agregar marcadores cuando hacemos click

    useEffect(() => {  

        mapa.current?.on('click', agregarMarcador );
            
    }, [ agregarMarcador ]);



    return {
        agregarMarcador,
        actualizarPosicion,
        cords,
        marcadores,
        nuevoMarcador$: nuevoMarcador.current,
        movimienMarcador$: movimienMarcador.current,
        setRef
    }


}





