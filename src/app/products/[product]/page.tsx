import LogoImage from "@/assets/logo_white.png";
import TicketActions from "@/components/card/TicketActions";

export default function PageCard({ params }: { params: { product: string } }) {
    const id = parseInt(params.product, 10); // Используем params.product
    const ticketData = {
        title: `Ticket ${id}`,
        date: "March 16th, 2025 10:00",
        description: `Hello everyone, I invite you to my cool concert, I'm waiting for everyone ${id}`,
        price: `${id * 10}.00 - ${id * 20}.00 $`,
        image: LogoImage.src,
    };

    if (isNaN(id) || id < 1) {
        return <div className="px-custom py-4">Ticket not found</div>;
    }

    return (
        <div className="px-custom py-4 w-full">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0 w-full md:w-96">
                    <div
                        className="h-96 w-full bg-contain bg-center bg-no-repeat rounded-lg"
                        style={{
                            backgroundImage: `url(${ticketData.image})`,
                        }}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">{ticketData.title}</h1>
                    <p className="text-xl text-gray-600">{ticketData.date}</p>
                    <p className="text-lg text-gray-600">{ticketData.description}</p>
                    <p className="text-2xl font-semibold text-gray-900">{ticketData.price}</p>
                    {/* Передаём данные в клиентский компонент как пропсы */}
                    <TicketActions title={ticketData.title} price={ticketData.price} />
                </div>
            </div>
        </div>
    );
}