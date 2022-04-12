import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Task} from '../../model/Task';
import {EditTaskDialogComponent} from '../../dialog/edit-task-dialog/edit-task-dialog.component';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {Category} from '../../model/Category';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Priority} from '../../model/Priority';
import {DialogAction} from '../../object/DialogResult';
import {MatDialog} from '@angular/material/dialog';
import {Sort} from '@angular/material/sort';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {TaskSearchValues} from "../../data/dao/search/SearchObjects";

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})

export class TaskListComponent implements OnInit {
    @Input()
    totalTasksFounded: number;

    @Input()
    selectedCategory: Category;

    @Input()
    showSearch: boolean;

    @Input('tasks')
    set setTasks(tasks: Task[]) {
        this.tasks = tasks;
        this.assignTableSource();
    }

    @Input('taskSearchValues')
    set setTaskSearchValues(taskSearchValues: TaskSearchValues) {
        this.taskSearchValues = taskSearchValues;
        this.initSearchValues();
        this.initSortDirectionIcon();
    }

    @Input('priorities')
    set setPriorities(priorities: Priority[]) {
        this.priorities = priorities;
    }

    @Input('categories')
    set setCategories(categories: Category[]) {
        this.categories = categories;
    }



    @Output()
    addTask = new EventEmitter<Task>();

    @Output()
    deleteTask = new EventEmitter<Task>();

    @Output()
    updateTask = new EventEmitter<Task>();

    @Output()
    selectCategory = new EventEmitter<Category>();

    @Output()
    paging = new EventEmitter<PageEvent>();

    @Output()
    searchAction = new EventEmitter<TaskSearchValues>();

    @Output()
    toggleSearch = new EventEmitter<boolean>();

    // -------------------------------------------------------------------------


    priorities: Priority[];
    categories: Category[];

    tasks: Task[];


    displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category', 'operations', 'select'];
    dataSource: MatTableDataSource<Task> = new MatTableDataSource<Task>();

    changed = false;


    readonly defaultSortColumn = 'title';
    readonly defaultSortDirection = 'asc';


    filterTitle: string;
    filterCompleted: number;
    filterPriorityId: number;
    filterSortColumn: string;
    filterSortDirection: string;


    isMobile: boolean;


    taskSearchValues: TaskSearchValues;

    sortIconName: string;


    readonly iconNameDown = 'arrow_downward';
    readonly iconNameUp = 'arrow_upward';


    readonly colorCompletedTask = '#F8F9FA';
    readonly colorWhite = '#fff';


    constructor(
        private dialog: MatDialog,
        private deviceService: DeviceDetectorService
    ) {
        this.isMobile = this.deviceService.isMobile();
    }


    ngOnInit() {
    }



    assignTableSource() {


        if (!this.dataSource) {
            return;
        }
        this.dataSource.data = this.tasks;

    }


    openAddDialog() {

        const task = new Task(null, '', 0, null, this.selectedCategory);

        const dialogRef = this.dialog.open(EditTaskDialogComponent, {


            data: [task, 'Adding task', this.categories, this.priorities]
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) {
                return;
            }

            if (result.action === DialogAction.SAVE) {
                this.addTask.emit(task);
            }
        });

    }


    openEditDialog(task: Task): void {


        const dialogRef = this.dialog.open(EditTaskDialogComponent, {
            data: [task, 'Editing task', this.categories, this.priorities],
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {


            if (!(result)) {
                return;
            }


            if (result.action === DialogAction.DELETE) {
                this.deleteTask.emit(task);
                return;
            }

            if (result.action === DialogAction.COMPLETE) {
                task.completed = 1;
                this.updateTask.emit(task);
            }


            if (result.action === DialogAction.ACTIVATE) {
                task.completed = 0;
                this.updateTask.emit(task);
                return;
            }

            if (result.action === DialogAction.SAVE) {
                this.updateTask.emit(task);
                return;
            }


        });
    }



    openDeleteDialog(task: Task) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '500px',
            data: {dialogTitle: 'Confirm action', message: `Are you sure you want to delete task: "${task.title}"?`},
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {


            if (!(result)) {
                return;
            }


            if (result.action === DialogAction.OK) {
                this.deleteTask.emit(task);
            }
        });
    }

    onToggleCompleted(task: Task) {

        if (task.completed === 0) {
            task.completed = 1;
        } else {
            task.completed = 0;
        }

        this.updateTask.emit(task);
    }


    getPriorityColor(task: Task) {

        if (task.completed) {
            return this.colorCompletedTask;
        }

        if (task.priority && task.priority.color) {
            return task.priority.color;
        }

        return this.colorWhite;

    }

    getPriorityBgColor(task: Task) {

        if (task.priority != null && !task.completed) {
            return task.priority.color;
        }

        return 'none';
    }


    pageChanged(pageEvent: PageEvent) {
        this.paging.emit(pageEvent);
    }

    initSearch() {

        this.taskSearchValues.title = this.filterTitle;
        this.taskSearchValues.completed = this.filterCompleted;
        this.taskSearchValues.priorityId = this.filterPriorityId;
        this.taskSearchValues.sortColumn = this.filterSortColumn;
        this.taskSearchValues.sortDirection = this.filterSortDirection;

        this.searchAction.emit(this.taskSearchValues);

        this.changed = false;

    }

    checkFilterChanged() {

        this.changed = false;

        if (this.taskSearchValues.title !== this.filterTitle) {
            this.changed = true;
        }

        if (this.taskSearchValues.completed !== this.filterCompleted) {
            this.changed = true;
        }

        if (this.taskSearchValues.priorityId !== this.filterPriorityId) {
            this.changed = true;
        }

        if (this.taskSearchValues.sortColumn !== this.filterSortColumn) {
            this.changed = true;
        }

        if (this.taskSearchValues.sortDirection !== this.filterSortDirection) {
            this.changed = true;
        }

        return this.changed;

    }



    initSortDirectionIcon() {

        if (this.filterSortDirection === 'desc') {
            this.sortIconName = this.iconNameDown;
        } else {
            this.sortIconName = this.iconNameUp;
        }
    }


    changedSortDirection() {

        if (this.filterSortDirection === 'asc') {
            this.filterSortDirection = 'desc';
        } else {
            this.filterSortDirection = 'asc';
        }

        this.initSortDirectionIcon();

    }

    initSearchValues() {
        if (!this.taskSearchValues) {
            return;
        }
        this.filterTitle = this.taskSearchValues.title;
        this.filterCompleted = this.taskSearchValues.completed;
        this.filterPriorityId = this.taskSearchValues.priorityId;
        this.filterSortColumn = this.taskSearchValues.sortColumn;
        this.filterSortDirection = this.taskSearchValues.sortDirection;
    }

    clearSearchValues() {
        this.filterTitle = '';
        this.filterCompleted = null;
        this.filterPriorityId = null;
        this.filterSortColumn = this.defaultSortColumn;
        this.filterSortDirection = this.defaultSortDirection;
    }


    onToggleSearch() {
        this.toggleSearch.emit(!this.showSearch);
    }


}
