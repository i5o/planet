/*
 *  Material dialog component for selecting an object from a
 *  list, rendered as a Material table
 */

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  templateUrl: './dialogs-list.component.html'
})
export class DialogsListComponent {

  tableData: any = [];
  tableColumns: string[] = [];
  selection = new SelectionModel(true, []);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.tableData = this.data.tableData;
    this.tableColumns = this.data.columns;
  }

  ok() {
    this.data.okClick(this.selection.selected);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
    this.selection.clear() :
    this.tableData.forEach(row => this.selection.select(row));
  }

}
