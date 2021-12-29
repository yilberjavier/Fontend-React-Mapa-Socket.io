import React, { useContext, useEffect }  from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';

import '../index.css';


const puntoInicial = {
    lng: -122.4725,
    lat: 37.8010,
    zoom: 13.5
}


export const MapaPage = () => {
    
    const { setRef, cords, nuevoMarcador$, movimienMarcador$, agregarMarcador, actualizarPosicion } = useMapbox( puntoInicial );

    const { socket } = useContext( SocketContext );

    // Escuchar los marcadores existentes
    useEffect(() => {
        
        socket.on( 'marcadores-activos', ( marcadores ) => {
            
            for (const key of Object.keys( marcadores )) {
                agregarMarcador( marcadores[ key ], key );
            }


        })

    }, [ socket, agregarMarcador ])



    // Nuevo Marcador
    useEffect(() => {
     
        nuevoMarcador$.subscribe( marcador => {
            socket.emit( 'marcador-nuevo', marcador );
        } );
    
    }, [ nuevoMarcador$, socket ]);



    //Movumiento de marcador
    useEffect(() => {

        movimienMarcador$.subscribe( marcador => {
            socket.emit( 'marcador-actualizado', marcador );
        })
        
    }, [ socket, movimienMarcador$ ])

    //Mover marcador mediante sockets
    useEffect(() => {

        socket.on( 'marcador-actualizado', ( marcador ) => {

            actualizarPosicion( marcador );

        })

    }, [ socket, actualizarPosicion ])

    // Escuchar nuevos marcadores
    useEffect(() => {
       
        socket.on('marcador-nuevo', ( marcador ) => {
            agregarMarcador( marcador, marcador.id );
        })


    }, [ socket, agregarMarcador ])


    return (
        <>
            <div className="info">
                lng: { cords.lng } | lat: { cords.lat } | zoom: { cords.zoom }
            </div>

            <div
                ref={ setRef }
                className="mapContainer"
            />
        </>
    )
}
