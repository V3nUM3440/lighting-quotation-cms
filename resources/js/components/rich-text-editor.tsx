import { Label, ToggleButton } from '@heroui/react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';

type Props = {
    value: string;
    onChange?: (html: string) => void;
    label?: string;
    name?: string;
    error?: string;
};

export default function RichTextEditor({
    value,
    onChange,
    label,
    name,
    error,
}: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                blockquote: false,
                code: false,
                codeBlock: false,
                horizontalRule: false,
                link: false,
                strike: false,
            }),
        ],
        content: value,
        editable: !!onChange,
        editorProps: {
            attributes: {
                class: 'min-h-32 px-3 py-2 text-sm outline-none [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5',
            },
        },
        onUpdate: ({ editor }) =>
            onChange?.(editor.isEmpty ? '' : editor.getHTML()),
    });

    const active = useEditorState({
        editor,
        selector: ({ editor }) => ({
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            bulletList: editor.isActive('bulletList'),
            orderedList: editor.isActive('orderedList'),
        }),
    });

    if (!onChange) {
        return <EditorContent editor={editor} />;
    }

    const tools = [
        {
            key: 'bold',
            label: 'Bold',
            icon: Bold,
            run: () => editor.chain().focus().toggleBold().run(),
        },
        {
            key: 'italic',
            label: 'Italic',
            icon: Italic,
            run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            key: 'underline',
            label: 'Underline',
            icon: Underline,
            run: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
            key: 'bulletList',
            label: 'Bulleted list',
            icon: List,
            run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            key: 'orderedList',
            label: 'Numbered list',
            icon: ListOrdered,
            run: () => editor.chain().focus().toggleOrderedList().run(),
        },
    ] as const;

    return (
        <div className="flex flex-col gap-2">
            {label && <Label>{label}</Label>}
            <div className="rounded-xl border border-field-border bg-field focus-within:border-accent">
                <div className="flex gap-1 border-b border-field-border p-1">
                    {tools.map((tool) => (
                        <ToggleButton
                            key={tool.key}
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={tool.label}
                            isSelected={active[tool.key]}
                            onChange={tool.run}
                        >
                            <tool.icon className="size-4" />
                        </ToggleButton>
                    ))}
                </div>
                <EditorContent editor={editor} />
            </div>
            {name && <input type="hidden" name={name} value={value} />}
            {error && <p className="text-sm text-danger">{error}</p>}
        </div>
    );
}
