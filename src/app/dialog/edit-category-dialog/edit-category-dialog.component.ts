import {Component, Inject, OnInit} from '@angular/core';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {DialogAction, DialogResult} from '../../object/DialogResult';
import {Category} from '../../model/Category';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-edit-category-dialog',
    templateUrl: './edit-category-dialog.component.html',
    styleUrls: ['./edit-category-dialog.component.css']
})

// создание/редактирование категории
export class EditCategoryDialogComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<EditCategoryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: [Category, string],
        private dialog: MatDialog
    ) {
    }

    dialogTitle: string;
    category: Category;
    canDelete = true;

    ngOnInit() {

        this.category = this.data[0];
        this.dialogTitle = this.data[1];

        if (this.category && this.category.id && this.category.id > 0) {
            this.canDelete = true;
        }
    }

    confirm(): void {
        this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.category));
    }

    cancel(): void {
        this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
    }

    delete(): void {

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '500px',
            data: {
                dialogTitle: 'Confirm action',
                message: `Are you sure you want to delete category: "${this.category.title}"?)`
            },
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) {
                return;
            }


            if (result.action === DialogAction.OK) {
                this.dialogRef.close(new DialogResult(DialogAction.DELETE));
            }
        });


    }
}
