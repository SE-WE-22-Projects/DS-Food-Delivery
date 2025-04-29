export const convertToNs = (time: string)=> {
    const [hour, min] = time.split(":");
    let ms = Number.parseInt(hour) *60;
    ms += Number.parseInt(min);
    return ms * 60 * 1e9;
}

export const convertFromNs = (nanoseconds: number) => {
    const totalMinutes = nanoseconds / (60 * 1e9);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
};