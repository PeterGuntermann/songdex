import { Injectable } from "@angular/core";
import { kv } from "@vercel/kv";

@Injectable({
    providedIn: "root",
})
export class PersistenceService {
    async fetchValueByKey<T>(key: string): Promise<T | null> {
        return kv.get(key);
    }

    setKeyValue(key: string, value: any) {
        kv.set(key, value);
    }
}
