import { Injectable } from "@angular/core";
import { kv } from "@vercel/kv";
import { Song } from "./songs/model";

@Injectable({
    providedIn: "root",
})
export class PersistenceService {
    async fetchValueByKey(key: string): Promise<unknown | null> {
        return kv.get(key);
    }

    setKeyValue(key: string, value: any) {
        kv.set(key, value);
    }

    seedWithDummyData() {
        const songs: Song[] = [
            { title: "Songtitel 1", interpret: "Songinterpret 1", link: "https://www.youtube.com" },
            { title: "Songtitel 2", interpret: "Songinterpret 2", link: "https://www.youtube.com" },
            { title: "Songtitel 3", interpret: "Songinterpret 3", link: "https://www.youtube.com" },
        ];
        this.setKeyValue("songs", songs);
    }
}
