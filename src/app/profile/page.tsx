import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {

    // Имитация запроса компании и билетов (замени на реальные API)
    const company = null; // Пример: { name: "xPay", status: "active" }
    const tickets = [
        { id: 1, name: "Phone bill", status: "paid" },
        { id: 2, name: "Internet bill", status: "pending" },
        { id: 3, name: "House rent", status: "paid" },
        { id: 4, name: "Income tax", status: "pending" },
    ];

    return (
        <div className="bg-background p-4 sm:p-6 md:p-8">
            <ProfileForm initialCompany={company} initialTickets={tickets} />
        </div>
    );
}