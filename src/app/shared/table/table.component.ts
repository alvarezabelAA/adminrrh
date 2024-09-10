import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: {
    header: string,
    key: string,
    format?: string,
    render?: (item: any) => string,
    type?: string,
    action?: string,
    label?: string
    badgeNum?: number
  }[] = [];
  @Input() showActions = true;
  @Input() disableEdit = false;
  @Input() disableDelete = false;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<number>();
  @Output() newEntry = new EventEmitter<void>();

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  constructor(private router: Router) {}

  // Normaliza las cadenas para hacer la búsqueda
  normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[ñ]/g, 'n');
  }

  handleSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
  }

  filteredData(): any[] {
    const normalizedSearchTerm = this.normalizeString(this.searchTerm);
    return this.data.filter(item =>
      this.columns.some(column => {
        const value = this.getValueFromKey(item, column.key);
        return this.normalizeString(String(value)).includes(normalizedSearchTerm);
      })
    );
  }

  getValueFromKey(item: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc && acc[part], item);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData().slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredData().length / this.itemsPerPage);
  }

  handleChangePage(newPage: number) {
    if (newPage > 0 && newPage <= this.totalPages()) {
      this.currentPage = newPage;
    }
  }

  // Método para obtener el rango de elementos que se muestran
  getCurrentRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredData().length);
    return `${start} a ${end}`;
  }

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(itemId: number) {
    this.delete.emit(itemId);
  }

  onNewEntry() {
    this.newEntry.emit();
  }

  handleAction(action: string | undefined, itemId: any) {
    if (action === 'goToDepartamentos') {
      this.goToDepartamentos(itemId.id);
    } else if(action === 'goToMunicipios') {
      this.goToMunicipios(itemId);
    } else if (action === 'gotToColaboradores') {
      this.gotToColaboradores(itemId.id);
    }
  }

  isIcon(label?: string): boolean {
    if (!label) {
      return false;
    }
    const materialIcons = ['business', 'edit', 'delete', 'note_add', /* otros íconos */];
    return materialIcons.includes(label);
  }



  goToDepartamentos(itemId: number) {
    // console.log('Navegar a departamentos del item con ID:', itemId);
    this.router.navigate(['/departamentos', itemId]);
  }

  goToMunicipios(itemId: any) {
    // console.log('Navegar a municipios del item con ID:', itemId);
    this.router.navigate(['/municipios'], {
      queryParams: { ids: JSON.stringify(itemId) }
    });
  }

  gotToColaboradores(itemId: any) {
    // console.log('Navegar a municipios del item con ID:', itemId);
    this.router.navigate(['/colabora-empresa', itemId]);
  }

}
