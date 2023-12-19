import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reusable-inputs',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './reusable-inputs.component.html',
  styleUrl: './reusable-inputs.component.scss'
})
export class ReusableInputsComponent {
  @Input() label?: string;
  @Input() control!: FormControl;
  @Input() error: string | null = null;
  @Input() controlType!: 'text';
  @Input() placeholder!: string;
  @Input() icon?: string;
  @Output() controlValueChanged: EventEmitter<string> =
    new EventEmitter<string>();
}
