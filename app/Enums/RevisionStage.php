<?php

namespace App\Enums;

use Illuminate\Database\Eloquent\Builder;

enum RevisionStage: string
{
    case PendingApproval = 'pending_approval';
    case Rejected = 'rejected';
    case AwaitingValidation = 'awaiting_validation';
    case PriceChanged = 'price_changed';
    case ReadyToIssue = 'ready_to_issue';
    case Issued = 'issued';

    public function label(): string
    {
        return match ($this) {
            self::PendingApproval => 'Pending approval',
            self::Rejected => 'Rejected',
            self::AwaitingValidation => 'Awaiting supplier validation',
            self::PriceChanged => 'Price changed',
            self::ReadyToIssue => 'Ready to issue',
            self::Issued => 'Issued',
        };
    }

    /**
     * Limit a project revision query to revisions in this stage.
     *
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public function apply(Builder $query): Builder
    {
        $notIssued = fn (Builder $query) => $query->whereNull('issued_at');
        $cleared = [ApprovalStatus::NotRequired->value, ApprovalStatus::Approved->value];

        return match ($this) {
            self::Issued => $query->whereNotNull('issued_at'),
            self::PendingApproval => $notIssued($query)->where('approval_status', ApprovalStatus::Pending->value),
            self::Rejected => $notIssued($query)->where('approval_status', ApprovalStatus::Rejected->value),
            self::PriceChanged => $notIssued($query)->whereIn('approval_status', $cleared)->where('supplier_validation', SupplierValidation::PriceChanged->value),
            self::AwaitingValidation => $notIssued($query)->whereIn('approval_status', $cleared)->where('supplier_validation', SupplierValidation::Pending->value),
            self::ReadyToIssue => $notIssued($query)->whereIn('approval_status', $cleared)->where('supplier_validation', SupplierValidation::Validated->value),
        };
    }
}
