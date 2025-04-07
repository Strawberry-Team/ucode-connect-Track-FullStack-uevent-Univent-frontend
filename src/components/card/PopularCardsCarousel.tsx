"use client"; // Указываем, что это клиентский компонент

import Image from "next/image";
import {CalendarDays, Guitar, MapPinned, Palette} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LogoImage from "@/assets/logo_white.png";
import Solo from "@/assets/solo.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation"; // Заменяем useNavigate

const PopularCardsCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState<number>(1);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
    const popularCards: undefined[] = Array.from({ length: 4 });
    const totalSlides: number = popularCards.length;
    const isProcessingRef = useRef<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Автоматическое переключение каждые 5 секунд
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused]);

    // Плавный переход для бесконечной карусели
    const getTranslateX = (): string => {
        return `translateX(-${currentIndex * 100}%)`;
    };

    // Обработчики для кнопок с защитой от множественных кликов
    const handlePrev = (): void => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setCurrentIndex((prevIndex) => prevIndex - 1);
        setTimeout(() => (isProcessingRef.current = false), 500);
    };

    const handleNext = (): void => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setTimeout(() => (isProcessingRef.current = false), 500);
    };

    // Обработчики наведения и ухода мыши
    const handleMouseEnter = (): void => {
        setIsPaused(true);
    };

    const handleMouseLeave = (): void => {
        setIsPaused(false);
    };


    const handleCardClick = (index: number) => {
        router.push(
            `/products/${index + 1}`
        );
    };

    // Сброс позиции для бесконечного цикла
    useEffect(() => {
        if (currentIndex === totalSlides + 1) {
            setIsTransitioning(true);
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(1);
                setTimeout(() => setIsTransitioning(true), 50);
            }, 500);
            return () => clearTimeout(timeout);
        } else if (currentIndex === 0) {
            setIsTransitioning(true);
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(totalSlides);
                setTimeout(() => setIsTransitioning(true), 50);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, totalSlides]);

    // Нормализация индекса для индикаторов
    const getIndicatorIndex = (): number => {
        if (currentIndex === 0) return totalSlides - 1;
        if (currentIndex === totalSlides + 1) return 0;
        return currentIndex - 1;
    };

    return (
        <div
            className="px-custom w-full relative z-10"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Контейнер для карточки */}
            <div className="mt-4 overflow-hidden rounded-lg relative">
                <div
                    className={`flex ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
                    style={{ transform: getTranslateX() }}
                >
                    {/* Дубликат последней карточки (4-й) для обратного перехода */}
                    <div key="duplicate-last" className="w-full flex-shrink-0">
                        <Card
                            className="w-full h-[400px] relative border-none cursor-pointer"
                            onClick={() => handleCardClick(3)} // Индекс 3 для Ticket 4
                        >
                            <Image
                                src={Solo}
                                alt={`Ticket 4`}
                                layout="fill"
                                objectFit="cover"
                                className="absolute inset-0 brightness-50 group-hover:brightness-65 transition-all duration-300"
                            />
                            <CardContent className="relative h-full flex items-center justify-between p-8">
                                <div className="flex flex-col gap-3 text-white max-w-[50%]">
                                    <h3 className="text-2xl font-bold">
                                        Ticket 4
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-base flex items-center gap-1.5">
                                            <Guitar strokeWidth={2} className="w-4 h-4 text-white" /> Concert
                                            <Palette strokeWidth={2} className="w-4 h-4 text-white" /> Nauka, Isskusstvo
                                        </p>
                                        <p className="text-base flex items-center gap-1.5">
                                            <CalendarDays strokeWidth={2} className="w-4 h-4 text-white" /> March 16th, 2025, 10:00
                                        </p>
                                        <p className="text-base flex items-center gap-1.5">
                                            <MapPinned strokeWidth={2} className="w-4 h-4 text-white" /> Lviv
                                        </p>
                                    </div>
                                    <p className="text-xl font-semibold">
                                        40.00 - 80.00$
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Оригинальные карточки */}
                    {popularCards.map((_, index) => (
                        <div key={`original-${index}`} className="w-full flex-shrink-0">
                            <Card
                                className="w-full h-[400px] relative border-none cursor-pointer group"
                                onClick={() => handleCardClick(index)}
                            >
                                <Image
                                    src={Solo}
                                    alt={`Ticket ${index + 1}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className="absolute inset-0 brightness-50 group-hover:brightness-65 transition-all duration-300"
                                />
                                <CardContent className="relative h-full flex items-center justify-between p-8">
                                    <div className="flex flex-col gap-3 text-white max-w-[50%]">
                                        <h3 className="text-2xl font-bold">
                                            Ticket {index + 1}
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-base flex items-center gap-1.5">
                                                <Guitar strokeWidth={2} className="w-4 h-4 text-white" /> Concert
                                                <Palette strokeWidth={2} className="w-4 h-4 text-white" /> Nauka, Isskusstvo
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <CalendarDays strokeWidth={2} className="w-4 h-4 text-white" /> March 16th, 2025, 10:00
                                            </p>
                                            <p className="text-base flex items-center gap-1.5">
                                                <MapPinned strokeWidth={2} className="w-4 h-4 text-white" /> Lviv
                                            </p>
                                        </div>
                                        <p className="text-xl font-semibold">
                                            {(index + 1) * 10}.00 - {(index + 1) * 20}.00 $
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                    {/* Дубликат первой карточки для перехода вперед */}
                    <div key="duplicate-0" className="w-full flex-shrink-0">
                        <Card
                            className="w-full h-[400px] relative border-none cursor-pointer"
                            onClick={() => handleCardClick(0)} // Индекс 0 для Ticket 1
                        >
                            <Image
                                src={Solo}
                                alt={`Ticket 1`}
                                layout="fill"
                                objectFit="cover"
                                className="absolute inset-0 brightness-50 group-hover:brightness-65 transition-all duration-300"
                            />
                            <CardContent className="relative h-full flex items-center justify-between p-8">
                                <div className="flex flex-col gap-3 text-white max-w-[50%]">
                                    <h3 className="text-2xl font-bold">
                                        Ticket 1
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-base flex items-center gap-1.5">
                                            <Guitar strokeWidth={2} className="w-4 h-4 text-white" /> Concert
                                            <Palette strokeWidth={2} className="w-4 h-4 text-white" /> Nauka, Isskusstvo
                                        </p>
                                        <p className="text-base flex items-center gap-1.5">
                                            <CalendarDays strokeWidth={2} className="w-4 h-4 text-white" /> March 16th, 2025, 10:00
                                        </p>
                                        <p className="text-base flex items-center gap-1.5">
                                            <MapPinned strokeWidth={2} className="w-4 h-4 text-white" /> Lviv
                                        </p>
                                    </div>
                                    <p className="text-xl font-semibold">
                                        10.00 - 20.00 $
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                {/* Кнопки вне прокручиваемого контейнера */}
                <div className="cursor-pointer absolute right-13 bottom-15 flex flex-row gap-2 z-20">
                    <Button
                        onClick={handlePrev}
                        variant="outline"
                        className="cursor-pointer border-none bg-background/10 hover:bg-background/15"
                    >
                        <ChevronLeft strokeWidth={3} className="w-6 h-6 text-white" />
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="outline"
                        className="cursor-pointer border-none bg-background/10 hover:bg-background/15"
                    >
                        <ChevronRight strokeWidth={3} className="w-6 h-6 text-white" />
                    </Button>
                </div>
            </div>

            {/* Индикаторы (полоски) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {popularCards.map((_, index) => (
                    <div
                        key={index}
                        className={`w-6 h-1 rounded ${
                            getIndicatorIndex() === index ? "bg-red-500" : "bg-gray-400"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PopularCardsCarousel;