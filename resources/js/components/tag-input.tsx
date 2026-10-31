import {
    Description,
    FieldError,
    Input,
    Label,
    Tag,
    TagGroup,
    TextField,
} from '@heroui/react';
import { useState } from 'react';

type Props = {
    name: string;
    label: string;
    defaultValue?: string[];
    error?: string;
};

export default function TagInput({
    name,
    label,
    defaultValue = [],
    error,
}: Props) {
    const [tags, setTags] = useState(defaultValue);
    const [value, setValue] = useState('');

    const addTag = () => {
        const tag = value.trim();

        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
        }

        setValue('');
    };

    return (
        <div className="flex flex-col gap-2">
            <TextField
                fullWidth
                value={value}
                onChange={setValue}
                validationBehavior="aria"
                isInvalid={!!error}
            >
                <Label>{label}</Label>
                <Input
                    placeholder="Type a tag and press Enter"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            addTag();
                        }
                    }}
                />
                <Description>
                    The types of products the brand manufactures or sells
                </Description>
                <FieldError>{error}</FieldError>
            </TextField>

            {tags.length > 0 && (
                <TagGroup
                    aria-label={label}
                    onRemove={(keys) =>
                        setTags(tags.filter((tag) => !keys.has(tag)))
                    }
                >
                    <TagGroup.List>
                        {tags.map((tag) => (
                            <Tag key={tag} id={tag}>
                                {tag}
                                <Tag.RemoveButton />
                            </Tag>
                        ))}
                    </TagGroup.List>
                </TagGroup>
            )}

            {tags.map((tag) => (
                <input key={tag} type="hidden" name={`${name}[]`} value={tag} />
            ))}
        </div>
    );
}
