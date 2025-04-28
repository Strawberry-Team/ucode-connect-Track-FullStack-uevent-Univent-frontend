export interface CustomPaginationProps {
    totalCount: number;
    currentPage: number;
    take: number;
    maxVisiblePages?: number;
}