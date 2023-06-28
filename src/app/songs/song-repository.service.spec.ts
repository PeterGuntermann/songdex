import { TestBed } from "@angular/core/testing";

import { SongRepository } from "./song-repository.service";

describe("DataService", () => {
    let service: SongRepository;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SongRepository);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
