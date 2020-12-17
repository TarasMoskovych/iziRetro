import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], prop: string, inputString: any): any[] {
    if (inputString === '') {
      return items;
    }
    return items.filter(item => item[prop].search(new RegExp(inputString, 'i')) !== -1);
  }

}
