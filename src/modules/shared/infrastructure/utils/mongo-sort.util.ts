import { SortDirection } from '../../domain/enums/sort-direction.enum';

export function toMongoSortOrder(sortDir: SortDirection): 1 | -1 {
  return sortDir === SortDirection.ASC ? 1 : -1;
}
