"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { createCompany, uploadCompanyLogo, Company } from "@/lib/company";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { Camera } from "lucide-react";
import {companyZodSchema} from "@/zod/shemas";

interface CreateCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCompanyCreated: (newCompany: Company) => void;
}

export default function CreateCompanyModal({ isOpen, onClose, onCompanyCreated }: CreateCompanyModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        email: "",
        description: "",
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [companyErrors, setCompanyErrors] = useState<{
        title?: string;
        email?: string;
        description?: string;
    }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const companyValidation = companyZodSchema.safeParse(companyData);

        if (!companyValidation.success) {
            const errors = companyValidation.error.flatten().fieldErrors;
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
        setCompanyErrors({});

        if (user?.id) {
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

            setFormData({email: "", title: "", description: ""});
            setLogoFile(null);
            setError(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onClose();
        }
    };

    const handleClose = () => {
        setFormData({ email: "", title: "", description: "" });
        setLogoFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[425px] bg-white rounded-lg shadow-lg">
                <DialogTitle className="sr-only">Create a New Company</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Поле для загрузки логотипа */}
                    <div className="space-y-2 flex justify-center">
                        <div className="relative group">
                            <div
                                className="w-55 h-65 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:brightness-75 transition-all duration-200"
                                onClick={handleFileClick}
                            >
                                {logoFile ? (
                                    <img
                                        src={URL.createObjectURL(logoFile)}
                                        alt="Logo preview"
                                        className="w-full h-full object-cover group-hover:brightness-60 transition-all duration-200"
                                    />
                                ) : (
                                    <Camera strokeWidth={2.5} className="w-8 h-8 text-gray-500" />
                                )}
                            </div>
                            {/* Показываем белую иконку камеры при наведении, только если есть файл */}
                            {logoFile && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <Camera strokeWidth={2.5} className="text-white w-8 h-8" />
                                </div>
                            )}
                            {/* Скрытый инпут для выбора файла */}
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

                    {/* Поле для Title */}
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

                    {/* Поле для Email */}
                    <div className="space-y-2">
                        <Input
                            id="email"
                            name="email"
                            type="text"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="!text-[15px] w-full rounded-md"

                        />
                    </div>

                    {/* Поле для Description */}
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

                    {/* Кнопка отправки */}
                    <Button
                        type="submit"
                        disabled={!formData.title || !formData.email || !formData.description}
                        className="w-full"
                    >
                       Create Company
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}