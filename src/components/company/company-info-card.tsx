"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Save, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompanyById, updateCompany, uploadCompanyLogo } from "@/lib/companies";
import { Company, CompanyInfoCardProps } from "@/types/company";
import { showSuccessToast, showErrorToasts } from "@/lib/toast";
import { format } from "date-fns";
import { companyUpdateZodSchema } from "@/zod/shemas";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_COMPANY_LOGO_URL } from "@/lib/constants";

export default function CompanyInfoCard({
                                            setEditMode,
                                            editMode,
                                            companyId,
                                        }: CompanyInfoCardProps) {
    const [company, setCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        logo: null as File | null,
    });
    const [companyErrors, setCompanyErrors] = useState<{
        title?: string;
        description?: string;
    }>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            setIsLoading(true);
            const start = Date.now();
            const result = await getCompanyById(companyId);
            if (result.success && result.data) {
                setCompany(result.data);
                setFormData({
                    title: result.data.title,
                    description: result.data.description,
                    logo: null,
                });
            } else {
                showErrorToasts(result.errors);
            }
            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsLoading(false);
        };
        fetchCompany();
    }, [companyId]);

    const imageUrl =
        previewUrl ||
        (company?.logoName
            ? `${BASE_COMPANY_LOGO_URL}${company.logoName}`
            : "https://via.placeholder.com/200x200");

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showErrorToasts("Please upload an image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorToasts("File size should be less than 5MB");
                return;
            }
            setFormData((prev) => ({ ...prev, logo: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!company) return;

        const companyData = {
            title: formData.title,
            description: formData.description,
        };
        const companyValidation = companyUpdateZodSchema.safeParse(companyData);

        if (!companyValidation.success) {
            const errors = companyValidation.error.flatten().fieldErrors;
            setCompanyErrors({
                title: errors.title?.[0],
                description: errors.description?.[0],
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }
        setCompanyErrors({});

        let updatedCompany = { ...company };

        if (
            formData.title !== company.title ||
            formData.description !== company.description
        ) {
            const updateResult = await updateCompany(company.id, {
                title: formData.title,
                description: formData.description,
            });
            if (!updateResult.success || !updateResult.data) {
                showErrorToasts(updateResult.errors);
                return;
            }
            updatedCompany = updateResult.data;
        }

        if (formData.logo) {
            const logoResult = await uploadCompanyLogo(company.id, formData.logo);
            if (!logoResult.success || !logoResult.data) {
                showErrorToasts(logoResult.errors);
                return;
            }
            updatedCompany.logoName = logoResult.data.server_filename;
        }

        setCompany(updatedCompany);
        setEditMode(false);
        showSuccessToast("Company updated successfully");
        setFormData({
            title: updatedCompany.title,
            description: updatedCompany.description,
            logo: null,
        });
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setFormData({
            title: company?.title || "",
            description: company?.description || "",
            logo: null,
        });
        setCompanyErrors({});
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    if (isLoading) {
        return (
            <Card className="shadow-lg transition-all duration-300 hover:shadow-xl h-[640px] flex flex-col w-full md:w-1/2">
                <CardContent className="space-y-6 flex-1">
                    <div className="flex flex-col items-center gap-4">
                        <Skeleton className="h-95 w-95 rounded-md" />
                    </div>
                    <div className=" space-y-4">
                        <div className="space-y-2">
                            <div className="text-center">
                                <Skeleton className="h-[30px] w-[200px] mx-auto" />
                                <Skeleton className="h-[20px] w-[150px] mx-auto mt-2" />
                            </div>
                            <div className="text-center space-y-2">
                                <Skeleton className="h-[20px] w-[100px] mx-auto" />
                                <Skeleton className="h-[40px] w-[250px] mx-auto" />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="-mt-1 flex flex-col sm:flex-row gap-3">
                    <Skeleton className="h-9 w-full" />
                </CardFooter>
            </Card>
        );
    }

    if (!company) {
        return <div>Company not found</div>;
    }

    return (
        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl h-[640px] flex flex-col w-full md:w-1/2">
            <CardContent className="space-y-6 flex-1">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <img
                            src={imageUrl}
                            alt={company.title}
                            className={cn(
                                "relative h-95 w-95 object-cover rounded-md",
                                editMode &&
                                "cursor-pointer group-hover:brightness-60 transition-all duration-200"
                            )}
                            onClick={() => editMode && document.getElementById("logo")?.click()}
                        />
                        {editMode && (
                            <>
                                <input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <Camera strokeWidth={2.5} className="text-white w-10 h-10" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="py-2 space-y-4 overflow-y-auto h-[130px] custom-scroll">
                    {editMode ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="text-center !text-[17px] font-medium bg-transparent border-0 border-b border-foreground/20 focus:border-primary transition-colors duration-200 rounded-none px-2 py-3 placeholder:text-foreground/40"
                                    placeholder="Company title"
                                />
                            </div>
                            <div>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="text-center !text-[17px] font-medium bg-transparent border-0 border-b border-foreground/20 focus:border-primary transition-colors duration-200 rounded-none px-2 py-3 placeholder:text-foreground/40 min-h-[100px]"
                                    placeholder="Company description"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-center">
                                <p className="-mt-5 text-[27px] font-medium mt-1">{company.title}</p>
                                <p className="text-base text-foreground/80">{company.email}</p>
                            </div>
                            <div className="text-center text-[17px]">
                                <div>
                                    <span className="font-medium">Joined:</span>{" "}
                                    {format(new Date(company.createdAt), "MMMM d, yyyy")}
                                </div>
                                <p className="text-base text-foreground/70 mt-1">{company.description}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
                {editMode ? (
                    <div className="grid grid-cols-2 w-full gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1 w-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.title}
                            className="flex-1 w-full"
                        >
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setEditMode(true)} className="w-full">
                        Edit Company
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}