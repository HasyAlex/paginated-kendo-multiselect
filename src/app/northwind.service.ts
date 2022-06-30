import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toODataString } from '@progress/kendo-data-query';
import { map } from 'rxjs/operators';

export abstract class NorthwindService {
    private BASE_URL = 'https://odatasampleservices.azurewebsites.net/V4/Northwind/Northwind.svc/';

    constructor(private http: HttpClient, protected tableName: string) {}

    public fetch(state: any): any {
        const queryStr = `${toODataString(state)}&$count=true`;

        const result = this.http.get(`${this.BASE_URL}${this.tableName}?${queryStr}`).pipe(
            map(
                (response) =>
                    <any>{
                        data: response['value'],
                        total: parseInt(response['@odata.count'], 10)
                    }
            )
        );
        return result;
    }
}

@Injectable()
export class OrdersService extends NorthwindService {
    constructor(http: HttpClient) {
        super(http, 'Orders');
    }
}
