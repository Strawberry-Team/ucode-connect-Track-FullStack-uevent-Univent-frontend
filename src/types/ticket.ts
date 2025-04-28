export interface Ticket {
    id: number;
    eventId: number;
    title: string;
    number: string;
    price: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface TicketType {
    title: string;
    price: number;
    count: number;
}

export interface TicketTypesResponse {
    items: TicketType[];
    total: number;
}

export interface TicketsResponse {
    items: Ticket[];
    total: number;
}

export interface CreateTicketRequest {
    title: string;
    price: number;
    status: string;
    quantity: number;
}

export interface TicketActionsProps {
    eventId: number;
    eventTitle: string;
    eventType: string;
}

export interface TicketModalProps {
    eventId: string;
    eventTitle: string;
    eventType: string;
    isOpen: boolean;
    onClose: () => void;
}

export interface CreateTicketModalProps {
    eventId: number;
    isOpen: boolean;
    onClose: () => void;
    onTicketCreated: (newTickets: Ticket[]) => void;
}

export interface TicketListProps {
    eventId: string;
    onTicketQuantitiesChange: (quantities: { [typeId: string]: number }) => void;
    onTicketsLoad?: (tickets: TicketUniqueType[]) => void;
    discountPercent?: number;
}

export interface TicketSelectorProps {
    ticket: TicketUniqueType;
    onQuantityChange: (quantity: number) => void;
    discountPercent?: number;
    onReset?: () => void;
}

export type TicketsInfoCardProps = {
    eventId: number;
};

export type GroupedTicket = {
    title: string;
    price: string;
    totalQuantity: number;
    availableQuantity: number;
    soldQuantity: number;
    ticketType: TicketType;
}; 

export interface TicketUniqueType {
    id: string;
    name: string;
    price: number;
    availableCount: number;
}

export type TicketUniqueTypeResponse = {
    items: TicketUniqueType[];
    total: number;
  };