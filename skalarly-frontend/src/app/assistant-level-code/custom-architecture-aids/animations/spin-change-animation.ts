import {
  AnimationTriggerMetadata,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
export const spinChange: AnimationTriggerMetadata = trigger('spinChange', [
  state('initial', style({ transform: 'rotate(0deg)' })),
  state('spinning', style({ transform: 'rotate(360deg)' })),
  state('check', style({ transform: 'rotate(360deg)' })),
  transition('initial <=> spinning', animate('1s linear')),
  transition('* => check', animate('1s ease'))
]);
