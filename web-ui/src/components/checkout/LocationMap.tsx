import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { CSSProperties, MouseEventHandler, useState } from 'react';
import { LatLng } from 'leaflet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MapPin } from 'lucide-react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

const position = [7.8731, 80.7718];

const LocationMarker = (props: MapProps) => {
    const map = useMapEvents({
        click: (e) => {
            props.onChange(e.latlng)
        },
        locationfound: (e) => {
            map.flyTo(e.latlng, 16)
            props.onChange(e.latlng)
        },
    })

    return props.value !== undefined ? (
        <Marker position={props.value}>
            <Popup>Delivery Location</Popup>
        </Marker>
    ) : null
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
    onChange: (l: LatLng) => void
    value: LatLng
    style?: CSSProperties
}

export const LocationMap = (props: MapProps) => {
    return (
        <MapContainer center={{ lng: position[1], lat: position[0] }} zoom={8} scrollWheelZoom={true} style={props.style ?? { height: "420px", width: "420px" }} >
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
                <LocationMap onChange={(v) => form.setValue(props.name, v)} value={props.value ?? position} />
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
