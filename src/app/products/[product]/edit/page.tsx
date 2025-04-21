import EventForm from "@/components/event/event-form";

export default async function CompanyPage({
                                              params,
                                          }: {
    params: Promise<{ product: string }>;
}) {
    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.product, 10);

    return (
        <div className="bg-background p-4 sm:p-6 md:p-8">
            <EventForm eventId={eventId} />
        </div>
    );
}