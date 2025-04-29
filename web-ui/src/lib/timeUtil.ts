import { format, parseISO } from 'date-fns';

export const convertToNs = (time: string) => {
    const [hour, min] = time.split(":");
    let ms = Number.parseInt(hour) * 60;
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

export const formatDate = (dateInput?: string | Date): string => {
    if (!dateInput) return "Unknown";

    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
        return format(date, "PPpp");
    } catch (error) {
        console.error("Error formatting date:", error);
        return String(dateInput);
    }
};