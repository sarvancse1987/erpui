import React, { useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

interface User {
    id: number;
    name: string;
    role: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export default function UserList() {
    const [users] = useState<User[]>([
        { id: 1, name: "Admin User", role: "Admin", status: "ACTIVE" },
        { id: 2, name: "Manager User", role: "Manager", status: "ACTIVE" },
        { id: 3, name: "Sales User", role: "Sales", status: "SUSPENDED" },
    ]);

    const statusTemplate = (row: User) => {
        const severity =
            row.status === "ACTIVE"
                ? "success"
                : row.status === "INACTIVE"
                    ? "secondary"
                    : "warning";
        return <Tag value={row.status} severity={severity} />;
    };

    return (
        <Card title="Users Management">
            <DataTable value={users} paginator rows={5}>
                <Column field="id" header="ID" sortable style={{ width: "80px" }} />
                <Column field="name" header="Name" sortable />
                <Column field="role" header="Role" sortable />
                <Column header="Status" body={statusTemplate} />
                <Column
                    header="Action"
                    body={() => <Button icon="pi pi-pencil" text />}
                    style={{ width: "100px" }}
                />
            </DataTable>
        </Card>
    );
}
