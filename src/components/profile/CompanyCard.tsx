"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building, CalendarDays, Plus, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getUserCompany, Company } from "@/lib/user";
import { deleteCompany } from "@/lib/company";
import { format } from "date-fns";
import ManageCompanyModal from "@/components/company/ManageCompanyModal";
import { showSuccessToast, showErrorToasts } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function CompanyCard() {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    useEffect(() => {
        const fetchCompany = async () => {
            setIsLoading(true);
            const start = Date.now();
            if (user?.id) {
                const result = await getUserCompany(user.id);
                if (result.data !== undefined && result.data !== null) {
                    setCompanies(result.data);
                } else {
                    setCompanies([]);
                }
            }
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsLoading(false);
        };
        fetchCompany();
    }, [user]);

    const handleCompanyCreated = (newCompany: Company) => {
        setCompanies((prev) => [...prev, newCompany]);
    };

    const handleCompanyUpdated = (updatedCompany: Company) => {
        setCompanies((prev) =>
            prev.map((company) =>
                company.id === updatedCompany.id ? updatedCompany : company
            )
        );
    };

    const handleDeleteCompany = async (companyId: number) => {
        const result = await deleteCompany(companyId);
        if (result.success) {
            setCompanies((prev) => prev.filter((company) => company.id !== companyId));
            showSuccessToast("Company deleted successfully");
        } else {
            showErrorToasts(result.errors);
        }
    };

    return (
        <>
            <Card className="shadow-lg transition-all duration-300 hover:shadow-xl h-[220px] flex flex-col">
                <CardContent className="flex-1 flex flex-col">
                    <div className="border-b">
                        <CardHeader className="-px-4 flex items-center justify-between text-xl font-medium text-foreground">
                            <div className="flex items-center">
                                <Building strokeWidth={2.5} className="w-5 h-5 text-gray-500 mr-2" />
                                Company
                            </div>
                            {companies.length > 0 && !isLoading && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Останавливаем переход по Link
                                            setEditingCompany(companies[0]);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <Pencil strokeWidth={2.5} className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Останавливаем переход по Link
                                            handleDeleteCompany(companies[0].id);
                                        }}
                                    >
                                        <Trash strokeWidth={2.5} className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                    </div>
                    <div className="mt-6 flex-1 flex">
                        {isLoading ? (
                            <div className="flex flex-col gap-4 w-full">
                                {Array.from({ length: 1 }).map((_, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <Skeleton className="w-26 h-26 rounded-md" />
                                        <div className="flex flex-col gap-2">
                                            <Skeleton className="w-[150px] h-[30px]" />
                                            <Skeleton className="w-[200px] h-[40px]" />
                                            <Skeleton className="w-[100px] h-[20px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : companies.length > 0 ? (
                            <div className="flex flex-col gap-4 w-full">
                                {companies.map((company, index) => (
                                    <Link key={index} href={`/company/${company.id}`}>
                                        <div
                                            className="flex py-1 items-center gap-4 rounded-lg transition-all duration-500 hover:bg-gray-50 hover:shadow-lg cursor-pointer"
                                        >
                                            <img
                                                src={
                                                    company.logoName
                                                        ? `http://localhost:8080/uploads/company-logos/${company.logoName}`
                                                        : "https://via.placeholder.com/200x200"
                                                }
                                                alt="Company logo"
                                                className="rounded-md w-26 h-26 object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <h4
                                                    className="text-[25px] font-medium -mt-1 text-gray-800"
                                                    style={{
                                                        maxWidth: "200px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {company.title}
                                                </h4>
                                                <p
                                                    className="text-gray-600 text-[14.5px]"
                                                    style={{
                                                        maxWidth: "200px",
                                                        wordBreak: "break-word",
                                                        display: "-webkit-box",
                                                        WebkitBoxOrient: "vertical",
                                                        WebkitLineClamp: 2,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {company.description}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1 text-gray-500">
                                                    <CalendarDays strokeWidth={2.5} className="w-3 h-3" />
                                                    <span className="text-[13.5px]">
                                                        {format(new Date(company.createdAt), "MMMM d, yyyy")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
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
                                        !isClicked && "group-hover:left-15 group-hover:top-5",
                                        isClicked && "left-0 top-0"
                                    )}
                                >
                                    <span className="w-8 h-3 bg-foreground/50 rounded-r-md rounded-tl-2xl" />
                                    <span className="w-2 h-8 bg-foreground/50 rounded-b-md" />
                                </span>
                                <span
                                    className={cn(
                                        "z-10 absolute right-0 top-0 w-8 h-8 flex flex-col items-end transition-all duration-300",
                                        !isClicked && "group-hover:right-15 group-hover:top-5",
                                        isClicked && "right-0 top-0"
                                    )}
                                >
                                    <span className="w-8 h-3 bg-foreground/50 rounded-l-md rounded-tr-2xl" />
                                    <span className="w-2 h-8 bg-foreground/50 rounded-b-md" />
                                </span>
                                <span
                                    className={cn(
                                        "z-10 absolute left-0 bottom-0 w-8 h-8 flex flex-col justify-end transition-all duration-300",
                                        !isClicked && "group-hover:left-15 group-hover:bottom-5",
                                        isClicked && "left-0 bottom-0"
                                    )}
                                >
                                    <span className="w-2 h-8 bg-foreground/50 rounded-t-md" />
                                    <span className="w-8 h-3 bg-foreground/50 rounded-r-md rounded-bl-2xl" />
                                </span>
                                <span
                                    className={cn(
                                        "z-10 absolute right-0 bottom-0 w-8 h-8 flex flex-col items-end justify-end transition-all duration-300",
                                        !isClicked && "group-hover:right-15 group-hover:bottom-5",
                                        isClicked && "right-0 bottom-0"
                                    )}
                                >
                                    <span className="w-2 h-8 bg-foreground/50 rounded-t-md" />
                                    <span className="w-8 h-3 bg-foreground/50 rounded-l-md rounded-br-2xl" />
                                </span>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div
                                        className="absolute left-15 top-5 right-15 bottom-5 group-hover:bg-gray-100 rounded-md pointer-events-auto z-0 overflow-hidden"
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

            <ManageCompanyModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsClicked(false);
                    setEditingCompany(null);
                }}
                onCompanyCreated={handleCompanyCreated}
                onCompanyUpdated={handleCompanyUpdated}
                editingCompany={editingCompany}
            />
        </>
    );
}