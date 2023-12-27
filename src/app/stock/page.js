'use client'

import * as React from 'react';
import {DataGrid, GridActionsCellItem, GridRowModes, GridToolbarContainer} from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import {useEffect, useState} from "react";
import {CircularProgress} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const columns = [
    { field: 'id', headerName: 'id', width: 70 },
    { field: 'name', headerName: 'Наименование', width: 230 },
    {
        field: 'actions',
        type: 'actions',
        width: 50,
        cellClassName: 'actions',
        getActions: (params) => [
            <GridActionsCellItem
                icon={<VisibilityIcon />}
                label="Открыть"
                onClick={() => location.assign(`/stock/${params.id}`)}
            />,
        ],
    },
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

function EditToolbar(props) {
    const {rowSelectionModel} = props;

    const handleDeleteClick = () =>
    {
        fetch(`http://localhost:3000/stock/api/`, {
            cache: "no-store",
            method: 'DELETE',
            body: JSON.stringify(rowSelectionModel),
            headers: {
                'content-type': 'application/json'
            }
        }).then(() => location.reload());
    }



    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} href="/stock/new">
                Добавить позицию
            </Button>
            <Button sx={{display: rowSelectionModel.length === 0 ? 'none' : ''}} color="error" startIcon={<DoDisturbIcon />} onClick={handleDeleteClick}>
                Удалить
            </Button>
        </GridToolbarContainer>
    );
}
export default function DataTable() {
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);
    const [rows, setRows] = useState(null)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`http://localhost:3000/stock/api`, {
            cache: "no-store",
        })
            .then((res) => res.json())
            .then((data) => {
                setRows(data);
                setLoading(false);
            })
    }, []);

    if (isLoading) return <CircularProgress />

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={rows.stock}
                columns={columns}
                disableRowSelectionOnClick
                checkboxSelection
                onRowSelectionModelChange={(newRowSelectionModel) => {
                    setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 50 },
                    },
                }}
                slots={{
                    toolbar: EditToolbar,
                }}
                slotProps={{
                    toolbar: { rowSelectionModel },
                }}
            />
        </div>
    );
}