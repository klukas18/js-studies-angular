import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortedAndFilteredHistory',
  standalone: true,
})
export class SortedAndFilteredHistoryPipe implements PipeTransform {
  transform(
    gameplayHistory: { type: string; timestamp: number }[] | null,
    sortOrder: 'asc' | 'desc',
    filterCriteria: string
  ): any {
    if (!gameplayHistory) {
      return null;
    }

    let sortedHistory = gameplayHistory.filter((event) =>
      event.type.includes(filterCriteria)
    );

    if (sortOrder === 'asc') {
      sortedHistory.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      sortedHistory.sort((a, b) => b.timestamp - a.timestamp);
    }

    return sortedHistory;
  }
}
