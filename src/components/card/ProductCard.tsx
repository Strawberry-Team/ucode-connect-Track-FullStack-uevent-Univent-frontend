"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoImage from "@/assets/logo_white.png";
import { Card, CardContent } from "@/components/ui/card";
import {CalendarDays, Guitar, MapPinned, Palette, Tag} from "lucide-react";

interface ProductCardProps {
    index: number;
}

const ProductCard = ({ index }: ProductCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(
            `/products/${index + 1}`
        );
    };

    return (
        <Card
            className="cursor-pointer w-full bg-white flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-2xl"
            onClick={handleClick}
        >
            <Image
                src={LogoImage}
                alt="Ticket"
                width={300}
                height={192}
                className="h-48 w-full object-contain"
            />
            {/* Контент карточки */}
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 ">
                        Ticket {index + 1}
                    </h3>
                    <div className="flex flex-col gap-1 text-gray-700">
                        <p className="text-sm font-medium flex items-center gap-1">
                            <Tag strokeWidth={2.5} className="w-4 h-4"/>
                            Concert • Nauka, Isskusstvo
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                            <CalendarDays strokeWidth={2.5} className="w-4 h-4" /> March 16th, 2025, 10:00
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                            <MapPinned strokeWidth={2.5} className="w-4 h-4" /> Lviv
                        </p>
                    </div>
                </div>
                <div className="mt-2">
                    <span className="text-xl font-bold text-gray-900">
                        {(index + 1) * 10}.00 - {(index + 1) * 20}.00 $
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;