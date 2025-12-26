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

      const modules = res.modules;
      const actions = res.actions;

      const userresponse = await apiService.get("/Users");
      const apiUsers = userresponse ?? [];

      setUsers(apiUsers);

      const mapped: PermissionRow[] = actions
        .filter((a: any) => !a.isParent)
        .map((a: any) => {
          const module = modules.find((m: any) => m.id === a.moduleId);
          // Create a userPermissions object
          const userPermissions: Record<number, boolean> = {};
          apiUsers.forEach((u: any) => {
            userPermissions[u.userId] = a.userPermissions?.[u.userId] ?? false;
          });
          return {
            moduleId: a.moduleId,
            moduleName: module?.name || "",
            actionId: a.id,
            actionName: a.name,
            userPermissions,
          };
        });

      setData(mapped);
      setOriginalData(JSON.parse(JSON.stringify(mapped)));
    } catch {
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

  const savePermissions = async () => {
    const payload: {
      ModuleActionId: number;
      UserId: number;
      IsActive: boolean;
    }[] = [];

    data.forEach((row) => {
      Object.entries(row.userPermissions)
        .filter(([userId]) => {
          const id = Number(userId);
          return Number.isInteger(id) && id > 0;
        })
        .forEach(([userId, isAllowed]) => {
          payload.push({
            ModuleActionId: row.actionId,
            UserId: Number(userId),
            IsActive: Boolean(isAllowed),
          });
        });
    });

    if (payload.length === 0) {
      showError("No permission changes to save");
      return;
    }

    const res = await apiService.post("/Users/saveactionmappings", payload);

    if (res.status) {
      showSuccess("Permissions saved");
      setHasChanges(false); // reset dirty state
    } else {
      showError(res.message);
    }
  };


  return (
    <div className="p-2 h-[calc(100vh-100px)] overflow-auto">
      <h2 className="mb-1 text-lg font-semibold">🛡️ Role Mapping</h2>

      <fieldset className="border border-gray-300 rounded-md p-2 bg-white mb-2">
        <legend className="text-sm font-semibold px-2 text-gray-700">
          Role Mapping
        </legend>


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
                setData(JSON.parse(JSON.stringify(originalData))); // restore
                setHasChanges(false);
              }}
            />
          </div>
        )}

        <DataTable
          value={rows}
          loading={loading}
          className="rolemapping"
          dataKey="actionId"
          style={{ overflow: "auto", height: "700px" }}
        >
          {/* Expand / Collapse */}
          {/* Expand / Collapse + Module-level Checkbox for all users */}
          <Column
            body={(row: PermissionRow) => {
              if (!row.isFirst) return null;

              const isExpanded = expanded[row.moduleId];

              // Check if all users for all actions in this module are selected
              const allCheckedForModule = grouped[row.moduleId].every((r) =>
                users.every((u) => r.userPermissions[u.id])
              );

              const partiallyCheckedForModule =
                grouped[row.moduleId].some((r) =>
                  users.some((u) => r.userPermissions[u.id])
                ) && !allCheckedForModule;

              return (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {/* Expand / Collapse button */}
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

                  {/* Module-level checkbox for all users */}
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

          {/* Module */}
          <Column
            header="Module"
            body={(row: PermissionRow) => (row.isFirst ? row.moduleName : "")}
            headerStyle={{ height: '30px', lineHeight: '30px', width: '300px' }}
          />

          {/* Action */}
          <Column header="Action" field="actionName" headerStyle={{ width: '100px' }} />

          {/* Users dynamically */}
          {users.map((user) => {
            // Calculate if all rows for this user are selected
            const allChecked = data.every(row => row.userPermissions[user.id]);
            const partiallyChecked = data.some(row => row.userPermissions[user.id]) && !allChecked;

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
                body={(row: PermissionRow) => (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <Checkbox
                      checked={row.userPermissions[user.id]}
                      onChange={(e) => {
                        const checked = e.checked ?? false;
                        setData((prev) =>
                          prev.map((r) =>
                            r.actionId === row.actionId
                              ? {
                                ...r,
                                userPermissions: {
                                  ...r.userPermissions,
                                  [user.id]: checked,
                                },
                              }
                              : r
                          )
                        );
                        setHasChanges(true);
                      }}
                    />
                  </div>
                )}
                style={{ textAlign: "left", width: 120 }}
              />
            );
          })}

        </DataTable>
      </fieldset>
    </div>
  );
}
