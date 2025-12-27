import { useEffect, useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import apiService from "../../services/apiService";
import { useToast } from "../../components/ToastService";

interface PermissionRow {
  moduleId: number;
  moduleName: string;
  actionId: number;
  actionName: string;
  isParent?: boolean;
  userPermissions: Record<number, boolean>; // key = userId
  isFirst?: boolean;
  rowCount?: number;
}

interface User {
  id: number;
  username: string;
}

export default function RoleMapping() {
  const { showSuccess, showError } = useToast();

  const [data, setData] = useState<PermissionRow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<PermissionRow[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/Users/getactionmappings");

      if (!res.status) {
        showError(res.message);
        return;
      }

      const modules = res.modules; // module list
      const actions = res.actions; // action + user-permission rows

      // 1️⃣ Extract unique users
      const userMap = new Map<number, User>();
      actions.forEach((row: any) => {
        if (row.id && !userMap.has(row.id)) {
          userMap.set(row.id, { id: row.id, username: row.username });
        }
      });
      const apiUsers: User[] = Array.from(userMap.values());
      setUsers(apiUsers);

      // 2️⃣ Group actions by actionId (each action has multiple rows for each user)
      const actionMap = new Map<number, any[]>();
      actions.forEach((row: any) => {
        if (!actionMap.has(row.actionId)) actionMap.set(row.actionId, []);
        actionMap.get(row.actionId)!.push(row);
      });

      // 3️⃣ Build PermissionRow[]
      const mapped: PermissionRow[] = [];
      actionMap.forEach((rows, actionId) => {
        const firstRow = rows[0];
        const module = modules.find((m: any) => m.id === firstRow.moduleId);

        // map user permissions
        const userPermissions: Record<number, boolean> = {};
        rows.forEach((r) => {
          if (r.id) userPermissions[r.id] = Boolean(r.isActive);
        });

        mapped.push({
          moduleId: firstRow.moduleId,
          moduleName: module?.name || "",
          actionId: firstRow.actionId,
          actionName: firstRow.actionName,
          isParent: firstRow.isParent,
          userPermissions,
        });
      });

      setData(mapped);
      setOriginalData(JSON.parse(JSON.stringify(mapped))); // for Clear button
    } catch (err) {
      showError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- GROUP BY MODULE ---------------- */
  const grouped = useMemo(() => {
    return data.reduce((acc, row) => {
      if (!acc[row.moduleId]) acc[row.moduleId] = [];
      acc[row.moduleId].push(row);
      return acc;
    }, {} as Record<number, PermissionRow[]>);
  }, [data]);

  /* ---------------- EXPAND / COLLAPSE ---------------- */
  const rows = useMemo(() => {
    const result: PermissionRow[] = [];
    Object.values(grouped).forEach((actions) => {
      actions.forEach((row, index) => {
        if (index === 0 || expanded[row.moduleId]) {
          result.push({
            ...row,
            isFirst: index === 0,
            rowCount: actions.length,
          });
        }
      });
    });
    return result;
  }, [grouped, expanded]);

  /* ---------------- SAVE ---------------- */
  const savePermissions = async () => {
    const payload: {
      ModuleActionId: number;
      UserId: number;
      IsActive: boolean;
    }[] = [];

    data.forEach((row) => {
      Object.entries(row.userPermissions).forEach(([userId, isAllowed]) => {
        const id = Number(userId);
        if (id > 0) {
          payload.push({
            ModuleActionId: row.actionId,
            UserId: id,
            IsActive: Boolean(isAllowed),
          });
        }
      });
    });

    if (payload.length === 0) {
      showError("No permission changes to save");
      return;
    }

    const res = await apiService.post("/Users/saveactionmappings", payload);

    if (res.status) {
      showSuccess("Permissions saved");
      setHasChanges(false);
      setOriginalData(JSON.parse(JSON.stringify(data)));
    } else {
      showError(res.message);
    }
  };

  return (
    <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
      <h2 className="mb-1 text-lg font-semibold">🛡️ Role Mapping</h2>

      <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
        <legend className="text-sm font-semibold px-2 text-gray-700">Role Mapping</legend>

        {hasChanges && (
          <div className="flex gap-2 mb-4">
            <Button
              label="Save"
              icon="pi pi-save"
              onClick={savePermissions}
              className="p-button-sm custom-xs"
            />
            <Button
              label="Clear"
              outlined
              severity="danger"
              className="p-button-sm custom-xs"
              icon="pi pi-times-circle"
              onClick={() => {
                setData(JSON.parse(JSON.stringify(originalData)));
                setHasChanges(false);
              }}
            />
          </div>
        )}

        <DataTable value={rows} loading={loading} className="rolemapping" dataKey="actionId" style={{ overflow: "auto", height: "700px" }}>
          {/* Expand / Collapse + Module-level checkbox */}
          <Column
            body={(row: PermissionRow) => {
              if (!row.isFirst) return null;

              const isExpanded = expanded[row.moduleId];
              const allCheckedForModule = grouped[row.moduleId].every((r) =>
                users.every((u) => r.userPermissions[u.id])
              );
              const partiallyCheckedForModule =
                grouped[row.moduleId].some((r) =>
                  users.some((u) => r.userPermissions[u.id])
                ) && !allCheckedForModule;

              return (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {row.rowCount! > 1 && (
                    <Button
                      icon={isExpanded ? "pi pi-angle-down" : "pi pi-angle-right"}
                      className="p-button-rounded p-button-sm"
                      style={{ width: "35px", height: "35px" }}
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [row.moduleId]: !prev[row.moduleId],
                        }))
                      }
                    />
                  )}
                  <Checkbox
                    checked={allCheckedForModule}
                    inputRef={(el) => {
                      if (el) el.indeterminate = partiallyCheckedForModule;
                    }}
                    onChange={(e) => {
                      const checked = e.checked ?? false;
                      setData((prev) =>
                        prev.map((r) =>
                          r.moduleId === row.moduleId
                            ? {
                                ...r,
                                userPermissions: users.reduce((acc, u) => {
                                  acc[u.id] = checked;
                                  return acc;
                                }, {} as Record<number, boolean>),
                              }
                            : r
                        )
                      );
                      setHasChanges(true);
                    }}
                  />
                </div>
              );
            }}
            style={{ width: 80, textAlign: "center" }}
          />

          {/* Module column */}
          <Column
            header="Module"
            body={(row: PermissionRow) => (row.isFirst ? row.moduleName : "")}
            headerStyle={{ width: 300 }}
          />

          {/* Action column */}
          <Column header="Action" field="actionName" headerStyle={{ width: 150 }} />

          {/* User checkboxes dynamically */}
          {users.map((user) => {
            const childRows = data.filter((r) => !r.isParent);
            const allChecked = childRows.every((row) => row.userPermissions[user.id]);
            const partiallyChecked = childRows.some((row) => row.userPermissions[user.id]) && !allChecked;

            return (
              <Column
                key={user.id}
                header={
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span>{user.username}</span>
                    <Checkbox
                      checked={allChecked}
                      inputRef={(el) => {
                        if (el) el.indeterminate = partiallyChecked;
                      }}
                      onChange={(e) => {
                        const checked = e.checked ?? false;
                        setData((prev) =>
                          prev.map((r) => ({
                            ...r,
                            userPermissions: {
                              ...r.userPermissions,
                              [user.id]: checked,
                            },
                          }))
                        );
                        setHasChanges(true);
                      }}
                    />
                  </div>
                }
                body={(row: PermissionRow) => {
                  const isParentRow = row.isParent;
                  let checked = row.userPermissions[user.id];

                  if (isParentRow) {
                    // parent checkbox depends on all child actions
                    const children = data.filter((r) => r.moduleId === row.moduleId && !r.isParent);
                    checked = children.every((c) => c.userPermissions[user.id]);
                  }

                  return (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <Checkbox
                        checked={checked}
                        onChange={(e) => {
                          const value = e.checked ?? false;
                          setData((prev) =>
                            prev.map((r) => {
                              if (r.actionId === row.actionId) {
                                return {
                                  ...r,
                                  userPermissions: {
                                    ...r.userPermissions,
                                    [user.id]: value,
                                  },
                                };
                              }
                              // If parent clicked, update all children
                              if (isParentRow && r.moduleId === row.moduleId && !r.isParent) {
                                return {
                                  ...r,
                                  userPermissions: {
                                    ...r.userPermissions,
                                    [user.id]: value,
                                  },
                                };
                              }
                              return r;
                            })
                          );
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  );
                }}
                style={{ textAlign: "left", width: 120 }}
              />
            );
          })}
        </DataTable>
      </fieldset>
    </div>
  );
}
