"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CalendarIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function EventFilters() {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [contentHeight, setContentHeight] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const toggleFilters = () => setIsFiltersOpen((prev) => !prev);

    const handleFormatToggle = (format: string) => {
        setSelectedFormats((prev) =>
            prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
        );
    };

    const handleThemeToggle = (theme: string) => {
        setSelectedThemes((prev) =>
            prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
        );
    };

    // Функция сброса фильтров
    const resetFilters = () => {
        setSelectedFormats([]);
        setSelectedThemes([]);
        setDateFrom(undefined);
        setDateTo(undefined);
        setPriceRange([0, 100]);
        setIsFiltersOpen(false);
    };

    useEffect(() => {
        const updateHeight = () => {
            if (contentRef.current) {
                const height = contentRef.current.scrollHeight;
                const extraHeight = 20;
                setContentHeight(height + extraHeight);
            }
        };

        updateHeight();

        window.addEventListener("resize", updateHeight);

        return () => window.removeEventListener("resize", updateHeight);
    }, [isFiltersOpen]);

    return (
        <div className="px-custom px-4 py-4 border-b sticky top-[68px] bg-background/95 backdrop-blur-md z-20 max-w-full">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {["Concert", "Workshop", "Festival", "Exhibition"].map((format) => (
                        <Button
                            key={format}
                            variant={selectedFormats.includes(format) ? "default" : "outline"}
                            className="cursor-pointer rounded-full"
                            onClick={() => handleFormatToggle(format)}
                        >
                            {format}
                        </Button>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    className="cursor-pointer flex items-center gap-2"
                    onClick={toggleFilters}
                >
                    More Filters
                    {isFiltersOpen ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </Button>
            </div>

            <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                    height: isFiltersOpen ? `${contentHeight}px` : "0px",
                    opacity: isFiltersOpen ? 1 : 0,
                }}
            >
                <div ref={contentRef}>
                    <hr className="mt-4 border-t border-gray-300" />
                    <div className="mt-4 flex flex-wrap gap-6 lg:gap-8">
                        {/* Темы */}
                        <div className="flex-shrink-0">
                            <div className="flex gap-2">
                                {["Art", "Science", "Music", "Tech"].map((theme) => (
                                    <Button
                                        key={theme}
                                        variant={selectedThemes.includes(theme) ? "default" : "outline"}
                                        className="cursor-pointer rounded-full"
                                        onClick={() => handleThemeToggle(theme)}
                                    >
                                        {theme}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Фильтр по дате */}
                        <div className="flex-shrink-0 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="cursor-pointer w-[180px] font-semibold flex items-center gap-2"
                                        >
                                            <CalendarIcon
                                                strokeWidth={2.5}
                                                className="h-4 w-4"
                                                style={{ color: "#727272" }}
                                            />
                                            {dateFrom ? format(dateFrom, "PPP") : "Start date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateFrom}
                                            onSelect={(date) => setDateFrom(date)}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Label className="text-sm text-gray-700">to</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="cursor-pointer w-[180px] font-semibold flex items-center gap-2"
                                        >
                                            <CalendarIcon
                                                strokeWidth={2.5}
                                                className="h-4 w-4"
                                                style={{ color: "#727272" }}
                                            />
                                            {dateTo ? format(dateTo, "PPP") : "End date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateTo}
                                            onSelect={(date) => setDateTo(date)}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Ценовая полоска */}
                        <div className="mt-4 flex-grow w-full md:w-auto flex flex-col gap-2">
                            <div className="flex items-center">
                                <Slider
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="cursor-pointer min-w-[300px] max-w-[300px]"
                                />
                            </div>
                            <span className="text-sm font-medium -mt-1.5 text-gray-700 text-center min-w-[300px] max-w-[300px]">
                Price: {priceRange[0]} - {priceRange[1]} $
              </span>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </Button>
                        <Button
                            onClick={() => {
                                console.log({
                                    formats: selectedFormats,
                                    themes: selectedThemes,
                                    dateRange: { from: dateFrom, to: dateTo },
                                    priceRange,
                                });
                                setIsFiltersOpen(false);
                            }}
                            className="cursor-pointer"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}