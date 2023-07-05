import { ColDef } from "ag-grid-community";

export const gridColumnDefinitions: ColDef[] = [
    {
        field: "title",
        headerName: "Titel",
        minWidth: 100,
    },
    {
        field: "artist",
        headerName: "Interpret",
        minWidth: 100,
    },
    {
        field: "link",
        headerName: "Link",
        minWidth: 200,
    },
];
