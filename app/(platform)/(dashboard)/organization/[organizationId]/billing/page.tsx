import { checkSubscription } from "@/lib/subscription"
import { Info } from "../_components/info";
import { Separator } from "@/components/ui/separator";
import { SubsciptionButton } from "./_components/subscription-button";

const BillingPage = async () => {
    const isPro = await checkSubscription();
    return (
        <div className="w-full">
            <Info isPro={isPro} />
            <Separator className="my-2" />
            <SubsciptionButton isPro={isPro} />
        </div>
    );
}

export default BillingPage;