import { Component, Input, forwardRef, signal, computed, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chip-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2">
      <div 
        *ngFor="let option of options" 
        (click)="toggleOption(option)"
        [ngClass]="{
          'bg-blue-600 text-white': isSelected(option),
          'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !isSelected(option)
        }"
        class="px-4 py-2 rounded-full cursor-pointer transition-colors text-sm font-medium hover:bg-blue-500 hover:text-white"
      >
        {{ option.label || option }}
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipSelectComponent),
      multi: true
    }
  ]
})
export class ChipSelectComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() multiSelect: boolean = false;
  
  @Output() selectionChange = new EventEmitter<any>();

  value = signal<any>(null);

  onChange = (val: any) => {};
  onTouched = () => {};

  writeValue(val: any): void {
    this.value.set(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  isSelected(option: any): boolean {
    const val = this.value();
    const optValue = option.value !== undefined ? option.value : option;
    if (this.multiSelect) {
      return Array.isArray(val) && val.includes(optValue);
    }
    return val === optValue;
  }

  toggleOption(option: any): void {
    const optValue = option.value !== undefined ? option.value : option;
    let newValue;
    
    if (this.multiSelect) {
      const current = Array.isArray(this.value()) ? [...this.value()] : [];
      if (current.includes(optValue)) {
        newValue = current.filter(item => item !== optValue);
      } else {
        newValue = [...current, optValue];
      }
    } else {
      newValue = this.isSelected(option) ? null : optValue;
    }
    
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.selectionChange.emit(newValue);
  }
}
