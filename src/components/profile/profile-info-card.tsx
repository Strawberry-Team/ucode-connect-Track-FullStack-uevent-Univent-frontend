"use client";

import {useState} from "react";
import {useAuth} from "@/context/auth-context";
import {updateUser, uploadAvatar} from "@/lib/user";
import {showSuccessToast, showErrorToasts} from "@/lib/toast";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Save, Camera} from "lucide-react";
import {cn} from "@/lib/utils";
import {userZodSchema} from "@/zod/shemas";
import {format} from "date-fns";

type ProfileCardProps = {
    setEditMode: (editMode: boolean) => void;
    editMode: boolean;
};

export default function ProfileInfoCard({setEditMode, editMode}: ProfileCardProps) {
    const {user, setUser} = useAuth();
    if (!user) return null
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName || "",
        profilePicture: null as File | null,
    });
    const [userErrors, setUserErrors] = useState<{
        firstName?: string;
        lastName?: string;
    }>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const imageUrl = previewUrl ||
        (user.profilePictureName
            ? `http://localhost:8080/uploads/user-avatars/${user.profilePictureName}`
            : "https://via.placeholder.com/200x200");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
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
            setFormData((prev) => ({...prev, profilePicture: file}));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
        };
        const userValidation = userZodSchema.safeParse(userData);

        if (!userValidation.success) {
            const errors = userValidation.error.flatten().fieldErrors;
            setUserErrors({
                firstName: errors.firstName?.[0],
                lastName: errors.lastName?.[0],
            });

            const errorMessages = Object.values(errors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }
        setUserErrors({});

        let updatedUser = {...user};

        if (formData.firstName !== user.firstName || formData.lastName !== (user.lastName || "")) {
            const updateData: { firstName: string; lastName?: string | null } = {
                firstName: formData.firstName,
            };
            if (formData.lastName) {
                updateData.lastName = formData.lastName;
            } else {
                updateData.lastName = null;
            }
            const userResult = await updateUser(user.id, updateData);
            if (!userResult.success || !userResult.data) {
                showErrorToasts(userResult.errors);
                return;
            }
            updatedUser = userResult.data;
        }

        if (formData.profilePicture) {
            const avatarResult = await uploadAvatar(user.id, formData.profilePicture);
            if (!avatarResult.success || !avatarResult.data) {
                showErrorToasts(avatarResult.errors);
                return;
            }
            updatedUser.profilePictureName = avatarResult.data.server_filename;
        }

        setUser(updatedUser);
        setEditMode(false);
        showSuccessToast("Profile updated successfully");
        setFormData({firstName: updatedUser.firstName, lastName: updatedUser.lastName || "", profilePicture: null});
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName || "",
            profilePicture: null,
        });
        setUserErrors({});
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    return (
        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl h-[640px] flex flex-col w-full md:w-1/2">
            <CardContent className="space-y-6 flex-1 overflow-y-auto">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <img
                            src={imageUrl}
                            alt={user.firstName}
                            className={cn(
                                "relative h-95 w-95 object-cover rounded-md",
                                editMode && "cursor-pointer group-hover:brightness-60 transition-all duration-200"
                            )}
                            onClick={() => editMode && document.getElementById("profilePicture")?.click()}
                        />
                        {editMode && (
                            <>
                                <input
                                    id="profilePicture"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <Camera strokeWidth={2.5} className="text-white w-10 h-10"/>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {editMode ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="text-center !text-[17px] font-medium bg-transparent border-0 border-b border-foreground/20 focus:border-primary transition-colors duration-200 rounded-none px-2 py-3 placeholder:text-foreground/40"
                                    placeholder="First name"
                                />
                            </div>
                            <div>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="text-center !text-[17px] font-medium bg-transparent border-0 border-b border-foreground/20 focus:border-primary transition-colors duration-200 rounded-none px-2 py-3 placeholder:text-foreground/40"
                                    placeholder="Last name"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-center">
                                <p className="-mt-5 text-[27px] font-medium">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-base text-foreground/80">{user.email}</p>
                            </div>
                            <div className="text-center text-[17px] space-y-1 pt-2">
                                <div>
                                    <span className="font-medium">Role:</span> {user.role}
                                </div>
                                <div>
                                    <span className="font-medium">Joined:</span>{" "}
                                    {format(new Date(user.createdAt), "MMMM d, yyyy")}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
                {editMode ? (
                    <div className="grid grid-cols-2 w-full gap-3">
                        <Button variant="outline" onClick={handleCancel} className="flex-1 w-full">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.firstName}
                            className="flex-1 w-full"
                        >
                            <Save className="h-4 w-4"/>
                            Save Changes
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setEditMode(true)} className="w-full">
                        Edit Profile
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}