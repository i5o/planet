/*
 *  Material dialog component for selecting an object from a
 *  list, rendered as a Material table
 */

import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MAT_DIALOG_DATA, MatPaginator, PageEvent } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  templateUrl: './dialogs-list.component.html',
  styles: [ `
    .search-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .mat-column-select {
      max-width: 44px;
    }
    mat-table {
      overflow-y: auto;
      height: calc(100% - 160px);
    }
  ` ]
})
export class DialogsListComponent implements AfterViewInit {

  tableData = new MatTableDataSource();
  tableColumns: string[] = [];
  selection = new SelectionModel(true, []);
  pageEvent: PageEvent;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.tableData.data = this.data.tableData;
    this.tableColumns = this.data.columns;
    if (this.data.filterPredicate) {
      this.tableData.filterPredicate = this.data.filterPredicate;
    }
  }

  ngAfterViewInit() {
    this.tableData.paginator = this.paginator;
  }

  ok() {
    this.data.okClick(this.selection.selected);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
    this.selection.clear() :
    this.tableData.data.forEach(row => this.selection.select(row));
  }

  applyFilter(filterValue: string) {
    this.tableData.filter = filterValue;
  }

}
