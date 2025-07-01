"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useCompanyStore } from "@/store/company-store";
import { companyService } from "@/service/company-service";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { Camera } from "lucide-react";
import { companyCreateZodSchema, companyUpdateZodSchema } from "@/zod/shemas";
import { Company, ManageCompanyModalProps } from "@/types/company";
import { BASE_COMPANY_LOGO_URL } from "@/lib/constants";

export default function CompanyManageModal({
                                               isOpen,
                                               onClose,
                                               editingCompany,
                                           }: ManageCompanyModalProps) {
    const { user } = useAuth();
    const { addCompany, updateCompany } = useCompanyStore();
    const [formData, setFormData] = useState({
        title: "",
        email: "",
        description: "",
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [companyErrors, setCompanyErrors] = useState<{
        title?: string;
        email?: string;
        description?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingCompany) {
            setFormData({
                title: editingCompany.title,
                email: editingCompany.email,
                description: editingCompany.description,
            });
            setLogoPreview(
                editingCompany.logoName
                    ? `${BASE_COMPANY_LOGO_URL}${editingCompany.logoName}`
                    : null
            );
        } else {
            setFormData({ title: "", email: "", description: "" });
            setLogoPreview(null);
        }
    }, [editingCompany]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) {
                showErrorToasts("Please upload an image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorToasts("File size should be less than 5MB");
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const companyData = {
            title: formData.title,
            email: formData.email,
            description: formData.description,
        };

        if (editingCompany) {
            const updateValidation = companyUpdateZodSchema.safeParse({
                title: formData.title,
                description: formData.description,
            });

            if (!updateValidation.success) {
                const errors = updateValidation.error.flatten().fieldErrors;
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
        } else {
            const createValidation = companyCreateZodSchema.safeParse({
                title: formData.title,
                email: formData.email,
                description: formData.description,
            });

            if (!createValidation.success) {
                const errors = createValidation.error.flatten().fieldErrors;
                setCompanyErrors({
                    title: errors.title?.[0],
                    email: errors.email?.[0],
                    description: errors.description?.[0],
                });

                const errorMessages = Object.values(errors)
                    .filter((error): error is string[] => error !== undefined)
                    .flatMap((error) => error);
                showErrorToasts(errorMessages);
                return;
            }
        }

        setCompanyErrors({});

        if (!user?.id) return;

        setIsLoading(true);
        try {
            if (editingCompany) {
                const updatedCompany = await companyService.updateCompany(
                    editingCompany.id,
                    {
                        title: formData.title,
                        description: formData.description,
                    },
                    logoFile
                );
                updateCompany(updatedCompany);
                showSuccessToast("Company updated successfully");
            } else {
                const newCompany = await companyService.createCompany(
                    {
                        email: formData.email,
                        title: formData.title,
                        description: formData.description,
                        ownerId: user.id,
                    },
                    logoFile
                );
                addCompany(newCompany);
                showSuccessToast("Company created successfully");
            }

            setFormData({ title: "", email: "", description: "" });
            setLogoFile(null);
            setLogoPreview(null);
            setError(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onClose();
        } catch (error: any) {
            showErrorToasts(error.errors || ["Failed to save company"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ title: "", email: "", description: "" });
        setLogoFile(null);
        setLogoPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[800px] h-[500px] bg-white rounded-lg border-none shadow-lg p-0">
                <DialogTitle className="sr-only">
                    {editingCompany ? "Update Company" : "Create a New Company"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="h-full">
                    <div className="flex flex-row h-full">
                        <div className="w-[350px] flex-shrink-0">
                            <div className="relative group h-full">
                                <div
                                    className="rounded-l-md w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:brightness-75 transition-all duration-200"
                                    onClick={handleFileClick}
                                >
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className=" w-full h-full object-cover group-hover:brightness-60 transition-all duration-200"
                                        />
                                    ) : (
                                        <Camera strokeWidth={2.5} className="w-8 h-8 text-gray-500" />
                                    )}
                                </div>
                                {logoPreview && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        <Camera strokeWidth={2.5} className="text-white w-8 h-8" />
                                    </div>
                                )}
                                <input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="w-2/3 flex flex-col justify-center space-y-4 px-4">
                            <div className="space-y-2">
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Title"
                                    className="!text-[15px] w-full rounded-md"
                                    disabled={isLoading}
                                />
                            </div>

                            {!editingCompany && (
                                <div className="space-y-2">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="text"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Company Email"
                                        className="!text-[15px] w-full rounded-md"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter a brief description of the company..."
                                    className="!text-[15px] w-full rounded-md min-h-[100px]"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    !formData.title ||
                                    !formData.description ||
                                    (!editingCompany && !formData.email)
                                }
                                className="w-full"
                            >
                                {isLoading
                                    ? "Loading..."
                                    : editingCompany
                                        ? "Update Company"
                                        : "Create Company"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}