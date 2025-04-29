import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { MouseEventHandler, useState } from 'react';
import { LatLng } from 'leaflet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MapPin } from 'lucide-react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

const position = [7.8731, 80.7718];

const LocationMarker = (props: MapProps) => {
    const [position, setPosition] = useState<LatLng | null>(null)
    const map = useMapEvents({
        click: (e) => {
            setPosition(e.latlng)
            props.setLocation(e.latlng)
        },
        locationfound: (e) => {
            setPosition(e.latlng)
            map.flyTo(e.latlng, 16)
            props.setLocation(e.latlng)
        },
    })

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Delivery Location</Popup>
        </Marker>
    )
}

const LocateButton = () => {
    const map = useMapEvents({
        locationfound: (e) => {
            map.flyTo(e.latlng, map.getZoom())
        },
    });

    const findLocation: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        map.locate()
        return true;
    }

    return <div>
        <div className="leaflet-top leaflet-right">
            <div className="leaflet-control leaflet-bar">
                <Button onClick={findLocation}>
                    Locate Me
                </Button>
            </div>
        </div>
    </div>
}

interface MapProps {
    setLocation: (l: LatLng) => void
}

export const LocationMap = (props: MapProps) => {
    return (
        <MapContainer center={{ lng: position[1], lat: position[0] }} zoom={6} scrollWheelZoom={true} style={{ height: "420px", width: "420px" }} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker {...props} />
            <LocateButton />
        </MapContainer>
    )

}


const MapSelectorInput = (props: ControllerRenderProps) => {
    const [open, setOpen] = useState(false);
    const form = useFormContext();


    const value = props.value ? "Location Selected" : ""

    return <>
        <div className="flex items-center">
            <Input placeholder="Select Location"  {...props} readOnly value={value} />
            <Button className="ml-2" onClick={(e) => {
                setOpen(true);
                e.preventDefault();
                e.stopPropagation();
            }}>
                <MapPin />
                Select
            </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="w-[80vw]">
                <DialogHeader>
                    <DialogTitle>Select Location</DialogTitle>
                    <DialogDescription>
                        Select location on the map
                    </DialogDescription>
                </DialogHeader>
                <LocationMap setLocation={(v) => form.setValue(props.name, v)} />
                <DialogFooter>
                    <Button type="submit"
                        onClick={(e) => {
                            setOpen(false);
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
}

export default MapSelectorInput
