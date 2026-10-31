import DatePickerField from '@/components/date-picker-field';
import FormField from '@/components/form-field';
import SelectField from '@/components/select-field';
import type { Project, User } from '@/types';

type Props = {
    project?: Project;
    users: Pick<User, 'id' | 'name'>[];
    errors: Partial<Record<string, string>>;
};

export default function ProjectFields({ project, users, errors }: Props) {
    const text = (
        name: keyof Project,
        label: string,
        props: { isRequired?: boolean; type?: string } = {},
    ) => (
        <FormField
            label={label}
            name={name}
            defaultValue={(project?.[name] as string | null) ?? ''}
            error={errors[name]}
            {...props}
        />
    );

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {text('reference', 'Quote number', { isRequired: true })}
                {text('name', 'Project', { isRequired: true })}
                <DatePickerField
                    label="Inquiry received at"
                    name="inquiry_received_at"
                    isRequired
                    defaultValue={project?.inquiry_received_at}
                    error={errors.inquiry_received_at}
                />
                <SelectField
                    label="Salesperson (contact)"
                    name="salesperson_id"
                    placeholder="Select a salesperson"
                    options={users}
                    defaultValue={project?.salesperson_id}
                    error={errors.salesperson_id}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {text('client_name', 'Client', { isRequired: true })}
                {text('client_address', 'Client address')}
                {text('attention', 'Attn & CC')}
                {text('client_reference', 'Ref no.')}
                {text('client_phone', 'Tel', { type: 'tel' })}
                {text('client_mobile', 'Mobile', { type: 'tel' })}
                {text('client_email', 'Email', { type: 'email' })}
            </div>
        </div>
    );
}
