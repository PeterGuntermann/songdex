import { Song } from "./model";
import { generateEightRandomHexDigits } from "../random-generator";

export class SongFactory {
    static new(title: string, artist: string = ""): Song {
        return {
            id: generateEightRandomHexDigits(),
            title,
            artist,
            link: "",
        };
    }
}
