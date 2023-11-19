'use client'

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const columns = [
    { field: 'id', headerName: 'id', width: 70 },
    { field: 'name', headerName: 'Наименование', width: 230 }
];
const getStock = async () => {
    try {
        const res = await fetch("http://localhost:3000/stock/api", {
            cache: "no-store",
        });

        if (!res.ok) {
            console.log("Error loading topics: ", res.status);
            return {ok: false, error: res.status}
        }
        return res.json();
    } catch (error) {
        console.log("Error loading topics: ", error);
        return {ok: false, error: error.toString()}
    }
};
export default async function DataTable() {
    const rows = await getStock();
    if (rows.ok === false) {
        return (
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {rows.error}
            </Alert>
        );
    }
    else {
        return (
            <div style={{ height: '100%', width: '100%' }}>
                <DataGrid
                    rows={rows.stock}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 50 },
                        },
                    }}
                    checkboxSelection
                />
            </div>
        );
    }
}