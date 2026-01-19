
export function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <h3 className="text-muted-foreground font-medium mb-2">Total Sales</h3>
                    <p className="text-3xl font-bold">$12,345.00</p>
                </div>
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <h3 className="text-muted-foreground font-medium mb-2">Orders Today</h3>
                    <p className="text-3xl font-bold">142</p>
                </div>
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <h3 className="text-muted-foreground font-medium mb-2">Active Staff</h3>
                    <p className="text-3xl font-bold">4</p>
                </div>
            </div>
        </div>
    )
}
