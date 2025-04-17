import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {

    const tickets = [
        { id: 1, name: "Phone bill", status: "April 15, 2025" },
        { id: 2, name: "Internet bill", status: "April 15, 2025" },
        { id: 3, name: "House rent", status: "April 15, 2025" },
        { id: 4, name: "Income tax", status: "April 15, 2025" },
    ];

    return (
        <div className="bg-background p-4 sm:p-6 md:p-8">
            <ProfileForm initialTickets={tickets} />
        </div>
    );
}