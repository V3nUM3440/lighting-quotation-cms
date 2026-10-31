import { Avatar } from '@heroui/react';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export default function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar size="sm">
                <Avatar.Image src={user.avatar} alt={user.name} />
                <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
