import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

type Position = { type: "point", coordinates: number[] }

const OrderMap = ({ dest, start, driver }: { dest: Position, start: Position, driver?: Position }) => {
    return (
        <MapContainer center={{ lng: dest.coordinates[0], lat: dest.coordinates[1] }} zoom={10} scrollWheelZoom={true} style={{ height: "300px", minWidth: "600px" }} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={{ lng: dest.coordinates[0], lat: dest.coordinates[1] }}>
                <Popup>Destination</Popup>
            </Marker>

            <Marker position={{ lng: start.coordinates[0], lat: start.coordinates[1] }}>
                <Popup>Start</Popup>
            </Marker>

            {driver && <Marker position={{ lng: driver.coordinates[0], lat: driver.coordinates[1] }}>
                <Popup>Driver</Popup>
            </Marker>}
        </MapContainer>
    )
}

export default OrderMap