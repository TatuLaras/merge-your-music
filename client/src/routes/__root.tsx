import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
    component: () => (
        <>
            {/* Static banner etc here */}
            <Outlet />
        </>
    ),
});
