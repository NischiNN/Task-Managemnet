import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EChartsOption } from "echarts";
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CustomStorageService } from 'src/app/services/custom.service';
import { TaskService } from 'src/app/services/task.service';
import { ToasterService } from 'src/app/services/toaster.service';
@Component({
  standalone: true,
  templateUrl: './register.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ScrollingModule, InfiniteScrollModule, NgxEchartsModule],
  selector: "app-user",
  styleUrls: ["./register.component.css"],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {
        echarts: () => import('echarts')
      }
    }
  ],
})
export class RegisterComponent implements OnInit {
  tableData: any = []
  priorityArray: any = [
    {
      value: 3,
      label: "URGENT",
      color: '#f50100',
      initial: 'U'
    },
    {
      value: 2,
      label: "HIGH",
      color: '#ffaa29',
      initial: 'H'
    },
    {
      value: 1,
      label: "MEDIUM",
      color: '#53b6ee',
      initial: 'M'
    },
    {
      value: 0,
      label: "LOW",
      color: '#d8d8d8',
      initial: 'L'
    },
  ]
  statusOfTask: any = [
    {
      "value": 0,
      "label": "To Do"
    },
    {
      "value": 1,
      "label": "Completed"
    },
    {
      "value": 2,
      "label": "In Progress"
    }
  ]
  tagOfTask: any = [
    {
      "value": 0,
      "label": "Infrastructure"
    },
    {
      "value": 1,
      "label": "UI/UX"
    },
    {
      "value": 2,
      "label": "Bug Fix"
    },
    {
      "value": 3,
      "label": "Performance"
    },
    {
      "value": 4,
      "label": "Documentation"
    },
    {
      "value": 5,
      "label": "Feature Request"
    },
    {
      "value": 6,
      "label": "Other"
    }
  ]
  username: string = '';
  initial: string = '';
  task = {
    title: '',
    state: 0,
    category: 6,
    priority: 1,
    desc: ''
  };
  chartOptions: EChartsOption = {};
  selectedGroup: any = 'priority';
  copyOfTableData: any = [];
  isAuthenticated: any = '';
  showSpinner: boolean = false;
  isCreate: boolean = false;
  @ViewChild('closeBtn') closeBtn!: ElementRef;
  selectedTaskId: any = ''

  constructor(private taskService: TaskService, private customStorageService: CustomStorageService, private router: Router, private toast: ToasterService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.isAuthenticated = this.customStorageService.getItem('isAuthenticated')
    if (!this.isAuthenticated) this.router.navigate(['/auth/login']);
    this.chartOptions = {}
    this.getAllTask()
    this.initial = this.getInitials();
  }
  getAllTask() {
    this.tableData = []
    this.showSpinner = true;
    this.taskService.getTasks().subscribe((res: any) => {
      setTimeout(() => {
        this.tableData = res?.result;
        this.copyOfTableData = JSON.parse(JSON.stringify(this.tableData))
        this.groupChange();
        this.showSpinner = false;
        this.cd.detectChanges()
      }, 500)
    }, err => {
      this.showSpinner = false;
    })
  }

  getInitials(): string {
    this.username = String(this.customStorageService.getItem('name'))
    if (!this.username) return '';
    const names = this.username.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  onScroll() {

  }
  gettingLeadDataForTableViewOnScroll() {

  }

  editTask(item: any) {
    this.task.title = item?.title;
    this.task.state = item?.state;
    this.task.category = item?.category;
    this.task.priority = item?.priority;
    this.task.desc = item?.desc;
    this.selectedTaskId = item?.id

  }
  resetTask() {
    this.task.title = '';
    this.task.state = 0;
    this.task.category = 6;
    this.task.priority = 1;
    this.task.desc = '';
  }

  groupChange() {
    const data = this.groupByCount(this.selectedGroup);
    this.chartOptions = {
      title: {
        text: `Task distribution by ${this.selectedGroup}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: 10,
        left: 'center'
      },
      series: [
        {
          name: 'Tasks',
          type: 'pie',
          radius: '50%',
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  groupByCount(key: 'priority' | 'state' | 'category'): { name: string, value: number }[] {
    const counts: Record<string, number> = {};

    for (const item of this.tableData) {
      const value = item[key] ?? 'Unknown';
      counts[value] = (counts[value] || 0) + 1;
    }

    return Object.entries(counts).map(([rawValue, count]) => {
      const numValue = parseInt(rawValue, 10);

      let label = 'Unknown';
      if (key === 'priority') {
        label = this.getPriority(numValue)?.label ?? 'Unknown';
      } else if (key === 'state') {
        label = this.getStatus(numValue)?.label ?? 'Unknown';
      } else if (key === 'category') {
        label = this.getTag(numValue)?.label ?? 'Unknown';
      }

      return { name: label, value: count };
    });
  }

  searchByTitle(event: any) {
    if (event === '') {
      this.tableData = this.copyOfTableData
    }
    else {
      let searchInput = event?.toLowerCase()
      this.tableData = this.tableData.filter((val: any) => val?.title?.toLowerCase().includes(searchInput))
    }
  }

  logout() {
    this.toast.success("Logout Success")
    this.customStorageService.clear();
    this.router.navigate(["/auth/login"]);
  }

  createOrUpdateTask() {
    if (this.isCreate) {
      this.taskService.createTask(this.task).subscribe((res: any) => {
        this.toast.success("Successfully Created Task")
        this.getAllTask()
      }, err => {
        console.log("error", err)
      })
      this.closeBtn.nativeElement.click();
    }
    else {
      this.taskService.updateTask(this.task, this.selectedTaskId).subscribe((res: any) => {
        this.toast.success("Updated Task")
        this.getAllTask()
      }, err => {
        console.log("error", err)
      })
      this.closeBtn.nativeElement.click();
    }
  }

  deleteTask(id: any) {
    this.taskService.deleteTask(id).subscribe((res: any) => {
      this.tableData = this.tableData.filter((val: any) => val.id != id)
    }, err => {
      console.log("error", err)
    })
  }
  getPriority(priority: number) {
    return this.priorityArray.find((p: any) => p.value === priority);
  }

  getStatus(state: number) {
    return this.statusOfTask.find((s: any) => s.value === state);
  }

  getTag(category: number) {
    return this.tagOfTask.find((t: any) => t.value === category);
  }
}
