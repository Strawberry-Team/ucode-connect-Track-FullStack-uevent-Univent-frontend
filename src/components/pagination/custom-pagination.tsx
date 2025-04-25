"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

// Типизация пропсов для CustomPagination
interface CustomPaginationProps {
    totalCount: number; // Общее количество элементов
    currentPage: number; // Текущая страница
    take: number; // Количество элементов на странице
    maxVisiblePages?: number; // Максимальное количество отображаемых страниц (по умолчанию 5)
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
                                                               totalCount,
                                                               currentPage,
                                                               take,
                                                               maxVisiblePages = 5,
                                                           }) => {
    const searchParams = useSearchParams();
    const totalPages = Math.ceil(totalCount / take);

    // Вычисляем диапазон отображаемых страниц
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    const visiblePages = Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
    );

    // Функция для формирования URL
    const getPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `?${params.toString()}`;
    };

    // Если меньше двух страниц, пагинация не нужна
    if (totalPages <= 1) {
        return null;
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={getPageUrl(currentPage - 1)}
                        component={Link}
                        className={
                            currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>

                {startPage > 1 && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                {visiblePages.map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                        <PaginationLink
                            href={getPageUrl(pageNumber)}
                            component={Link}
                            isActive={pageNumber === currentPage}
                            className="cursor-pointer"
                        >
                            {pageNumber}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {endPage < totalPages && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                <PaginationItem>
                    <PaginationNext
                        href={getPageUrl(currentPage + 1)}
                        component={Link}
                        className={
                            currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default CustomPagination;