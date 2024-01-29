export interface StoreService {
    store(key: string, value: any): boolean;
    retrieve(key: string): any;
}
