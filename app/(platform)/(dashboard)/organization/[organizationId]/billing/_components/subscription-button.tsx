"use client";

import { stripeRedirect } from "@/actions/stripe-redirect";
import { Button } from "@/components/ui/button"
import { useProModal } from "@/hooks/use-pro-modal";
import { useAction } from "@/hooks/useAction";
import { error } from "console";
import { toast } from "sonner";

interface SubsciptionButtonProps {
    isPro: boolean;
}

export const SubsciptionButton = ({isPro}: SubsciptionButtonProps) => {
    const proModal = useProModal()
    const { execute, isLoading } = useAction(stripeRedirect, {
        onSuccess: (data) => {
            window.location.href = data;
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const onClick = () => {
        if (isPro) {
            execute({});
        } else {
            proModal.onOpen();
        }
    }
    return (
        <Button
            disabled={isLoading}
            onClick={onClick}
            variant="primary"
        >
            {isPro ? "Manage subscription" : "Upgrade to pro"}
        </Button>
    )
}