"use client";

import {useEffect, useState} from "react";
import {format} from "date-fns";
import Link from "next/link";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import AnimatedButton from "@/components/ui/animated-button";
import CompanyManageModal from "@/components/company/company-manage-modal";
import {Building, CalendarDays} from "lucide-react";
import {useAuth} from "@/context/auth-context";
import {useCompanyStore} from "@/store/company-store";
import {companyService} from "@/service/company-service";
import {showErrorToasts} from "@/lib/toast";
import {Company} from "@/types/company";
import { BASE_COMPANY_LOGO_URL } from "@/lib/constants";

export default function CompanyCard() {
    const {user} = useAuth();
    const {companies, setCompanies, clearCompanies} = useCompanyStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompaniesData = async () => {
            if (!user?.id) {
                clearCompanies();
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const start = Date.now();
            try {
                const fetchedCompanies = await companyService.fetchCompanies(user.id);
                setCompanies(fetchedCompanies);
            } catch (error: any) {
                showErrorToasts(error.errors || ["Failed to fetch companies"]);
            }
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsLoading(false);
        };

        fetchCompaniesData();
    }, [user]);

    const handleButtonClick = () => {
        setIsClicked(true);
        setIsModalOpen(true);
        setTimeout(() => {
            setIsClicked(false);
        }, 300);
    };

    return (
        <>
            <Card className="flex h-[220px] flex-col shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardContent className="flex flex-1 flex-col">
                    <div className="border-b">
                        <CardHeader
                            className="-px-4 flex items-center justify-between text-xl font-medium text-foreground">
                            <div className="flex items-center">
                                <Building strokeWidth={2.5} className="mr-2 h-5 w-5 text-gray-500"/>
                                Company
                            </div>
                        </CardHeader>
                    </div>

                    <div className="mt-6 flex flex-1">
                        {isLoading ? (
                            <div className="flex w-full flex-col gap-4 px-2 ">
                                {Array.from({length: 1}).map((_, index) => (
                                    <div key={index} className="mt-2 flex items-center gap-4">
                                        <Skeleton className="h-26 w-26 rounded-md"/>
                                        <div className="flex flex-col gap-2">
                                            <Skeleton className="h-[30px] w-[150px]"/>
                                            <Skeleton className="h-[30px] w-[200px]"/>
                                            <Skeleton className="h-[20px] w-[100px]"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : companies.length > 0 ? (
                            <div
                                className="flex w-full flex-col gap-4 rounded-lg px-2 transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)] cursor-pointer">
                                {companies.map((company, index) => (
                                    <Link key={index} href={`/companies/${company.id}/edit`}>
                                        <div
                                            className="flex cursor-pointer items-center gap-4 rounded-lg py-1 transition-all">
                                            <img
                                                src={
                                                    company.logoName
                                                        ? `${BASE_COMPANY_LOGO_URL}${company.logoName}`
                                                        : "https://via.placeholder.com/200x200"
                                                }
                                                alt="Company logo"
                                                className="h-26 w-26 mt-0.5 rounded-md object-cover"
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
                                                    className="text-[14.5px] text-gray-600"
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
                                                <div className="mt-1 flex items-center gap-1 text-gray-500">
                                                    <CalendarDays strokeWidth={2.5} className="h-3 w-3"/>
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
                            <AnimatedButton
                                title="Create company"
                                onClick={handleButtonClick}
                                isClicked={isClicked}
                                setIsClicked={setIsClicked}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <CompanyManageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingCompany={null}
            />
        </>
    );
}
