import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { NavUser } from "@/components/calendar/NavUser";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CustomToolbarFullCalendar() {
    const user = null; // Замени на реальный источник данных, если есть

    return (
        <header className="z-30 px-custom sticky top-0 flex h-17 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 w-full relative">
                {/* Логотип и название слева */}
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="h-13 w-13 rounded-lg shrink-0">
                        <AvatarImage src="/logo_favicon.png" alt="Логотип" />
                    </Avatar>
                    <span className="text-[24px] font-medium">Calendula</span>
                </Link>

                {/* Поле поиска в центре */}
                <div className="flex-1 flex justify-center">
                    <Input
                        type="text"
                        placeholder="Find events..."
                        className="text-[16px] py-5 px-5 font-medium w-full max-w-md rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <Button
                    variant="outline"
                    className="text-[16px] py-5 px-7 rounded-full font-medium"
                >
                    Create company
                </Button>

                {/* Пользователь или кнопка Sign up справа */}
                <div>
                    {user ? (
                        // Предполагаем, что NavUser будет позже добавлен
                        <div>NavUser Placeholder</div>
                    ) : (
                        <Button
                            variant="outline"
                            className="text-[16px] py-5 px-7 rounded-full font-medium"
                        >
                            Sign up
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}