import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@lib/services';
import { ThemeService } from '@lib/services/theme';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutHorizontalComponent } from './lib/components/layouts/layout-horizontal/layout-horizontal.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule, LayoutHorizontalComponent,NgbModule],
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    isAuthenticated$ = inject(AuthService).isAuthenticated$;

    private readonly _themeService = inject(ThemeService);

    ngOnInit(): void {
        this._themeService.init();
    }
}
