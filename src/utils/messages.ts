import toast from "react-hot-toast";

export const alertMessageErrors = (messages: object, message: string) => {
    if (!messages) {
        toast.error(message);

        return;
    }

    if (typeof messages === "string") {
        toast.error(messages);
    }

    if (typeof messages === "object") {
        const errorMessages = Object.values(messages).flat();

        if (errorMessages.length) {
            errorMessages.forEach((message: string) => {
                toast.error(message);
            });
        }
    }
}
