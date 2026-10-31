import type { User } from '@/types/auth';

export type ProjectRevisionItem = {
    id: number;
    product_id: number | null;
    type: string | null;
    brand_name: string;
    product_code: string;
    product_name: string;
    description: string | null;
    image_url: string | null;
    uom: string;
    currency: string;
    quantity: string;
    manufacturer_price: string;
    discount: string;
    freight: string;
    customs: string;
    exchange_rate: string;
    unit_cost: string;
    accessories: string;
    total_unit_cost: string;
    margin: string;
    unit_price: string;
    total_cost: string;
    total_price: string;
    target_price: string | null;
};

export type ApprovalStatus =
    | 'not_required'
    | 'pending'
    | 'approved'
    | 'rejected';

export type SupplierValidation = 'pending' | 'validated' | 'price_changed';

export type RevisionStage =
    | 'pending_approval'
    | 'rejected'
    | 'awaiting_validation'
    | 'price_changed'
    | 'ready_to_issue'
    | 'issued';

export type ProjectRevisionEvent = {
    id: number;
    action: string;
    note: string | null;
    created_at: string;
    user?: Pick<User, 'id' | 'name'> | null;
};

export type ProjectRevision = {
    id: number;
    number: number;
    vat_rate: string;
    validity_days: number;
    payment_terms: string | null;
    terms: string | null;
    margin_floor: string;
    approval_status: ApprovalStatus;
    approval_label: string;
    approval_note: string | null;
    approved_at: string | null;
    supplier_validation: SupplierValidation;
    supplier_validation_label: string;
    issued_at: string | null;
    issue_note: string | null;
    stage: RevisionStage;
    stage_label: string;
    created_at: string;
    prepared_by?: Pick<User, 'id' | 'name'> | null;
    approved_by?: Pick<User, 'id' | 'name'> | null;
    issued_by?: Pick<User, 'id' | 'name'> | null;
    events?: ProjectRevisionEvent[];
    items: ProjectRevisionItem[];
};

export type Project = {
    id: number;
    reference: string;
    name: string;
    inquiry_received_at: string;
    salesperson_id: number | null;
    client_name: string;
    client_address: string | null;
    client_phone: string | null;
    client_mobile: string | null;
    client_email: string | null;
    attention: string | null;
    client_reference: string | null;
    salesperson?: Pick<User, 'id' | 'name'> | null;
    revisions?: ProjectRevision[];
    latest_revision?: ProjectRevision | null;
    revisions_count?: number;
};

export type RevisionDefaults = {
    vatRate: number;
    marginFloor: number;
    exchangeRates: Record<string, number>;
    freight: number;
    customs: number;
    validity_days: number;
    payment_terms: string;
    terms: string;
};

export type ItemRow = {
    key: string;
    product_id: number;
    brand_name: string;
    product_code: string;
    product_name: string;
    uom: string;
    currency: string;
    type: string;
    quantity: string;
    manufacturer_price: string;
    discount: string;
    freight: string;
    customs: string;
    exchange_rate: string;
    accessories: string;
    margin: string;
    target_price: string;
};

export type RevisionDraft = {
    key: string;
    items: ItemRow[];
    validity_days: string;
    payment_terms: string;
    terms: string;
};
