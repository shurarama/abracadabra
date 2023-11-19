'use client'

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {TextField} from "@mui/material";

const columns = [
    { field: 'id', headerName: 'id', width: 70 },
    { field: 'name', headerName: 'Наименование', width: 230 }
];
const getStockById = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/stock/api/${id}`, {
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
export default async function StockIdPage({ params }) {
    const {id} = params;
    const {stockById} = await getStockById(id);
    return (
        <Container>
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    id="id"
                    label="ID"
                    defaultValue={stockById.id}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="standard"
                />
                <TextField
                    id="article"
                    label="Артикул"
                    defaultValue={stockById.article}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="filled"
                />
                <TextField
                    id="name"
                    label="Наименование"
                    defaultValue={stockById.name}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="filled"
                />
                <TextField
                    id="width"
                    label="Ширина"
                    defaultValue={stockById.width}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="filled"
                />
                <TextField
                    id="heigth"
                    label="Высота"
                    defaultValue={stockById.heigth}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="filled"
                />
                <Typography variant="body1" gutterBottom>
                    <pre>{JSON.stringify({"balance" : stockById.balance}, null, 2)}</pre>
                </Typography>
            </Box>
        </Container>
    );
}
