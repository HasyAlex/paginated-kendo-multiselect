import { Component, ViewChild } from '@angular/core';

import { switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { OrdersService } from './northwind.service';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'my-app',
  providers: [OrdersService],
  template: `
        <div class="example-wrapper">
            <kendo-multiselect
                #multiselect
                [data]="data"
                [valueField]="'OrderID'"
                [textField]="'ShipName'"
                [virtual]="virtual"
                [loading]="loading"
                (opened)="onOpened()"
                [style.width.px]="200"
                (valueChange)="valueChange($event)"
            >
                <ng-template kendoDropDownListItemTemplate let-dataItem>
                    <div *ngIf="!dataItem; else elseBlock">
                        <span class="k-skeleton k-skeleton-text k-skeleton-wave"></span>
                    </div>
                    <ng-template #elseBlock>{{ dataItem.ShipName }}</ng-template>
                </ng-template>
            </kendo-multiselect>
        </div>
    `,
})
export class AppComponent {
  public data: any[] = [];

  @ViewChild('multiselect', { static: false })
  public multiselect: DropDownListComponent;

  public loading: boolean;

  public virtual: any = {
    itemHeight: 28,
    pageSize: 50,
  };

  public state: any = {
    skip: 0,
    take: 50,
  };

  private stateChange = new BehaviorSubject<any>(this.state);

  constructor(service: OrdersService) {
    this.stateChange
      .pipe(
        switchMap((state) => {
          if (this.data.length > 0) {
            this.loading = true;
          }
          this.state = state;

          return service.fetch(state);
        })
      )
      .subscribe((response: any) => {
        if (this.data.length === 0) {
          // even though we are getting only 50 items from the response we simulate an array that consists of all data items
          this.data = response.data.concat(
            new Array(response.total - this.state.take)
          );
        } else {
          // if there is already loaded data, it is replaced with the latest received data
          this.data.splice(this.state.skip, this.state.take, ...response.data);
        }

        this.loading = false;
      });
  }

  public ngAfterViewInit() {
    // pass the initial state to the stateChange BehaviorSubject
    this.stateChange.next(this.state);
  }

  public ngOnDestroy() {
    this.stateChange.unsubscribe();
  }

  public onOpened() {
    // optionsList is a reference to the internal kendo-list component used in the DropDownList popup
    // pass the current state to the stateChange BehaviorSubject on each pageChange event
    this.multiselect.optionsList.pageChange.subscribe((state) =>
      this.stateChange.next(state)
    );
  }

  public valueChange(value): void {
    console.log(value);
  }
}
