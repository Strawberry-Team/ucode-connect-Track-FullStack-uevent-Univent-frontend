"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
    initialCompany: { name: string; status: string } | null;
};

export default function CompanyCard({ initialCompany }: CompanyCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    return (
        <>
            <Card className="shadow-lg transition-all duration-300 hover:shadow-xl h-[266px] flex flex-col">
                <CardContent className="flex-1 flex flex-col">
                    <div className="border-b">
                        <CardHeader className="text-xl font-medium text-foreground">Company</CardHeader>
                    </div>
                    <div className="mt-2 flex-1 flex items-center justify-center px-4">
                        {initialCompany ? (
                            <div className="text-center">
                                <p className="text-[25px] font-medium">{initialCompany.name}</p>
                                <p className="text-base text-foreground/80">{initialCompany.status}</p>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                className="size-full flex items-center justify-center gap-2 bg-transparent hover:bg-transparent text-foreground relative group pointer-events-none"
                                onClick={() => {
                                    setIsModalOpen(true);
                                    setIsClicked(true);
                                }}
                            >
                                <span
                                    className={cn(
                                        "z-10 absolute left-0 top-0 w-8 h-8 flex flex-col transition-all duration-300",
                                        !isClicked && "group-hover:left-10 group-hover:top-10",
                                        isClicked && "left-0 top-0"
                                    )}
                                >
                                    <span className="w-8 h-3 bg-foreground/50 rounded-r-md rounded-tl-2xl" />
                                    <span className="w-2 h-8 bg-foreground/50 rounded-b-md" />
                                </span>
                                <span
                                    className={cn(
                                        "z-10 absolute right-0 top-0 w-8 h-8 flex flex-col items-end transition-all duration-300",
                                        !isClicked && "group-hover:right-10 group-hover:top-10",
                                        isClicked && "right-0 top-0"
                                    )}
                                >
                                    <span className="w-8 h-3 bg-foreground/50 rounded-l-md rounded-tr-2xl" />
                                    <span className="w-2 h-8 bg-foreground/50 rounded-b-md" />
                                </span>
                                <span
                                    className={cn(
                                        "z-10 absolute left-0 bottom-0 w-8 h-8 flex flex-col justify-end transition-all duration-300",
                                        !isClicked && "group-hover:left-10 group-hover:bottom-10",
                                        isClicked && "left-0 bottom-0"
                                    )}
                                >
                                    <span className="w-2 h-8 bg-foreground/50 rounded-t-md" />
                                    <span className="w-8 h-3 bg-foreground/50 rounded-r-md rounded-bl-2xl" />
                                </span>
                                <span
                                    className={cn(
                                        "z-10 absolute right-0 bottom-0 w-8 h-8 flex flex-col items-end justify-end transition-all duration-300",
                                        !isClicked && "group-hover:right-10 group-hover:bottom-10",
                                        isClicked && "right-0 bottom-0"
                                    )}
                                >
                                    <span className="w-2 h-8 bg-foreground/50 rounded-t-md" />
                                    <span className="w-8 h-3 bg-foreground/50 rounded-l-md rounded-br-2xl" />
                                </span>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div
                                        className="absolute left-10 top-10 right-10 bottom-10 group-hover:bg-gray-100 rounded-md pointer-events-auto z-0 overflow-hidden"
                                        onClick={(e) => {
                                            const ripple = document.createElement("span");
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;
                                            ripple.style.position = "absolute";
                                            ripple.style.left = `${x}px`;
                                            ripple.style.top = `${y}px`;
                                            ripple.style.transform = "translate(-50%, -50%)";
                                            ripple.style.width = "0px";
                                            ripple.style.height = "0px";
                                            ripple.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
                                            ripple.style.borderRadius = "50%";
                                            ripple.style.pointerEvents = "none";
                                            ripple.style.animation = "ripple 600ms linear";
                                            e.currentTarget.appendChild(ripple);
                                            ripple.addEventListener("animationend", () => ripple.remove());
                                        }}
                                    >
                                        <style>
                                            {`
                                                @keyframes ripple {
                                                    0% {
                                                        width: 0;
                                                        height: 0;
                                                        opacity: 0.5;
                                                    }
                                                    100% {
                                                        width: 200px;
                                                        height: 200px;
                                                        opacity: 0;
                                                    }
                                                }
                                            `}
                                        </style>
                                    </div>
                                    <div className="text-[25px] flex items-center gap-2 z-10">
                                        <Plus className="!h-8 !w-8" />
                                        Create company
                                    </div>
                                </div>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Модальное окно */}
            <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) setIsClicked(false);
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Company</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-center text-foreground/60">This is a placeholder modal.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}