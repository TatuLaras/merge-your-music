import { StoreService } from './StoreService';

export class FakeStoreService implements StoreService {
    private data: any;

    constructor() {
        this.data = {};
    }

    store(key: string, value: any): boolean {
        this.data[key] = value;
        return true;
    }
    retrieve(key: string) {
        return this.data[key];
    }
}
