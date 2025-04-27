export const convertToNs = (time: string)=> {
    const [hour, min] = time.split(":");
    let ms = Number.parseInt(hour) *60;
    ms += Number.parseInt(min);
    return ms * 60 * 1e9;
}