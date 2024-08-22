import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filteredHistory',
  standalone: true,
})
export class FilteredHistoryPipe implements PipeTransform {
  transform(
    gameplayHistory: { type: string; timestamp: number }[] | null,
    filterCriteria: string
  ): any {
    if (!gameplayHistory) {
      return null;
    }

    return gameplayHistory.filter((event) =>
      event.type.includes(filterCriteria)
    );
  }
}
