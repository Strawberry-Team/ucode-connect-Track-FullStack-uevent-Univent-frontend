"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/lib/user";
import { showSuccessToast, showErrorToasts } from "@/lib/toast";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileForm() {
    const { user, setUser } = useAuth();
    const router = useRouter();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        profilePicture: null as File | null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Имитация прогресса загрузки аватара
    useEffect(() => {
        if (formData.profilePicture && previewUrl) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setUploadProgress(0), 500);
                }
            }, 200);
            return () => clearInterval(interval);
        }
    }, [formData.profilePicture, previewUrl]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, profilePicture: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const form = new FormData();
            form.append("firstName", formData.firstName);
            form.append("lastName", formData.lastName);
            if (formData.profilePicture) {
                form.append("profilePicture", formData.profilePicture);
            }

            const response = await api.patch("/users/me", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setUser(response.data);
            setEditMode(false);
            showSuccessToast("Profile updated successfully");
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            setFormData((prev) => ({ ...prev, profilePicture: null }));
        } catch (error: any) {
            const errors = error.response?.data?.message || "Failed to update profile";
            showErrorToasts(errors);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-background rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl dark:bg-gray-800/50">
                {/* Заголовок */}
                <h1 className="text-3xl font-bold text-foreground mb-6 animate-in fade-in-0 duration-500">
                    Your Profile
                </h1>

                {/* Аватар */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Avatar className="relative h-32 w-32 rounded-full border-2 border-background group-hover:-translate-y-1 transition-transform duration-300">
                            <AvatarImage
                                src={
                                    previewUrl ||
                                    `http://localhost:8080/uploads/avatars/${user.profilePictureName}`
                                }
                                alt={user.firstName}
                                className={cn(
                                    previewUrl && "animate-in zoom-in-50 duration-300"
                                )}
                            />
                            <AvatarFallback className="rounded-full text-4xl bg-primary/10 text-primary">
                                {user.firstName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {editMode && (
                        <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
                            <Label htmlFor="profilePicture" className="text-sm font-medium text-foreground">
                                Change Avatar
                            </Label>
                            <Input
                                id="profilePicture"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 bg-background border-foreground/10 focus:border-primary/50 focus:ring-primary/50 transition-all duration-200"
                            />
                            {uploadProgress > 0 && (
                                <div className="mt-2 h-1 bg-foreground/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Данные профиля */}
                <div className="space-y-6">
                    {editMode ? (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-background border-foreground/10 focus:border-primary/50 focus:ring-primary/50 transition-all duration-200"
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-background border-foreground/10 focus:border-primary/50 focus:ring-primary/50 transition-all duration-200"
                                    placeholder="Enter your last name"
                                />
                            </div>
                            <p className="text-xs text-foreground/60 animate-in fade-in-0 duration-300">
                                Changes will be saved instantly
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in-0 duration-300">
                            <div>
                                <Label className="text-sm font-medium text-foreground">Full Name</Label>
                                <p className="text-lg text-foreground mt-1 font-medium">
                                    {user.firstName} {user.lastName}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-foreground">Email</Label>
                                <p className="text-lg text-foreground mt-1">{user.email}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-foreground">Role</Label>
                                <p className="text-lg text-foreground mt-1 capitalize">{user.role}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-foreground">Joined</Label>
                                <p className="text-lg text-foreground mt-1">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    {editMode ? (
                        <>
                            <Button
                                onClick={handleSave}
                                disabled={!formData.firstName || !formData.lastName || isSaving}
                                className="flex-1 bg-primary/90 hover:bg-primary text-background relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-primary/30 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300 origin-center"></span>
                                {isSaving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background mr-2"></div>
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditMode(false);
                                    setFormData({
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        profilePicture: null,
                                    });
                                    if (previewUrl) {
                                        URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(null);
                                    }
                                }}
                                className="flex-1 border-foreground/20 text-foreground hover:bg-foreground/5 transition-all duration-200"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setEditMode(true)}
                            className="flex-1 bg-primary/90 hover:bg-primary text-background relative overflow-hidden group"
                        >
                            <span className="absolute inset-0 bg-primary/30 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300 origin-center"></span>
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}