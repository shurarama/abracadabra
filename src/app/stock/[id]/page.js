'use client'

import * as React from 'react';
import Box from "@mui/material/Box";
import {CircularProgress, Stack, TextField} from "@mui/material";
import FullFeaturedCrudGrid from "@/app/stock/[id]/balanceViev";
import {useEffect, useState} from "react";
import Divider from "@mui/material/Divider";
import EditIcon from '@mui/icons-material/Edit';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import SaveIcon from '@mui/icons-material/Save';
import Button from "@mui/material/Button";

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

const updateStockById = async (id, data) => {
    try {
        const res = await fetch(`http://localhost:3000/stock/api/${id}`, {
            cache: "no-store",
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json'
            }
        })
        console.log(res)
        if (res.ok) {
            console.log("Yeai!")
        } else {
            console.log("Oops! Something is wrong.")
        }
        return res;
    } catch (error) {
        console.log(error)
        return {ok: false, error: error};
    }
}

export default function StockIdPage({ params }) {
    const {id} = params;
    const [data, setData] = useState(null)
    const [edit, setEdit] = useState(false)
    const [balance, setBalance] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [isNew, setNew] = useState(false)

    const handlerDescriptionChange = (event) => {
        setData({...data, [event.target.id]: event.target.value});
    }

    useEffect(() => {
        if (id !== 'new') {
            fetch(`http://localhost:3000/stock/api/${id}`, {
                cache: "no-store",
            })
                .then((res) => res.json())
                .then((data) => {
                    setData({
                        article: data.stockById.article,
                        name: data.stockById.name,
                        width: data.stockById.width,
                        heigth: data.stockById.heigth
                    })
                    setBalance(data.stockById.balance ? data.stockById.balance : [])
                    setLoading(false)
                })
        } else {
            setData({
                article: '',
                name: '',
                width: '',
                heigth: ''
            });
            setBalance([])
            setLoading(false);
            setNew(true);
        }
    }, []);

    if (isLoading) return <CircularProgress />
    // console.log(data)
    // console.log(balance)
    return (
            <Stack
                spacing={1}
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: '1ch', width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <Stack direction="row" sx={{margin: '1ch 1ch 2ch'}} spacing={1}>
                    <Button sx={{display: edit || isNew ? 'none' : ''}} variant="outlined" startIcon={<EditIcon />}
                            onClick={() => {setEdit(true)}}
                    >
                        Редактировать описание
                    </Button>
                    <Button sx={{display: !edit ? 'none' : ''}} variant="outlined" startIcon={<DoDisturbIcon />}
                            onClick={() => {setEdit(false)}} color="error"
                    >
                        Отменить
                    </Button>
                    <Button sx={{display: !edit && !isNew ? 'none' : ''}} variant="outlined" startIcon={<SaveIcon />}
                            onClick={() => {
                                setEdit(false)
                                updateStockById(id, data)
                                    .then((res) => {
                                    if (res.ok) {
                                        console.log('res: ', res);
                                        return res.json()
                                        // if (isNew) location.assign(`/stock/${res.id}`)
                                    } else { throw (res.error)}
                                    })
                                    .then((data) => {
                                        if (isNew) {
                                            location.assign(`/stock/${data.retId.id}`)
                                        }
                                    })
                            }}
                            color="success"
                    >
                        Сохранить
                    </Button>
                </Stack>
                {/*<Divider component="div" textAlign="left"/>*/}
                <Box sx={{margin: '1ch'}}>
                    <TextField
                        id="article"
                        label="Артикул"
                        defaultValue={data.article}
                        InputProps={{
                            readOnly: !edit && !isNew,
                        }}
                        variant="standard"
                        onChange={handlerDescriptionChange}
                    />
                    <TextField
                        id="name"
                        label="Наименование"
                        defaultValue={data.name}
                        InputProps={{
                            readOnly: !edit && !isNew,
                        }}
                        variant="standard"
                        onChange={handlerDescriptionChange}
                    />
                    <TextField
                        id="width"
                        label="Ширина"
                        defaultValue={data.width}
                        InputProps={{
                            readOnly: !edit && !isNew,
                        }}
                        variant="standard"
                        onChange={handlerDescriptionChange}
                    />
                    <TextField
                        id="heigth"
                        label="Высота"
                        defaultValue={data.heigth}
                        InputProps={{
                            readOnly: !edit && !isNew,
                        }}
                        variant="standard"
                        onChange={handlerDescriptionChange}
                    />
                </Box>
                <Box sx={{display: isNew ? 'none' : ''}}>
                    <Divider component="div" textAlign="left">Остаток</Divider>
                    <FullFeaturedCrudGrid id={id} rows={balance} setRows={setBalance}/>
                </Box>
            </Stack>
    );
}
