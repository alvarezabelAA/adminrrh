import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<Array<any>>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbsSubject.next(breadcrumbs);
      });
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Array<any> = []): Array<any> {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      const parent = child.snapshot.data['parent'];

      // Captura tanto paramMap como queryParams
      const queryParams = child.snapshot.queryParams;  // Captura los queryParams actuales
      let params: { [key: string]: string | null } = {};

      // Verifica si hay parámetros en paramMap
      if (child.snapshot.paramMap.keys.length > 0) {
        params = child.snapshot.paramMap.keys.reduce((acc: { [key: string]: string | null }, key: string) => {
          acc[key] = child.snapshot.paramMap.get(key);
          return acc;
        }, {});
      }

      if (label) {
        breadcrumbs.push({ label, url, queryParams, params });
      }

      if (parent) {
        const parentURL = this.findParentURL(parent);
        if (parentURL) {
          breadcrumbs.unshift({ label: this.getBreadcrumbLabelForParent(parent), url: parentURL, queryParams, params });
        }
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }


  private findParentURL(parentPath: string): string | null {
    const parentRoute = this.router.config.find(route => route.path === parentPath);
    if (parentRoute) {
      return `/${parentRoute.path}`;
    }
    return null;
  }

  private getBreadcrumbLabelForParent(parentPath: string): string {
    const parentRoute = this.router.config.find(route => route.path === parentPath);
    if (parentRoute && parentRoute.data) {
      return parentRoute.data['breadcrumb'];
    }
    return '';
  }
}
