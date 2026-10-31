import { Button, Dropdown, Label, Separator } from '@heroui/react';
import { router, usePage } from '@inertiajs/react';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import UserInfo from '@/components/user-info';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';

export default function NavUser() {
    const { auth } = usePage().props;

    const logOut = () => {
        router.flushAll();
        router.visit(logout());
    };

    return (
        <Dropdown>
            <Button
                variant="ghost"
                className="h-auto w-full justify-start p-2"
                data-test="sidebar-menu-button"
            >
                <UserInfo user={auth.user} />
                <ChevronsUpDown className="ml-auto size-4" />
            </Button>
            <Dropdown.Popover className="min-w-56">
                <div className="flex items-center gap-2 p-2">
                    <UserInfo user={auth.user} showEmail />
                </div>
                <Separator />
                <Dropdown.Menu>
                    <Dropdown.Item
                        id="settings"
                        textValue="Settings"
                        href={edit().url}
                    >
                        <Settings className="size-4" />
                        <Label>Settings</Label>
                    </Dropdown.Item>
                    <Dropdown.Item
                        id="logout"
                        textValue="Log out"
                        onAction={logOut}
                        data-test="logout-button"
                    >
                        <LogOut className="size-4" />
                        <Label>Log out</Label>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
