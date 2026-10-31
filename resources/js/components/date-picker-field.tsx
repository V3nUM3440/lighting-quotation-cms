import {
    Calendar,
    DateField,
    DatePicker,
    FieldError,
    Label,
} from '@heroui/react';
import { parseDate } from '@internationalized/date';

type Props = {
    label: string;
    name: string;
    defaultValue?: string | null;
    error?: string;
    isRequired?: boolean;
};

export default function DatePickerField({
    label,
    name,
    defaultValue,
    error,
    isRequired,
}: Props) {
    return (
        <DatePicker
            className="w-full"
            name={name}
            defaultValue={defaultValue ? parseDate(defaultValue) : undefined}
            isRequired={isRequired}
            isInvalid={!!error}
            validationBehavior="aria"
        >
            <Label>{label}</Label>
            <DateField.Group fullWidth>
                <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                    <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>
            <FieldError>{error}</FieldError>
            <DatePicker.Popover>
                <Calendar aria-label={label}>
                    <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                        <Calendar.GridHeader>
                            {(day) => (
                                <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                            )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                            {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                            {({ year }) => (
                                <Calendar.YearPickerCell year={year} />
                            )}
                        </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                </Calendar>
            </DatePicker.Popover>
        </DatePicker>
    );
}
