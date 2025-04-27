"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
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
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getEventFormats } from "@/lib/format";
import { getThemes } from "@/lib/theme";
import { EventFormat, Theme } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export default function EventFilters() {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isFormatsExpanded, setIsFormatsExpanded] = useState(false);
    const [isThemesExpanded, setIsThemesExpanded] = useState(false);
    const [formats, setFormats] = useState<EventFormat[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedFormats, setSelectedFormats] = useState<number[]>([]);
    const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
    const [pendingThemes, setPendingThemes] = useState<number[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [pendingStartDate, setPendingStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [pendingEndDate, setPendingEndDate] = useState<Date | undefined>(undefined);
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [pendingPriceRange, setPendingPriceRange] = useState([0, 100]);
    const [contentHeight, setContentHeight] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    const INITIAL_VISIBLE_FORMATS = 5;
    const INITIAL_VISIBLE_THEMES = 5;

    useEffect(() => {
        const fetchFilters = async () => {
            const formatsResponse = await getEventFormats();
            if (formatsResponse.success && formatsResponse.data) {
                setFormats(formatsResponse.data);
            } else {
                console.error("Failed to load formats:", formatsResponse.errors);
                setFormats([]);
            }

            const themesResponse = await getThemes();
            if (themesResponse.success && themesResponse.data) {
                setThemes(themesResponse.data);
            } else {
                console.error("Failed to load themes:", themesResponse.errors);
                setThemes([]);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const formatId = searchParams.get("formatId");
        const themesParam = searchParams.get("themes");
        const startDateParam = searchParams.get("startedAt");
        const endDateParam = searchParams.get("endedAt");
        const priceMinParam = searchParams.get("priceMin");
        const priceMaxParam = searchParams.get("priceMax");

        if (formatId) {
            setSelectedFormats([Number(formatId)]);
        } else {
            setSelectedFormats([]);
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
            setPriceRange([0, 100]);
            setPendingPriceRange([0, 100]);
        }
    }, [searchParams]);

    const toggleFilters = () => setIsFiltersOpen((prev) => !prev);
    const toggleFormatsExpanded = () => setIsFormatsExpanded((prev) => !prev);
    const toggleThemesExpanded = () => setIsThemesExpanded((prev) => !prev);

    const handleFormatToggle = (formatId: number) => {
        const newSelectedFormats = selectedFormats.includes(formatId)
            ? selectedFormats.filter((id) => id !== formatId)
            : [formatId];

        setSelectedFormats(newSelectedFormats);

        const params = new URLSearchParams(searchParams.toString());
        if (newSelectedFormats.length > 0) {
            params.set("formatId", newSelectedFormats[0].toString());
        } else {
            params.delete("formatId");
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const handleThemeToggle = (themeId: number) => {
        setPendingThemes((prev) =>
            prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]
        );
    };

    const resetFilters = () => {
        setSelectedFormats([]);
        setSelectedThemes([]);
        setPendingThemes([]);
        setStartDate(undefined);
        setPendingStartDate(undefined);
        setEndDate(undefined);
        setPendingEndDate(undefined);
        setPriceRange([0, 100]);
        setPendingPriceRange([0, 100]);
        setIsFiltersOpen(false);
        setIsFormatsExpanded(false);
        setIsThemesExpanded(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete("formatId");
        params.delete("themes");
        params.delete("startedAt");
        params.delete("endedAt");
        params.delete("priceMin");
        params.delete("priceMax");
        params.set("page", "1");
        router.push(`?${params.toString()}`);
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

        if (pendingPriceRange[0] !== 0 || pendingPriceRange[1] !== 100) {
            params.set("priceMin", pendingPriceRange[0].toString());
            params.set("priceMax", pendingPriceRange[1].toString());
        } else {
            params.delete("priceMin");
            params.delete("priceMax");
        }

        params.set("page", "1");
        router.push(`?${params.toString()}`);
        setIsFiltersOpen(false);
    };

    const areFiltersApplied = () => {
        return (
            selectedFormats.length > 0 ||
            selectedThemes.length > 0 ||
            startDate !== undefined ||
            endDate !== undefined ||
            (priceRange[0] !== 0 || priceRange[1] !== 100)
        );
    };

    const removeFormatFilter = () => {
        setSelectedFormats([]);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("formatId");
        params.set("page", "1");
        router.push(`?${params.toString()}`);
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
        router.push(`?${params.toString()}`);
    };

    const removeStartDateFilter = () => {
        setStartDate(undefined);
        setPendingStartDate(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("startedAt"); // Меняем dateFrom на startedAt
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const removeEndDateFilter = () => {
        setEndDate(undefined);
        setPendingEndDate(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("endedAt");
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const removePriceFilter = () => {
        setPriceRange([0, 100]);
        setPendingPriceRange([0, 100]);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("priceMin");
        params.delete("priceMax");
        params.set("page", "1");
        router.push(`?${params.toString()}`);
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

    return (
        <div className="px-custom px-4 py-4 border-b sticky top-[68px] bg-background/95 backdrop-blur-md z-20 max-w-full">
            <div className="flex items-center justify-between gap-4 flex-nowrap">
                <div className="flex flex-wrap gap-2 items-center min-w-0">
                    {!areFiltersApplied() ? (
                        <>
                            <AnimatePresence initial={false}>
                                {formats.map((format, index) => {
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
                                                    variant={selectedFormats.includes(format.id) ? "default" : "outline"}
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
                            {selectedFormats.length > 0 && (
                                <div className="inline-flex items-center gap-1 border rounded-full px-3 py-1">
                                    <span className="text-sm">
                                        {formats.find((f) => f.id === selectedFormats[0])?.title}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-0 h-6 w-6"
                                        onClick={removeFormatFilter}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

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
                                    <span className="text-sm">From: {format(startDate, "PPP")}</span>
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

                            {(priceRange[0] !== 0 || priceRange[1] !== 100) && (
                                <div className="inline-flex items-center gap-1 border rounded-full px-3 py-1">
                                    <span className="text-sm">Price: ${priceRange[0]} - ${priceRange[1]}</span>
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

                <div className="flex-shrink-0">
                    <Button
                        variant="ghost"
                        className="cursor-pointer flex items-center gap-2 rounded-full px-18 py-1"
                        onClick={toggleFilters}
                    >
                        <SlidersHorizontal strokeWidth={2} className="!w-5.5 !h-5.5" />
                    </Button>
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
                                        {formats.map((format, index) => {
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
                                                            variant={selectedFormats.includes(format.id) ? "default" : "outline"}
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
                                    {themes.map((theme, index) => {
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
                                            <Calendar
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
                                            <Calendar
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
                                    value={pendingPriceRange}
                                    onValueChange={setPendingPriceRange}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="cursor-pointer w-full"
                                />
                                <span className="text-sm font-medium text-gray-700 text-center w-full">
                                    ${pendingPriceRange[0]} - ${pendingPriceRange[1]}
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