import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {

    return (
        <div className="min-h-screen bg-background flex items-start justify-center p-4 sm:p-6 md:p-8">
            <ProfileForm />
        </div>
    );
}