export interface ModuleActionModel {
    id: number;
    moduleId: number;
    name: string;
    description: string;
    isParent: boolean;
}

export interface ModuleWithActions {
    id: number;
    name: string;
    description: string;
    actions: ModuleActionModel[];
}
