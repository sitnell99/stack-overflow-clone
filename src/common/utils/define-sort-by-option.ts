export function defineSortByOption(option: string): string {
  switch (option) {
    case 'ID':
      return 'id';
    case 'DATE':
      return 'createdAt';
    default:
      return 'id';
  }
}
