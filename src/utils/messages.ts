import toast from "react-hot-toast";

export const alertMessageErrors = (error: any, message: string) => {
    const messages = error?.response?.data?.message;

    if (!messages) {
        toast.error(message);

        return;
    }

    if (typeof messages === 'string') {
        toast.error(messages);
    }

    if (typeof messages === 'object') {
        const errorMessages = Object.values(messages).flat() as string[];

        if (errorMessages?.length) {
            errorMessages.forEach((msg: string) => {
                toast.error(msg);
            });
        }
    }
}
