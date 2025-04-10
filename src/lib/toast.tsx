import { toast } from "sonner";
import { CircleCheck, XCircle } from "lucide-react";

const toastStyle = {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    width: "fit-content",
    textAlign: "center" as const,
};

const capitalize = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const showSuccessToast = (message: string) => {
    toast.success(capitalize(message), {
        style: toastStyle,
        icon: <CircleCheck className="text-green-500" />,
    });
};

export const showErrorToasts = (errors: string | string[]) => {
    if (Array.isArray(errors)) {
        errors.forEach((errorMessage) => {
            toast.error(capitalize(errorMessage), {
                style: toastStyle,
                icon: <XCircle className="text-red-500" />,
            });
        });
    } else {
        toast.error(capitalize(errors), {
            style: toastStyle,
            icon: <XCircle className="text-red-500" />,
        });
    }
};