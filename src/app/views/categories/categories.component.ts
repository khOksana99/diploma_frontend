import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Category} from '../../model/Category';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MatDialog} from '@angular/material/dialog';
import {CategorySearchValues} from "../../data/dao/search/SearchObjects";
import {EditCategoryDialogComponent} from "../../dialog/edit-category-dialog/edit-category-dialog.component";
import {DialogAction} from "../../object/DialogResult";

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css']
})

export class CategoriesComponent implements OnInit {

    @Input('selectedCategory')
    set setCategory(selectedCategory: Category) {
        this.selectedCategory = selectedCategory;
    }

    @Input('categories')
    set setCategories(categories: Category[]) {
        this.categories = categories;
    }

    @Input('categorySearchValues')
    set setCategorySearchValues(categorySearchValues: CategorySearchValues) {
        this.categorySearchValues = categorySearchValues;
    }

    @Input('uncompletedCountForCategoryAll')
    set uncompletedCount(uncompletedCountForCategoryAll: number) {
        this.uncompletedCountForCategoryAll = uncompletedCountForCategoryAll;
    }

    @Output()
    selectCategory = new EventEmitter<Category>();

    @Output()
    deleteCategory = new EventEmitter<Category>();

    @Output()
    updateCategory = new EventEmitter<Category>();

    @Output()
    addCategory = new EventEmitter<Category>();

    @Output()
    searchCategory = new EventEmitter<CategorySearchValues>();




    selectedCategory;
    indexMouseMove: number;
    showEditIconCategory: boolean;

    isMobile: boolean;

    categories: Category[];

    categorySearchValues: CategorySearchValues;

    uncompletedCountForCategoryAll: number;

    filterTitle: string;

    filterChanged: boolean;

    constructor(
        private dialog: MatDialog,
        private deviceService: DeviceDetectorService
    ) {
        this.isMobile = deviceService.isMobile();
    }

    ngOnInit() {
    }


    search() {

        this.filterChanged = false;

        if (!this.categorySearchValues) {
            return;
        }

        this.categorySearchValues.title = this.filterTitle;
        this.searchCategory.emit(this.categorySearchValues);

    }


    showCategory(category: Category) {

        if (this.selectedCategory === category) {
            return;
        }

        this.selectedCategory = category;
        this.selectCategory.emit(this.selectedCategory);
    }

    showEditIcon(show: boolean, index: number) {
        this.indexMouseMove = index;
        this.showEditIconCategory = show;
    }


    clearAndSearch() {
        this.filterTitle = null;
        this.search();
    }

    checkFilterChanged() {

        this.filterChanged = false;

        if (this.filterTitle !== this.categorySearchValues.title){
            this.filterChanged = true;
        }

        return this.filterChanged;

    }

    openAddDialog() {

        const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
            data: [new Category(null, ''), 'Adding category'],
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) {
                return;
            }

            if (result.action === DialogAction.SAVE) {
                this.addCategory.emit(result.obj as Category);
            }
        });
    }


    openEditDialog(category: Category) {
        const dialogRef = this.dialog.open(EditCategoryDialogComponent, {

            data: [new Category(category.id, category.title), 'Editing category'], width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) {
                return;
            }

            if (result.action === DialogAction.DELETE) {
                this.deleteCategory.emit(category);
                return;
            }

            if (result.action === DialogAction.SAVE) {

                this.updateCategory.emit(result.obj as Category);
                return;
            }
        });
    }
}
