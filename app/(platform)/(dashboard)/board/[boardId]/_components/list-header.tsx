import { updateList } from "@/actions/update-list";
import { FormInput } from "@/components/form/form-input";
import { useAction } from "@/hooks/useAction";
import { List } from "@prisma/client"
import { ElementRef, useRef, useState } from "react"
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import { ListOptions } from "./list-options";

interface ListHeaderProps {
    data: List;
    onAddCard: () => void;
};

export const ListHeader = ({data, onAddCard} : ListHeaderProps) => {
    const [title, setTitle] = useState(data.title);
    const [isEditing, setIsEditing] = useState(false);

    const formRef = useRef<ElementRef<"form">>(null);
    const inputRef = useRef<ElementRef<"input">>(null);

    const { execute } = useAction(updateList, {
        onSuccess: (data) => {
            toast.success(`List renamed to "${data.title}"`);
            setTitle(data.title);
            disableEditing();
        },
        onError: (error) => {
            toast.error(error);
        }
    })

    const enableEditing = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        })
    }
    const disableEditing = () => {
        setIsEditing(false);
    }

    const onSubmit = (formData: FormData) => {
        const id = formData.get('id') as string;
        const boardId = formData.get('boardId') as string;
        const title = formData.get('title') as string;
        if (title === data.title) {
            return disableEditing();
        }

        execute({
            title,
            id,
            boardId
        });
    }

    const onKeyDown = (e:KeyboardEvent) => {
        if (e.key === 'Escape') {
            formRef.current?.requestSubmit();
        };
    }

    const onBlur = () => {
        formRef.current?.requestSubmit();
    }

    useEventListener('keydown', onKeyDown);

    return (
       <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start gap-x-2">
            {isEditing ?(
                <form 
                    ref={formRef}
                    action={onSubmit}
                    className="flex-1 px-[2px]"
                >
                    <input readOnly hidden id="id" name="id" value={data.id} />
                    <input readOnly hidden id="boardId" name="boardId" value={data.boardId} />
                    <FormInput
                        ref={inputRef}
                        onBlur={onBlur}
                        id="title"
                        placeholder="Enter a list title"
                        defaultValue={title}
                        className="text-sm px-[7px] py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition truncate bg-transparent focus:bg-white"
                    />
                </form>
            ) : (
                <div 
                    className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent"
                    onClick={enableEditing}
                >
                    {title}
                </div>
            )}
            <ListOptions
                onAddCard={onAddCard}
                data={data}
            />
        </div>
    )
}