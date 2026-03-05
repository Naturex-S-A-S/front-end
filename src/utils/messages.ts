import toast from "react-hot-toast";

export const alertMessageErrors = (messages: object, message: string) => {
    if (!messages) {
        toast.error(message);

        return;
    }

    const errorMessages = Object.values(messages).flat();

    if (errorMessages.length) {
        errorMessages.forEach((message: string) => {
            toast.error(message);
        });
    }
}
