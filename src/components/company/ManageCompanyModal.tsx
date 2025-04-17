"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { createCompany, uploadCompanyLogo, updateCompany, Company } from "@/lib/company";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { Camera } from "lucide-react";
import { companyCreateZodSchema, companyUpdateZodSchema } from "@/zod/shemas";

interface CreateCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCompanyCreated: (newCompany: Company) => void;
    onCompanyUpdated: (updatedCompany: Company) => void;
    editingCompany: Company | null;
}

export default function ManageCompanyModal({
                                               isOpen,
                                               onClose,
                                               onCompanyCreated,
                                               onCompanyUpdated,
                                               editingCompany
                                           }: CreateCompanyModalProps) {
    const { user } = useAuth();
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingCompany) {
            setFormData({
                title: editingCompany.title,
                email: editingCompany.email,
                description: editingCompany.description,
            });
            setLogoPreview(editingCompany.logoName
                ? `http://localhost:8080/uploads/company-logos/${editingCompany.logoName}`
                : null);
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

        // Разделяем валидацию в зависимости от режима
        if (editingCompany) {
            // Валидация для обновления (без email)
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
            // Валидация для создания (с email)
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

        if (editingCompany) {
            // Обновление компании
            const updateResult = await updateCompany(editingCompany.id, {
                title: formData.title,
                description: formData.description,
            });

            if (!updateResult.success || !updateResult.data) {
                showErrorToasts(updateResult.errors);
                return;
            }

            let updatedCompany = updateResult.data;

            if (logoFile) {
                const uploadResult = await uploadCompanyLogo(updatedCompany.id, logoFile);
                if (!uploadResult.success || !uploadResult.data) {
                    showErrorToasts(uploadResult.errors);
                    return;
                }
                updatedCompany.logoName = uploadResult.data.server_filename;
            }

            onCompanyUpdated(updatedCompany);
            showSuccessToast("Company updated successfully");
        } else {
            // Создание компании
            let newCompany: Company | null = null;
            const createResult = await createCompany({
                email: formData.email,
                title: formData.title,
                description: formData.description,
                ownerId: user.id,
            });

            if (!createResult.success || !createResult.data) {
                showErrorToasts(createResult.errors);
                return;
            }
            newCompany = createResult.data;

            if (logoFile) {
                const uploadResult = await uploadCompanyLogo(newCompany.id, logoFile);
                if (!uploadResult.success || !uploadResult.data) {
                    showErrorToasts(uploadResult.errors);
                    return;
                }
                newCompany.logoName = uploadResult.data.server_filename;
            }

            onCompanyCreated(newCompany);
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
            <DialogContent className="w-[425px] bg-white rounded-lg shadow-lg">
                <DialogTitle className="sr-only">
                    {editingCompany ? "Update Company" : "Create a New Company"}
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2 flex justify-center">
                        <div className="relative group">
                            <div
                                className="w-55 h-65 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:brightness-75 transition-all duration-200"
                                onClick={handleFileClick}
                            >
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-full h-full object-cover group-hover:brightness-60 transition-all duration-200"
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

                    <div className="space-y-2">
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Title"
                            className="!text-[15px] w-full rounded-md"
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
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={!formData.title || !formData.description || (!editingCompany && !formData.email)}
                        className="w-full"
                    >
                        {editingCompany ? "Update Company" : "Create Company"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}