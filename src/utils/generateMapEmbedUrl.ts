function toDMS(lat: number, lon: number): string {
    const latDirection = lat >= 0 ? "N" : "S";
    const lonDirection = lon >= 0 ? "E" : "W";

    const latAbs = Math.abs(lat);
    const lonAbs = Math.abs(lon);

    const latDeg = Math.floor(latAbs);
    const latMin = Math.floor((latAbs - latDeg) * 60);
    const latSec = ((latAbs - latDeg - latMin / 60) * 3600).toFixed(1);

    const lonDeg = Math.floor(lonAbs);
    const lonMin = Math.floor((lonAbs - lonDeg) * 60);
    const lonSec = ((lonAbs - lonDeg - lonMin / 60) * 3600).toFixed(1);

    const dmsString = `${latDeg}°${latMin}'${latSec}"${latDirection} ${lonDeg}°${lonMin}'${lonSec}"${lonDirection}`;

    return Buffer.from(dmsString, "utf-8").toString("base64");
}

export function generateMapEmbedUrl(coordinates: string, language: string = "en"): string {
    const [lat, lon] = coordinates.split(",").map(Number);

    const zoomLevel = lat > 80 || lat < -80 ? 347 : lat > 60 || lat < -60 ? 1000 : 4000;

    const dmsEncoded = toDMS(lat, lon);

    return `https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d${zoomLevel}!2d${lon}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2z${dmsEncoded}!5e0!3m2!1s${language}!2suk!4v1744803262375!5m2!1s${language}!2suk`;
}