import { Injectable } from '@angular/core';
import * as randomize from 'randomatic';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  generateId(length = 16) {
    return randomize('Aa0', length);
  }
}
