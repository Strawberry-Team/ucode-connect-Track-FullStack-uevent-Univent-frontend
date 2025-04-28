"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    CalendarIcon,
    X,
    FunnelPlus,
    FunnelX,
    SlidersHorizontal,
    Ellipsis,
    ChevronLeft,
    ChevronRight,
    TrendingUpDown,
    TrendingDown,
    TrendingUp,
    CalendarArrowDown,
    CalendarArrowUp,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarForm } from "@/components/ui/calendar-form";
import { format } from "date-fns";
import { EventFormat, Theme, EventFiltersProps } from "@/types/event";
import { useRouter, useSearchParams } from "next/navigation";


export default function FilterEvents({ formats, themes, minPrice, maxPrice }: EventFiltersProps) {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isFormatsExpanded, setIsFormatsExpanded] = useState(false);
    const [isThemesExpanded, setIsThemesExpanded] = useState(false);
    const [pendingFormats, setPendingFormats] = useState<number[]>([]);
    const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
    const [pendingThemes, setPendingThemes] = useState<number[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [pendingStartDate, setPendingStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [pendingEndDate, setPendingEndDate] = useState<Date | undefined>(undefined);
    // Изменяем начальное состояние на undefined
    const [priceRange, setPriceRange] = useState<number[] | undefined>(undefined);
    const [pendingPriceRange, setPendingPriceRange] = useState<number[] | undefined>(undefined);
    const [contentHeight, setContentHeight] = useState(0);
    const [priceIconState, setPriceIconState] = useState<"upDown" | "down" | "up">("upDown");
    const [dateIconState, setDateIconState] = useState<"upDown" | "down" | "up">("upDown");
    const contentRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    const INITIAL_VISIBLE_FORMATS = 5;
    const INITIAL_VISIBLE_THEMES = 5;

    useEffect(() => {
        const formatsParam = searchParams.get("formats");
        const themesParam = searchParams.get("themes");
        const startDateParam = searchParams.get("startedAt");
        const endDateParam = searchParams.get("endedAt");
        const priceMinParam = searchParams.get("minPrice");
        const priceMaxParam = searchParams.get("maxPrice");
        const sortByParam = searchParams.get("sortBy");
        const sortOrderParam = searchParams.get("sortOrder");

        // Форматы
        if (formatsParam) {
            const formatIdArray = formatsParam.split(",").map(Number).filter((id) => !isNaN(id));
            setPendingFormats(formatIdArray);
        } else {
            setPendingFormats([]);
        }

        if (themesParam) {
            const themeIds = themesParam.split(",").map(Number).filter((id) => !isNaN(id));
            setSelectedThemes(themeIds);
            setPendingThemes(themeIds);
        } else {
            setSelectedThemes([]);
            setPendingThemes([]);
        }

        if (startDateParam) {
            const date = new Date(startDateParam);
            setStartDate(date);
            setPendingStartDate(date);
        } else {
            setStartDate(undefined);
            setPendingStartDate(undefined);
        }

        if (endDateParam) {
            const date = new Date(endDateParam);
            setEndDate(date);
            setPendingEndDate(date);
        } else {
            setEndDate(undefined);
            setPendingEndDate(undefined);
        }

        if (priceMinParam !== null && priceMaxParam !== null) {
            const priceRangeValue = [Number(priceMinParam), Number(priceMaxParam)];
            setPriceRange(priceRangeValue);
            setPendingPriceRange(priceRangeValue);
        } else {
            setPriceRange(undefined);
            setPendingPriceRange(undefined);
        }

        if (sortByParam === "minPrice" && sortOrderParam === "asc") {
            setPriceIconState("down");
            setDateIconState("upDown");
        } else if (sortByParam === "minPrice" && sortOrderParam === "desc") {
            setPriceIconState("up");
            setDateIconState("upDown");
        } else if (sortByParam === "startedAt" && sortOrderParam === "asc") {
            setDateIconState("down");
            setPriceIconState("upDown");
        } else if (sortByParam === "startedAt" && sortOrderParam === "desc") {
            setDateIconState("up");
            setPriceIconState("upDown");
        } else {
            setPriceIconState("upDown");
            setDateIconState("upDown");
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSortBy = params.get("sortBy");
        const currentSortOrder = params.get("sortOrder");

        let newSortBy: string | null = null;
        let newSortOrder: string | null = null;
        let shouldUpdate = false;

        if (dateIconState !== "upDown") {
            newSortBy = "startedAt";
            newSortOrder = dateIconState === "down" ? "asc" : "desc";
        } else if (priceIconState !== "upDown") {
            newSortBy = "minPrice";
            newSortOrder = priceIconState === "down" ? "asc" : "desc";
        }

        if (
            newSortBy !== currentSortBy ||
            newSortOrder !== currentSortOrder ||
            (dateIconState === "upDown" && priceIconState === "upDown" && (currentSortBy !== null || currentSortOrder !== null))
        ) {
            shouldUpdate = true;
            if (newSortBy && newSortOrder) {
                params.set("sortBy", newSortBy);
                params.set("sortOrder", newSortOrder);
            } else {
                params.delete("sortBy");
                params.delete("sortOrder");
            }
            params.set("page", "1");
        }

        if (shouldUpdate) {
            router.push(`?${params.toString()}`, { scroll: false });
        }
    }, [priceIconState, dateIconState, router, searchParams]);

    const toggleFilters = () => setIsFiltersOpen((prev) => !prev);
    const toggleFormatsExpanded = () => setIsFormatsExpanded((prev) => !prev);
    const toggleThemesExpanded = () => setIsThemesExpanded((prev) => !prev);

    const handleFormatToggle = (formatId: number) => {
        const newPendingFormats = pendingFormats.includes(formatId)
            ? pendingFormats.filter((id) => id !== formatId)
            : [...pendingFormats, formatId];

        setPendingFormats(newPendingFormats);

        const params = new URLSearchParams(searchParams.toString());
        if (newPendingFormats.length > 0) {
            params.set("formats", newPendingFormats.join(","));
        } else {
            params.delete("formats");
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleThemeToggle = (themeId: number) => {
        setPendingThemes((prev) =>
            prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]
        );
    };

    const resetFilters = () => {
        setPendingFormats([]);
        setSelectedThemes([]);
        setPendingThemes([]);
        setStartDate(undefined);
        setPendingStartDate(undefined);
        setEndDate(undefined);
        setPendingEndDate(undefined);
        setPriceRange(undefined);
        setPendingPriceRange(undefined);
        setIsFiltersOpen(false);
        setIsFormatsExpanded(false);
        setIsThemesExpanded(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete("formats");
        params.delete("themes");
        params.delete("startedAt");
        params.delete("endedAt");
        params.delete("minPrice");
        params.delete("maxPrice");
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const applyFilters = () => {
        setSelectedThemes(pendingThemes);
        setStartDate(pendingStartDate);
        setEndDate(pendingEndDate);
        setPriceRange(pendingPriceRange);

        const params = new URLSearchParams(searchParams.toString());

        if (pendingThemes.length > 0) {
            params.set("themes", pendingThemes.join(","));
        } else {
            params.delete("themes");
        }

        if (pendingStartDate) {
            params.set("startedAt", format(pendingStartDate, "yyyy-MM-dd"));
        } else {
            params.delete("startedAt");
        }

        if (pendingEndDate) {
            params.set("endedAt", format(pendingEndDate, "yyyy-MM-dd"));
        } else {
            params.delete("endedAt");
        }

        if (pendingPriceRange) {
            params.set("minPrice", pendingPriceRange[0].toString());
            params.set("maxPrice", pendingPriceRange[1].toString());
        } else {
            params.delete("minPrice");
            params.delete("maxPrice");
        }

        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
        setIsFiltersOpen(false);
    };

    const areFiltersApplied = () => {
        return (
            pendingFormats.length > 0 ||
            selectedThemes.length > 0 ||
            startDate !== undefined ||
            endDate !== undefined ||
            (priceRange !== undefined)
        );
    };

    const removeFormatFilter = (formatId: number) => {
        const newPendingFormats = pendingFormats.filter((id) => id !== formatId);
        setPendingFormats(newPendingFormats);
        const params = new URLSearchParams(searchParams.toString());
        if (newPendingFormats.length > 0) {
            params.set("formats", newPendingFormats.join(","));
        } else {
            params.delete("formats");
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const removeThemeFilter = (themeId: number) => {
        const newSelectedThemes = selectedThemes.filter((id) => id !== themeId);
        setSelectedThemes(newSelectedThemes);
        setPendingThemes(newSelectedThemes);
        const params = new URLSearchParams(searchParams.toString());
        if (newSelectedThemes.length > 0) {
            params.set("themes", newSelectedThemes.join(","));
        } else {
            params.delete("themes");
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const removeStartDateFilter = () => {
        setStartDate(undefined);
        setPendingStartDate(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("startedAt");
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const removeEndDateFilter = () => {
        setEndDate(undefined);
        setPendingEndDate(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("endedAt");
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const removePriceFilter = () => {
        setPriceRange(undefined); // Сбрасываем диапазон цен
        setPendingPriceRange(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("minPrice");
        params.delete("maxPrice");
        params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const debounceUpdateHeight = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (contentRef.current) {
                    const height = contentRef.current.scrollHeight;
                    const extraHeight = 20;
                    setContentHeight(height + extraHeight);
                } else {
                    setContentHeight(0);
                }
            }, 100);
        };

        const observer = new ResizeObserver(debounceUpdateHeight);

        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        window.addEventListener("resize", debounceUpdateHeight);

        return () => {
            clearTimeout(timeoutId);
            if (contentRef.current) {
                observer.unobserve(contentRef.current);
            }
            window.removeEventListener("resize", debounceUpdateHeight);
        };
    }, [isFiltersOpen, isFormatsExpanded, isThemesExpanded]);

    const hasMoreFormats = formats.length > INITIAL_VISIBLE_FORMATS;
    const hasMoreThemes = themes.length > INITIAL_VISIBLE_THEMES;

    const formatButtonVariants = {
        hidden: {
            opacity: 0,
            width: 0,
            x: -10,
            transition: { duration: 0.3, ease: "easeOut" },
        },
        visible: (index: number) => ({
            opacity: 1,
            width: "auto",
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut",
                delay: index >= INITIAL_VISIBLE_FORMATS ? (index - INITIAL_VISIBLE_FORMATS) * 0.07 : 0,
            },
        }),
        exit: {
            opacity: 0,
            width: 0,
            x: -10,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const themeButtonVariants = {
        hidden: {
            opacity: 0,
            width: 0,
            x: -10,
            transition: { duration: 0.3, ease: "easeOut" },
        },
        visible: (index: number) => ({
            opacity: 1,
            width: "auto",
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut",
                delay: index >= INITIAL_VISIBLE_THEMES ? (index - INITIAL_VISIBLE_THEMES) * 0.07 : 0,
            },
        }),
        exit: (index: number) => ({
            opacity: 0,
            width: 0,
            x: -10,
            transition: {
                duration: 0.3,
                ease: "easeOut",
                delay: (themes.length - 1 - index) * 0.05,
            },
        }),
    };

    const togglePriceIconState = () => {
        setPriceIconState((prev) => {
            if (prev === "upDown") return "down";
            if (prev === "down") return "up";
            return "upDown";
        });
        setDateIconState("upDown");
    };

    const toggleDateIconState = () => {
        setDateIconState((prev) => {
            if (prev === "upDown") return "down";
            if (prev === "down") return "up";
            return "upDown";
        });
        setPriceIconState("upDown");
    };

    return (
        <div className="px-custom px-4 py-4 border-b sticky top-[68px] bg-background/95 backdrop-blur-md z-20 max-w-full">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <div className="flex flex-wrap gap-2 items-center min-w-0">
                        {!areFiltersApplied() ? (
                            <>
                                <AnimatePresence initial={false}>
                                    {[...formats]
                                        .sort((a, b) => {
                                            const aIsSelected = pendingFormats.includes(a.id);
                                            const bIsSelected = pendingFormats.includes(b.id);
                                            if (aIsSelected && !bIsSelected) return -1;
                                            if (!aIsSelected && bIsSelected) return 1;
                                            return formats.indexOf(a) - formats.indexOf(b);
                                        })
                                        .map((format, index) => {
                                            const isExtra = index >= INITIAL_VISIBLE_FORMATS;
                                            const isVisible = !isExtra || isFormatsExpanded;

                                            return (
                                                isVisible && (
                                                    <motion.div
                                                        key={format.id}
                                                        custom={index}
                                                        variants={formatButtonVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        className="format-button-wrapper inline-block"
                                                    >
                                                        <Button
                                                            variant={pendingFormats.includes(format.id) ? "default" : "outline"}
                                                            className="cursor-pointer whitespace-nowrap rounded-full px-5 py-1"
                                                            onClick={() => handleFormatToggle(format.id)}
                                                        >
                                                            {format.title}
                                                        </Button>
                                                    </motion.div>
                                                )
                                            );
                                        })}
                                </AnimatePresence>
                                {hasMoreFormats && (
                                    <motion.div
                                        className="format-button-wrapper inline-block"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } }}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="cursor-pointer flex items-center gap-1 rounded-full px-5 py-1"
                                            onClick={toggleFormatsExpanded}
                                        >
                                            {isFormatsExpanded ? (
                                                <ChevronLeft strokeWidth={2.5} />
                                            ) : (
                                                <ChevronRight strokeWidth={2.5} />
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-wrap gap-2 items-center">
                                {pendingFormats.map((formatId) => {
                                    const format = formats.find((f) => f.id === formatId);
                                    return format ? (
                                        <div
                                            key={formatId}
                                            className="inline-flex items-center gap-1 border rounded-full px-3 py-1"
                                        >
                                            <span className="text-sm">{format.title}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-0 h-6 w-6"
                                                onClick={() => removeFormatFilter(formatId)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : null;
                                })}

                                {selectedThemes.map((themeId) => {
                                    const theme = themes.find((t) => t.id === themeId);
                                    return theme ? (
                                        <div
                                            key={themeId}
                                            className="inline-flex items-center gap-1 border rounded-full px-3 py-1"
                                        >
                                            <span className="text-sm">{theme.title}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-0 h-6 w-6"
                                                onClick={() => removeThemeFilter(themeId)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : null;
                                })}

                                {startDate && (
                                    <div className="inline-flex items-center gap-1 border rounded-full px-3 py-1">
                                        <span className="">From: {format(startDate, "PPP")}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 h-6 w-6"
                                            onClick={removeStartDateFilter}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}

                                {endDate && (
                                    <div className="inline-flex items-center gap-1 border rounded-full px-3 py-1">
                                        <span className="text-sm">To: {format(endDate, "PPP")}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 h-6 w-6"
                                            onClick={removeEndDateFilter}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}

                                {priceRange && (
                                    <div className="inline-flex items-center gap-1 border rounded-full px-3 py-1">
                                        <span className="text-sm">${priceRange[0]} - ${priceRange[1]}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 h-6 w-6"
                                            onClick={removePriceFilter}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    className="cursor-pointer flex items-center gap-1 rounded-full px-5 py-1"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row gap-1">
                    <TooltipProvider>
                        <div className="flex-shrink-0 self-start">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="cursor-pointer flex items-center justify-start gap-2 rounded-full !px-3 !py-2"
                                        onClick={toggleDateIconState}
                                    >
                                        {dateIconState === "upDown" && (
                                            <Calendar strokeWidth={2} className="!w-5.5 !h-5.5" />
                                        )}
                                        {dateIconState === "down" && (
                                            <CalendarArrowDown strokeWidth={2} className="!w-5.5 !h-5.5" />
                                        )}
                                        {dateIconState === "up" && (
                                            <CalendarArrowUp strokeWidth={2} className="!w-5.5 !h-5.5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {dateIconState === "upDown" && <p>Sort by date</p>}
                                    {dateIconState === "down" && <p>Sort by date (ascending)</p>}
                                    {dateIconState === "up" && <p>Sort by date (descending)</p>}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex-shrink-0 self-start">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="cursor-pointer flex items-center justify-start gap-2 rounded-full !px-3 !py-2"
                                        onClick={togglePriceIconState}
                                    >
                                        {priceIconState === "upDown" && (
                                            <TrendingUpDown strokeWidth={2} className="!w-5.5 !h-5.5" />
                                        )}
                                        {priceIconState === "down" && (
                                            <TrendingDown strokeWidth={2} className="!w-5.5 !h-5.5" />
                                        )}
                                        {priceIconState === "up" && (
                                            <TrendingUp strokeWidth={2} className="!w-5.5 !h-5.5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {priceIconState === "upDown" && <p>Sort by price</p>}
                                    {priceIconState === "down" && <p>Sort by price (ascending)</p>}
                                    {priceIconState === "up" && <p>Sort by price (descending)</p>}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex-shrink-0 self-start">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="cursor-pointer flex items-center justify-start gap-2 rounded-full !px-3 !py-2"
                                        onClick={toggleFilters}
                                    >
                                        <SlidersHorizontal strokeWidth={2} className="!w-5.5 !h-5.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>More options</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                </div>
            </div>
            <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                    maxHeight: isFiltersOpen ? `${contentHeight}px` : "0px",
                    opacity: isFiltersOpen ? 1 : 0,
                    visibility: isFiltersOpen ? "visible" : "hidden",
                }}
            >
                <div ref={contentRef} className="pt-4">
                    <hr className="mt-4 border-t" />
                    <div className="mt-4 flex flex-col gap-6">
                        {areFiltersApplied() && (
                            <div className="w-full">
                                <div className="flex flex-wrap items-center gap-2 max-w-full">
                                    <span className="font-semibold">Formats</span>
                                    <AnimatePresence initial={false}>
                                        {[...formats]
                                            .sort((a, b) => {
                                                const aIsSelected = pendingFormats.includes(a.id);
                                                const bIsSelected = pendingFormats.includes(b.id);
                                                if (aIsSelected && !bIsSelected) return -1;
                                                if (!aIsSelected && bIsSelected) return 1;
                                                return formats.indexOf(a) - formats.indexOf(b);
                                            })
                                            .map((format, index) => {
                                                const isExtra = index >= INITIAL_VISIBLE_FORMATS;
                                                const isVisible = !isExtra || isFormatsExpanded;

                                                return (
                                                    isVisible && (
                                                        <motion.div
                                                            key={format.id}
                                                            custom={index}
                                                            variants={formatButtonVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            className="format-button-wrapper inline-block"
                                                        >
                                                            <Button
                                                                variant={pendingFormats.includes(format.id) ? "default" : "outline"}
                                                                className="cursor-pointer rounded-full whitespace-nowrap"
                                                                onClick={() => handleFormatToggle(format.id)}
                                                            >
                                                                {format.title}
                                                            </Button>
                                                        </motion.div>
                                                    )
                                                );
                                            })}
                                    </AnimatePresence>
                                    {hasMoreFormats && (
                                        <motion.div
                                            className="format-button-wrapper inline-block"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } }}
                                        >
                                            <Button
                                                variant="ghost"
                                                className="cursor-pointer flex items-center gap-1 rounded-full px-5 py-1"
                                                onClick={toggleFormatsExpanded}
                                            >
                                                {isFormatsExpanded ? (
                                                    <ChevronLeft strokeWidth={2.5} />
                                                ) : (
                                                    <ChevronRight strokeWidth={2.5} />
                                                )}
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="w-full">
                            <div className="flex flex-wrap items-center gap-2 max-w-full">
                                {areFiltersApplied() && <span className="font-semibold">Themes</span>}
                                <AnimatePresence initial={false}>
                                    {[...themes]
                                        .sort((a, b) => {
                                            const aIsSelected = pendingThemes.includes(a.id);
                                            const bIsSelected = pendingThemes.includes(b.id);
                                            if (aIsSelected && !bIsSelected) return -1;
                                            if (!aIsSelected && bIsSelected) return 1;
                                            return themes.indexOf(a) - themes.indexOf(b);
                                        })
                                        .map((theme, index) => {
                                            const isExtra = index >= INITIAL_VISIBLE_THEMES;
                                            const isVisible = !isExtra || isThemesExpanded;

                                            return (
                                                isVisible && (
                                                    <motion.div
                                                        key={theme.id}
                                                        custom={index}
                                                        variants={themeButtonVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        className="theme-button-wrapper inline-block"
                                                    >
                                                        <Button
                                                            variant={pendingThemes.includes(theme.id) ? "default" : "outline"}
                                                            className="cursor-pointer rounded-full whitespace-nowrap"
                                                            onClick={() => handleThemeToggle(theme.id)}
                                                        >
                                                            {theme.title}
                                                        </Button>
                                                    </motion.div>
                                                )
                                            );
                                        })}
                                </AnimatePresence>
                                {hasMoreThemes && (
                                    <motion.div
                                        className="theme-button-wrapper inline-block"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } }}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="cursor-pointer flex items-center gap-1 rounded-full px-5 py-1"
                                            onClick={toggleThemesExpanded}
                                        >
                                            {isFormatsExpanded ? (
                                                <ChevronLeft strokeWidth={2.5} />
                                            ) : (
                                                <ChevronRight strokeWidth={2.5} />
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 lg:gap-8 w-full">
                            <div className="flex-shrink-0 w-full md:w-auto">
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="cursor-pointer w-[180px] font-semibold flex items-center gap-2 justify-start text-left"
                                            >
                                                <CalendarIcon
                                                    strokeWidth={2.5}
                                                    className="h-4 w-4 mr-1 flex-shrink-0"
                                                    style={{ color: "#727272" }}
                                                />
                                                <span className="truncate">
                                                    {pendingStartDate ? format(pendingStartDate, "PPP") : "Start Date"}
                                                </span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-auto p-0">
                                            <CalendarForm
                                                mode="single"
                                                selected={pendingStartDate}
                                                onSelect={setPendingStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Label className="text-sm text-gray-700">to</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="cursor-pointer w-[180px] font-semibold flex items-center gap-2 justify-start text-left"
                                            >
                                                <CalendarIcon
                                                    strokeWidth={2.5}
                                                    className="h-4 w-4 mr-1 flex-shrink-0"
                                                    style={{ color: "#727272" }}
                                                />
                                                <span className="truncate">
                                                    {pendingEndDate ? format(pendingEndDate, "PPP") : "End Date"}
                                                </span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-auto p-0">
                                            <CalendarForm
                                                mode="single"
                                                selected={pendingEndDate}
                                                onSelect={setPendingEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="mt-4 flex-grow w-full md:w-auto flex flex-col gap-2 min-w-[300px] max-w-[300px]">
                                <Slider
                                    value={pendingPriceRange || [minPrice, maxPrice]}
                                    onValueChange={(value) => setPendingPriceRange(value)}
                                    min={minPrice}
                                    max={maxPrice}
                                    step={1}
                                    className="cursor-pointer w-full"
                                />
                                <span className="text-sm font-medium text-gray-700 text-center w-full">
                                    ${pendingPriceRange ? pendingPriceRange[0] : minPrice} - $
                                    {pendingPriceRange ? pendingPriceRange[1] : maxPrice}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button onClick={applyFilters} className="cursor-pointer rounded-full px-5 py-1">
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}