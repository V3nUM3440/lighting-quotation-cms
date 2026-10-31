import { Card, Chip, Table } from '@heroui/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { BadgePercent, CheckCircle2, FolderOpen, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Heading from '@/components/heading';
import { formatMoney } from '@/lib/pricing';
import { stageColors } from '@/lib/revisions';
import { dashboard } from '@/routes';
import { index, show } from '@/routes/projects';
import type { RevisionStage } from '@/types';

type Stats = {
    totals: {
        projects: number;
        open: number;
        issued: number;
        pipeline_value: number;
        issued_value: number;
        margin: number | null;
        brands: number;
        products: number;
    };
    stages: { id: RevisionStage; name: string; count: number }[];
    months: { month: string; enquiries: number; value: number }[];
    brands: { name: string; value: number }[];
    salespeople: {
        name: string;
        projects: number;
        issued: number;
        value: number;
    }[];
    attention: {
        id: number;
        project_id: number;
        project: string;
        client: string | null;
        quote_number: string;
        stage: RevisionStage;
        stage_label: string;
        value: number;
    }[];
};

const compact = new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const axis = {
    tick: { fill: 'var(--muted)', fontSize: 12 },
    tickLine: false,
    axisLine: false,
};

export default function Dashboard({ stats }: { stats: Stats | null }) {
    const { auth, currency } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    title={`Welcome back, ${auth.user.name}`}
                    description={
                        stats
                            ? `Project overview based on each project's latest revision. Values in ${currency}, excluding VAT.`
                            : undefined
                    }
                />

                {stats && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatTile
                                label="Open projects"
                                value={stats.totals.open.toLocaleString()}
                                detail={`${stats.totals.projects.toLocaleString()} projects in total`}
                                icon={<FolderOpen />}
                            />
                            <StatTile
                                label="Pipeline value"
                                value={`${currency} ${compact.format(stats.totals.pipeline_value)}`}
                                detail="Quotations not yet issued"
                                icon={<Wallet />}
                            />
                            <StatTile
                                label="Issued value"
                                value={`${currency} ${compact.format(stats.totals.issued_value)}`}
                                detail={`${stats.totals.issued.toLocaleString()} quotations issued`}
                                icon={<CheckCircle2 />}
                            />
                            <StatTile
                                label="Overall margin"
                                value={
                                    stats.totals.margin === null
                                        ? '—'
                                        : `${stats.totals.margin}%`
                                }
                                detail={`${stats.totals.products.toLocaleString()} products from ${stats.totals.brands.toLocaleString()} brands`}
                                icon={<BadgePercent />}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <ChartCard
                                title="Projects by status"
                                description="Where each project's latest revision is"
                            >
                                <BarList
                                    items={stats.stages.map((stage) => ({
                                        name: stage.name,
                                        value: stage.count,
                                        label: stage.count.toLocaleString(),
                                        href: index.url({
                                            query: { stages: [stage.id] },
                                        }),
                                    }))}
                                />
                            </ChartCard>

                            <ChartCard
                                title="Enquiries per month"
                                description="New projects by inquiry date, last 12 months"
                                className="lg:col-span-2"
                            >
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart
                                        data={stats.months}
                                        margin={{ top: 8, right: 8, left: -16 }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="var(--separator)"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            {...axis}
                                            tickFormatter={(month: string) =>
                                                month.slice(0, 3)
                                            }
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            {...axis}
                                        />
                                        <Tooltip
                                            cursor={{
                                                fill: 'var(--surface-secondary)',
                                            }}
                                            content={(props) => (
                                                <ChartTooltip
                                                    {...props}
                                                    name="Enquiries"
                                                    format={(value) =>
                                                        value.toLocaleString()
                                                    }
                                                />
                                            )}
                                        />
                                        <Bar
                                            dataKey="enquiries"
                                            fill="var(--chart)"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={24}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <ChartCard
                                title="Quoted value per month"
                                description={`Latest revision totals by inquiry date, in ${currency}`}
                                className="lg:col-span-2"
                            >
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart
                                        data={stats.months}
                                        margin={{ top: 8, right: 8, left: -8 }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="var(--separator)"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            {...axis}
                                            tickFormatter={(month: string) =>
                                                month.slice(0, 3)
                                            }
                                        />
                                        <YAxis
                                            {...axis}
                                            tickFormatter={(value: number) =>
                                                compact.format(value)
                                            }
                                        />
                                        <Tooltip
                                            cursor={{
                                                stroke: 'var(--separator)',
                                            }}
                                            content={(props) => (
                                                <ChartTooltip
                                                    {...props}
                                                    name="Quoted value"
                                                    format={(value) =>
                                                        `${currency} ${formatMoney(value)}`
                                                    }
                                                />
                                            )}
                                        />
                                        <Area
                                            dataKey="value"
                                            type="monotone"
                                            stroke="var(--chart)"
                                            strokeWidth={2}
                                            fill="var(--chart)"
                                            fillOpacity={0.1}
                                            activeDot={{
                                                r: 4,
                                                stroke: 'var(--surface)',
                                                strokeWidth: 2,
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard
                                title="Top brands"
                                description={`Quoted value in latest revisions, in ${currency}`}
                            >
                                <BarList
                                    items={stats.brands.map((brand) => ({
                                        name: brand.name,
                                        value: brand.value,
                                        label: compact.format(brand.value),
                                    }))}
                                    empty="No quoted products yet."
                                />
                            </ChartCard>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <ChartCard
                                title="Needs attention"
                                description="Open quotations waiting on an action"
                            >
                                {stats.attention.length === 0 ? (
                                    <p className="text-sm text-muted">
                                        Nothing is waiting on an action.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-separator">
                                        {stats.attention.map((revision) => (
                                            <li key={revision.id}>
                                                <Link
                                                    href={show(
                                                        revision.project_id,
                                                    )}
                                                    className="flex items-center justify-between gap-4 py-3 hover:opacity-80"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {revision.project}
                                                        </p>
                                                        <p className="truncate text-xs text-muted">
                                                            {
                                                                revision.quote_number
                                                            }
                                                            {revision.client &&
                                                                ` · ${revision.client}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                                        <Chip
                                                            size="sm"
                                                            color={
                                                                stageColors[
                                                                    revision
                                                                        .stage
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                revision.stage_label
                                                            }
                                                        </Chip>
                                                        <span className="text-xs text-muted tabular-nums">
                                                            {currency}{' '}
                                                            {formatMoney(
                                                                revision.value,
                                                            )}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </ChartCard>

                            <ChartCard
                                title="Salespeople"
                                description="Projects and quoted value per salesperson"
                            >
                                <Table>
                                    <Table.ScrollContainer>
                                        <Table.Content aria-label="Salespeople">
                                            <Table.Header>
                                                <Table.Column isRowHeader>
                                                    Salesperson
                                                </Table.Column>
                                                <Table.Column className="text-end">
                                                    Projects
                                                </Table.Column>
                                                <Table.Column className="text-end">
                                                    Issued
                                                </Table.Column>
                                                <Table.Column className="text-end">
                                                    Value ({currency})
                                                </Table.Column>
                                            </Table.Header>
                                            <Table.Body
                                                renderEmptyState={() => (
                                                    <p className="p-4 text-center text-sm text-muted">
                                                        No projects yet.
                                                    </p>
                                                )}
                                            >
                                                {stats.salespeople.map(
                                                    (person) => (
                                                        <Table.Row
                                                            key={person.name}
                                                        >
                                                            <Table.Cell>
                                                                {person.name}
                                                            </Table.Cell>
                                                            <Table.Cell className="text-end tabular-nums">
                                                                {
                                                                    person.projects
                                                                }
                                                            </Table.Cell>
                                                            <Table.Cell className="text-end tabular-nums">
                                                                {person.issued}
                                                            </Table.Cell>
                                                            <Table.Cell className="text-end tabular-nums">
                                                                {formatMoney(
                                                                    person.value,
                                                                )}
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ),
                                                )}
                                            </Table.Body>
                                        </Table.Content>
                                    </Table.ScrollContainer>
                                </Table>
                            </ChartCard>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function StatTile({
    label,
    value,
    detail,
    icon,
}: {
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
}) {
    return (
        <Card>
            <Card.Content className="gap-1">
                <div className="flex items-center justify-between text-muted">
                    <span className="text-sm">{label}</span>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground dark:text-accent [&_svg]:size-4">
                        {icon}
                    </span>
                </div>
                <p className="font-heading text-2xl font-semibold">{value}</p>
                <p className="text-xs text-muted">{detail}</p>
            </Card.Content>
        </Card>
    );
}

function ChartCard({
    title,
    description,
    className,
    children,
}: {
    title: string;
    description: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <Card className={className}>
            <Card.Header>
                <Card.Title>{title}</Card.Title>
                <Card.Description>{description}</Card.Description>
            </Card.Header>
            <Card.Content>{children}</Card.Content>
        </Card>
    );
}

function BarList({
    items,
    empty,
}: {
    items: { name: string; value: number; label: string; href?: string }[];
    empty?: string;
}) {
    const max = Math.max(...items.map((item) => item.value), 1);

    if (items.length === 0) {
        return <p className="text-sm text-muted">{empty}</p>;
    }

    return (
        <ul className="space-y-3">
            {items.map((item) => {
                const content = (
                    <>
                        <div className="flex items-baseline justify-between gap-4 text-sm">
                            <span className="truncate">{item.name}</span>
                            <span className="font-medium tabular-nums">
                                {item.label}
                            </span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-surface-secondary">
                            <div
                                className="h-2 rounded-full bg-chart"
                                style={{
                                    width: `${(item.value / max) * 100}%`,
                                }}
                            />
                        </div>
                    </>
                );

                return (
                    <li key={item.name}>
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="block hover:opacity-80"
                            >
                                {content}
                            </Link>
                        ) : (
                            content
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

function ChartTooltip({
    active,
    payload,
    label,
    name,
    format,
}: {
    active?: boolean;
    payload?: readonly { value?: unknown }[];
    label?: ReactNode;
    name: string;
    format: (value: number) => string;
}) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-lg border border-separator bg-overlay px-3 py-2 text-sm shadow-md">
            <p className="text-xs text-muted">{label}</p>
            <div className="mt-1 flex items-center gap-2">
                <span className="h-0.5 w-3 rounded-full bg-chart" />
                <span className="font-semibold">
                    {format(Number(payload[0].value))}
                </span>
                <span className="text-muted">{name}</span>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
